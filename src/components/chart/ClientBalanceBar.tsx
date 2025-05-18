import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const statusColors: Record<string, string> = {
  late: "#FDB58D",
  pending: "#D4DEFF",
  legal: "#F03C3C",
  promesse: "#C0F1D4",
  // recouvrement: "#F6C752",
  // avoir: "#DBC9FF",
};

const labelMapping: Record<string, string> = {
  late: "Échu",
  pending: "Non-échu",
  legal: "Litige",
  promesse: "Promesse de paiement",
  // recouvrement: "Recouvrement",
  // avoir: "Avoirs non associés",
};

export default function ClientBalanceBar() {
  const [data, setData] = useState<
    { label: string; value: number; color: string }[]
  >([]);

  useEffect(() => {
    async function fetchData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: receivables, error } = await supabase
        .from("receivables")
        .select("status, amount, paid_amount, due_date")
        .eq("owner_id", user.id);

      if (error) {
        console.error("Erreur Supabase :", error.message);
        return;
      }

      const totals: Record<string, number> = {
        pending: 0, // Non-échu
        late: 0, // Échu
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
        <h2 className="text-gray-800 text-lg font-medium mb-1 flex items-center">
          Encours client
          <span className="ml-2 text-sm text-gray-400 cursor-pointer">ℹ️</span>
        </h2>
        <div className="text-3xl font-bold text-gray-900">
          {format(data.reduce((sum, d) => sum + d.value, 0))}
        </div>
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
