import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const OverdueInvoices = () => {
  const [topDebtors, setTopDebtors] = useState([]);

  useEffect(() => {
    const fetchOverdues = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("receivables")
        .select(
          `
          amount,
          paid_amount,
          client:clients(company_name, client_code)
        `
        )
        .eq("owner_id", user?.id);

      if (error) {
        console.error(
          "Erreur lors du chargement des factures en retard:",
          error
        );
        return;
      }

      // Regrouper les montants dus par client
      const aggregated = {};

      for (const rec of data) {
        const key = rec.client?.client_code;
        if (!key) continue;

        const due = rec.amount - rec.paid_amount;

        if (!aggregated[key]) {
          aggregated[key] = {
            name: rec.client.company_name,
            code: rec.client.client_code,
            amount: due,
          };
        } else {
          aggregated[key].amount += due;
        }
      }

      // Transformer en tableau et trier
      const sorted = Object.values(aggregated)
        .filter((d) => d.amount > 0)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 6); // Les 6 plus gros débiteurs

      setTopDebtors(sorted);
    };

    fetchOverdues();
  }, []);

  return (
    <div className="bg-white rounded-xl p-4">
      <h2 className="text-xl font-semibold text-gray-800">
        Principaux débiteurs
      </h2>
      <ul className="divide-y divide-gray-200">
        {topDebtors.map((debtor, i) => (
          <li key={i} className="py-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-800">
                {debtor.name}
              </div>
              <div className="text-xs text-gray-500">{debtor.code}</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm font-medium text-gray-800">
                {debtor.amount.toLocaleString("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                  minimumFractionDigits: 0,
                })}
              </div>
              <span className="text-gray-400">
                <a
                  href="http://localhost:5173/clients"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ›
                </a>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OverdueInvoices;
