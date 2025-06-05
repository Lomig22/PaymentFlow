import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { BanknoteIcon } from "lucide-react";
const statusColors: Record<string, string> = {
  late: "#FF7F50",
  pending: "#4D6DFF",
  legal: "#FF4C4C",
  promesse: "#3CE58D",
};

const labelMapping: Record<string, string> = {
  late: "Échu",
  pending: "Non-échu",
  legal: "Litige",
  promesse: "Promesse de paiement",
};

export default function ClientBalanceBar() {
  const [data, setData] = useState<
    { label: string; value: number; color: string }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Utilisateur non authentifié");

      const userEmail = user.email;

      const { data: invitedByData, error: invitedByError } = await supabase
        .from("invited_users")
        .select("invited_by")
        .eq("invited_email", userEmail);

      if (invitedByError) throw invitedByError;

      const invitedByIds = invitedByData.map((entry) => entry.invited_by);
      const allOwnerIds = [user.id, ...invitedByIds];

      const { data: receivables, error } = await supabase
        .from("receivables")
        .select("status, amount, paid_amount, due_date")
        .in("owner_id", allOwnerIds);

      if (error) {
        console.error("Erreur Supabase :", error.message);
        return;
      }

      const totals: Record<string, number> = {
        pending: 0,
        late: 0,
        legal: 0,
        promesse: 0,
      };

      const today = new Date();
      receivables?.forEach((item) => {
        const status = item.status;
        const amount = Number(item.amount || 0);
        const paid = Number(item.paid_amount || 0);
        const dueDate = new Date(item.due_date);

        if (paid >= amount || status === "paid") return;

        if (status === "Relance préventive") {
          totals.promesse += amount - paid;
        } else if (status === "legal") {
          totals.legal += amount - paid;
        } else if (status === "late" || dueDate < today) {
          totals.late += amount - paid;
        } else if (status === "pending" || dueDate >= today) {
          totals.pending += amount - paid;
        }
      });

      const formatted = Object.entries(totals).map(([key, value]) => ({
        label: labelMapping[key] || key,
        value,
        color: statusColors[key] || "#ccc",
      }));

      setData(formatted);
      setLoading(false);
    }

    fetchData();
  }, []);

  const total = data.reduce((sum, d) => sum + Math.abs(d.value), 0);

  const format = (val: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(val);

  return (
    <div className="bg-white rounded-2xl p-6 max-w-full">
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <div className="bg-green-100 p-3 rounded-lg">
            <BanknoteIcon className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-[20px] font-bold text-black mb-4 mt-4">
            Encours client
          </h3>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <span className="animate-spin border-t-4 border-blue-600 rounded-full h-8 w-8"></span>
            <p className="text-gray-600 ml-3 font-semibold">Chargement des données...</p>
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold text-gray-900">
              {format(data.reduce((sum, d) => sum + d.value, 0))}
            </div>
          </>
        )}
      </div>

      <div className="w-full h-4 rounded-full overflow-hidden flex shadow-inner mb-6">
        {data.map((d, i) => (
          <div
            key={i}
            title={`${d.label}: ${format(d.value)}`}
            className="transition-all duration-300"
            style={{
              width: `${(Math.abs(d.value) / total) * 100}%`,
              background: `linear-gradient(to bottom, ${d.color}, ${d.color}AA)`,
            }}
          />
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-700">
        {data.map((d, i) => (
          <div key={i} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-sm shadow"
              style={{ backgroundColor: d.color }}
            />
            <span>{d.label} :</span>
            <span className="font-medium">{format(d.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
