import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { useSupabase } from "../../../app/providers/supabase-provider";

export default function NotificationsBell() {
  const supabase = useSupabase();
  const [count, setCount] = useState<number>(0);
  const nav = useNavigate();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const refreshCount = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const uid = user?.id;
    if (!uid) {
      setCount(0);
      return;
    }
    const { count: unread } = await supabase
      .from("notifications")
      .select("id", { head: true, count: "exact" })
      .eq("owner_id", uid)
      .eq("is_read", false);
    setCount(unread || 0);
  };

  useEffect(() => {
    refreshCount();
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) return;
      const ch = supabase
        .channel("notifications-bell")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `owner_id=eq.${uid}` },
          () => refreshCount()
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "notifications", filter: `owner_id=eq.${uid}` },
          () => refreshCount()
        )
        .subscribe();
      channelRef.current = ch;
    })();
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <button
      type="button"
      onClick={() => nav("/notifications")}
      className="relative inline-flex items-center justify-center h-9 w-9 rounded-full hover:bg-gray-100 transition"
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5 text-gray-700" />
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center text-[10px] leading-none font-semibold h-4 min-w-[16px] px-1 rounded-full bg-red-600 text-white shadow">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
