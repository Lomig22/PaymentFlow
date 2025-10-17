'use client';
import { useEffect, useMemo, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { fr } from "date-fns/locale";
import { Bell, Mail, CreditCard, Clock, AlertTriangle, Trash2 } from "lucide-react";
import { supabase } from "../../../src/lib/supabase/supabase";

interface NotificationRow {
  id: string;
  owner_id: string;
  type: string;
  category: string | null;
  severity: string | null;
  title: string | null;
  message: string;
  metadata: any;
  is_read: boolean;
  created_at: string;
}

const categoryMeta: Record<string, { icon: JSX.Element; label: string }> = {
  email: { icon: <Mail className="h-4 w-4 text-blue-600" />, label: "Emails" },
  payments: { icon: <CreditCard className="h-4 w-4 text-green-600" />, label: "Paiements" },
  due: { icon: <Clock className="h-4 w-4 text-orange-600" />, label: "Échéances" },
  system: { icon: <AlertTriangle className="h-4 w-4 text-red-600" />, label: "Système" },
};

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const normalizeCategory = (n: NotificationRow): string => {
    if (n.category) return n.category;
    switch (n.type) {
      case 'email_open':
        return 'email';
      case 'payment_detected':
        return 'payments';
      case 'due_soon':
        return 'due';
      case 'system_error':
        return 'system';
      default:
        return 'system';
    }
  };

  const fetchList = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    let query = supabase
      .from("notifications")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (unreadOnly) query = query.eq("is_read", false);
    const { data, error } = await query;
    if (!error) setItems((data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, unreadOnly]);

  useEffect(() => {
    let sub: any;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) return;
      const ch = supabase
        .channel("notifications-realtime")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `owner_id=eq.${uid}` },
          (payload: any) => {
            setItems((prev) => [payload.new as NotificationRow, ...prev]);
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "notifications", filter: `owner_id=eq.${uid}` },
          (payload: any) => {
            setItems((prev) => prev.map((n) => (n.id === payload.new.id ? (payload.new as NotificationRow) : n)));
          }
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "notifications", filter: `owner_id=eq.${uid}` },
          (payload: any) => {
            setItems((prev) => prev.filter((n) => n.id !== payload.old.id));
          }
        )
        .subscribe();
      channelRef.current = ch;
    })();
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, []);

  const visibleItems = useMemo(() => {
    const withCat = items.map((n) => ({ ...n, _cat: normalizeCategory(n) }));
    const filtered = withCat.filter((n) => {
      if (filter && n._cat !== filter) return false;
      if (unreadOnly && n.is_read) return false;
      return true;
    });
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [items, filter, unreadOnly]);

  const unreadCount = useMemo(() => visibleItems.filter((n) => !n.is_read).length, [visibleItems]);

  const allVisibleSelected = useMemo(
    () => visibleItems.length > 0 && visibleItems.every((n) => selectedIds.includes(n.id)),
    [visibleItems, selectedIds]
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (visibleItems.length === 0) return;
    const allSel = visibleItems.every((n) => selectedIds.includes(n.id));
    if (allSel) {
      const visibleSet = new Set(visibleItems.map((n) => n.id));
      setSelectedIds((prev) => prev.filter((id) => !visibleSet.has(id)));
    } else {
      const toAdd = visibleItems.map((n) => n.id).filter((id) => !selectedIds.includes(id));
      setSelectedIds((prev) => [...prev, ...toAdd]);
    }
  };

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Supprimer ${selectedIds.length} notification(s) ?`)) return;
    await supabase.from("notifications").delete().in("id", selectedIds);
    setItems((prev) => prev.filter((n) => !selectedIds.includes(n.id)));
    setSelectedIds([]);
    try { window.dispatchEvent(new Event('notifications:refresh')); } catch { }
  };

  const deleteOne = async (id: string) => {
    if (!window.confirm("Supprimer cette notification ?")) return;
    await supabase.from("notifications").delete().eq("id", id);
    setItems((prev) => prev.filter((n) => n.id !== id));
    setSelectedIds((prev) => prev.filter((x) => x !== id));
    try { window.dispatchEvent(new Event('notifications:refresh')); } catch { }
  };

  const markRead = async (id: string, is_read: boolean) => {
    await supabase.from("notifications").update({ is_read }).eq("id", id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read } : n)));
    // Informe le layout de rafraîchir le compteur immédiatement
    try { window.dispatchEvent(new Event('notifications:refresh')); } catch { }
  };

  const markAllRead = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true }).eq("owner_id", user.id).eq("is_read", false);
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    // Informe le layout de rafraîchir le compteur immédiatement
    try { window.dispatchEvent(new Event('notifications:refresh')); } catch { }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-600" /> Notifications
        </h1>
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAll} />
            Tout sélectionner
          </label>
          <button
            onClick={deleteSelected}
            disabled={selectedIds.length === 0}
            className={`px-3 py-1.5 rounded-md text-sm ${selectedIds.length > 0 ? "bg-red-600 text-white hover:bg-red-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            title="Supprimer la sélection"
          >
            Supprimer ({selectedIds.length})
          </button>
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className={`px-3 py-1.5 rounded-md text-sm ${unreadCount > 0 ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
          >
            Tout marquer comme lu ({unreadCount})
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setFilter(null)}
          className={`px-3 py-1.5 rounded-full text-sm ${!filter ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
        >
          Tous
        </button>
        {Object.entries(categoryMeta).map(([key, meta]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-2 ${filter === key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
          >
            {meta.icon} {meta.label}
          </button>
        ))}
        <label className="ml-auto inline-flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} />
          Non lues uniquement
        </label>
      </div>

      {loading ? (
        <div className="text-gray-500">Chargement…</div>
      ) : visibleItems.length === 0 ? (
        <div className="text-gray-500">Aucune notification.</div>
      ) : (
        <ul className="divide-y divide-gray-200 bg-white rounded-lg shadow">
          {visibleItems.map((n) => (
            <li key={n.id} className={`p-4 ${!n.is_read ? "bg-blue-50/50" : "bg-white"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(n.id)}
                    onChange={() => toggleSelect(n.id)}
                    className="mt-1"
                    aria-label="Sélectionner la notification"
                  />
                  <div className="mt-0.5">
                    {categoryMeta[normalizeCategory(n)]?.icon ? categoryMeta[normalizeCategory(n)].icon : (
                      <Bell className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div>
                    {n.title && <div className="font-semibold text-gray-800">{n.title}</div>}
                    <div className="text-gray-700 whitespace-pre-line">{n.message}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: fr })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className={`px-2 py-1 text-xs rounded-md ${n.is_read ? "bg-gray-100 text-gray-600" : "bg-green-600 text-white"}`}
                    onClick={() => markRead(n.id, !n.is_read)}
                  >
                    {n.is_read ? "Marquer non lue" : "Marquer lue"}
                  </button>
                  <button
                    className="px-2 py-1 text-xs rounded-md bg-red-50 text-red-600 hover:bg-red-100"
                    onClick={() => deleteOne(n.id)}
                    title="Supprimer"
                    aria-label="Supprimer la notification"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
