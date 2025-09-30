import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Reminder } from '../types/database';

// Calcule et publie périodiquement l'état d'ouverture des emails pour une créance
export function useReminderOpenStatus(
  receivableId: string,
  setLiveReminders: (items: Reminder[]) => void,
  setOpenStatus: (status: Record<string, boolean | null>) => void
): void {
  const liveRemindersRef = useRef<Reminder[] | null>(null);
  const receivableEmailIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let interval: number | undefined;

    const refreshReminders = async () => {
      try {
        const { data, error } = await supabase
          .from('reminders')
          .select('*')
          .eq('receivable_id', receivableId)
          .order('reminder_date', { ascending: false });
        if (!cancelled && !error && data) {
          setLiveReminders(data as Reminder[]);
          liveRemindersRef.current = data as Reminder[];
        }
      } catch {}
    };

    const fetchReceivableEmailId = async () => {
      try {
        const { data } = await supabase
          .from('receivables')
          .select('email_id')
          .eq('id', receivableId)
          .single();
        receivableEmailIdRef.current = data?.email_id ?? null;
      } catch {
        receivableEmailIdRef.current = null;
      }
    };

    const fetchOpenStatus = async () => {
      const source = liveRemindersRef.current || [];
      const currentReminders = source
        .filter((r) => r.receivable_id === receivableId)
        .sort((a, b) => new Date(b.reminder_date).getTime() - new Date(a.reminder_date).getTime());
      const status: Record<string, boolean | null> = {};

      if (currentReminders.length === 0) {
        setOpenStatus(status);
        return;
      }

      // Rassembler tous les email_id disponibles (lignes + fallback créance)
      const emailIdSet = new Set<string>();
      for (const r of currentReminders) if (r.email_id) emailIdSet.add(r.email_id);
      const receivableEmailIdLocal = receivableEmailIdRef.current;
      if (receivableEmailIdLocal) emailIdSet.add(receivableEmailIdLocal);

      // Fallback: dernier email_id non nul trouvé dans la liste (le plus récent)
      const latestEmailIdLocal = currentReminders.find((r) => !!r.email_id)?.email_id || null;
      if (latestEmailIdLocal) emailIdSet.add(latestEmailIdLocal);

      const emailIds = Array.from(emailIdSet);

      // Pré-remplir "Non suivi" si aucun email_id n'est disponible nulle part
      for (const r of currentReminders) if (!r.email_id && !receivableEmailIdLocal && !latestEmailIdLocal) status[r.id] = null;

      if (emailIds.length === 0) {
        setOpenStatus(status);
        return;
      }

      // Charger les évènements d'ouverture
      let data: any[] | null = null;
      let error: any = null;
      try {
        const res = await supabase
          .from('email_opens')
          .select('email_id, opened_at')
          .in('email_id', emailIds);
        data = res.data as any[];
        error = res.error;
      } catch (e) {
        error = e;
      }
      if (error) {
        if (import.meta.env.DEV) console.warn('[open-status] select email_opens error', error);
        setOpenStatus(status);
        return;
      }

      const byId: Record<string, any[]> = {};
      for (const row of data || []) {
        const id = row.email_id as string;
        if (!byId[id]) byId[id] = [];
        byId[id].push(row);
      }

      // Seuil anti-préchargement global (Gmail, etc.)
      const thresholdMs = 20 * 1000; // 20s

      // Identifier la relance la plus récente (pour autoriser le fallback latestEmailIdLocal)
      const newestReminderId = currentReminders[0]?.id || null;

      for (const r of currentReminders) {
        const allowFallback = r.id === newestReminderId;
        const idToCheck = r.email_id || (allowFallback ? (latestEmailIdLocal || receivableEmailIdLocal) : receivableEmailIdLocal) || null;
        if (!idToCheck) {
          status[r.id] = null;
          continue;
        }
        const rows = byId[idToCheck] || [];
        if (rows.length === 0) {
          status[r.id] = false; // suivi en place mais aucun hit d'ouverture
          continue;
        }
        const sentAt = new Date(r.reminder_date).getTime();
        // Si opened_at existe, considérer "ouvert" si au moins un event est après la fenêtre de sécurité
        const hasTimedOpen = rows.some((ev: any) => {
          const openedAtMs = ev?.opened_at ? new Date(ev.opened_at).getTime() : 0;
          return openedAtMs >= sentAt + thresholdMs;
        });
        // Sinon, s'il y a des événements mais sans opened_at, on bascule en "ouvert" quand la fenêtre est passée
        const opened = hasTimedOpen || (Date.now() >= sentAt + thresholdMs);
        status[r.id] = opened;

        if (import.meta.env.DEV) {
          console.debug('[open-status] row', {
            r_id: r.id,
            sentAt,
            idToCheck,
            rowsCount: rows.length,
            hasTimedOpen,
            opened,
          });
        }
      }

      setOpenStatus(status);
    };

    const tick = async () => {
      await refreshReminders();
      await fetchReceivableEmailId();
      await fetchOpenStatus();
    };

    // Premier tick immédiat puis polling
    void tick();
    interval = window.setInterval(() => void tick(), 5000);

    return () => {
      cancelled = true;
      if (interval) window.clearInterval(interval);
    };
  }, [receivableId, setLiveReminders, setOpenStatus]);
}
