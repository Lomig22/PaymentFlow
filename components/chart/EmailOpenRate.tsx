import React, { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { supabase } from "../../src/lib/supabase/supabase";

export default function EmailOpenRate() {
  const [totalSent, setTotalSent] = useState<number>(0);
  const [opened, setOpened] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOpenRate = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: auth } = await supabase.auth.getUser();
        const uid = auth?.user?.id;
        const email = auth?.user?.email ?? null;
        if (!uid || !email) {
          setTotalSent(0);
          setOpened(0);
          setLoading(false);
          return;
        }

        // Récupère aussi les IDs des propriétaires qui ont invité l'utilisateur
        const { data: invitedByData, error: invitedByError } = await supabase
          .from("invited_users")
          .select("invited_by")
          .eq("invited_email", email);
        if (invitedByError) throw invitedByError;
        const invitedByIds = (invitedByData || []).map((x: any) => x.invited_by);
        const allOwnerIds = [uid, ...invitedByIds];

        // 1) IDs de receivables appartenant à ces propriétaires
        const { data: recIdsRows, error: recIdsErr } = await supabase
          .from("receivables")
          .select("id")
          .in("owner_id", allOwnerIds);
        if (recIdsErr) throw recIdsErr;
        const recIds: string[] = (recIdsRows || []).map((r: any) => r.id);
        if (recIds.length === 0) {
          setTotalSent(0);
          setOpened(0);
          setLoading(false);
          return;
        }

        // 2) Rappels envoyés (email_id)
        const { data: remindersRows, error: remindersErr } = await supabase
          .from("reminders")
          .select("email_id, receivable_id")
          .in("receivable_id", recIds);
        if (remindersErr) throw remindersErr;
        const emailIds = Array.from(
          new Set(
            (remindersRows || [])
              .map((r: any) => r.email_id)
              .filter((x: any) => typeof x === "string" && x.length > 0)
          )
        );

        const totalUniqueSent = emailIds.length;
        if (totalUniqueSent === 0) {
          setTotalSent(0);
          setOpened(0);
          setLoading(false);
          return;
        }

        // 3) Ouvertures sur ces email_ids
        const { data: openRows, error: openErr } = await supabase
          .from("email_opens")
          .select("email_id")
          .in("email_id", emailIds);
        if (openErr) throw openErr;
        const openedUnique = Array.from(new Set((openRows || []).map((r: any) => r.email_id))).length;

        setTotalSent(totalUniqueSent);
        setOpened(openedUnique);
      } catch (e: any) {
        console.error("Erreur fetchOpenRate:", e);
        setError(e?.message || "Erreur lors du chargement du taux d'ouverture");
      } finally {
        setLoading(false);
      }
    };

    fetchOpenRate();
  }, []);

  const data = useMemo(() => {
    const notOpened = Math.max(0, totalSent - opened);
    return [
      { name: "Lues", value: opened },
      { name: "Non lues", value: notOpened },
    ];
  }, [opened, totalSent]);

  const percent = useMemo(() => {
    if (totalSent === 0) return 0;
    return Math.round((opened / totalSent) * 100);
  }, [opened, totalSent]);

  return (
    <div className="p-6 relative">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-[20px] font-bold text-black">Taux d'ouverture d'emails</h3>
        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
          {percent}%
        </span>
      </div>
      {error && (
        <div className="mb-2 text-sm text-red-600">{error}</div>
      )}
      {loading ? (
        <div className="h-[220px] flex items-center justify-center text-gray-500">Chargement…</div>
      ) : totalSent === 0 ? (
        <div className="h-[220px] flex items-center justify-center text-gray-500">Aucun email envoyé</div>
      ) : (
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                cornerRadius={8}
                paddingAngle={2}
              >
                {data.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={idx === 0 ? "#16a34a" : "#e5e7eb"} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any, n: any) => [v, n]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="mt-3 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: "#16a34a" }} />
          <span>Lues ({opened})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: "#e5e7eb" }} />
          <span>Non lues ({Math.max(0, totalSent - opened)})</span>
        </div>
      </div>
    </div>
  );
}
