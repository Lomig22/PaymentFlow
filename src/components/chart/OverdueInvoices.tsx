import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Users } from "lucide-react";
import { Link } from "react-router-dom";

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

      const sorted = Object.values(aggregated)
        .filter((d) => d.amount > 0)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 6);

      setTopDebtors(sorted);
    };

    fetchOverdues();
  }, []);

  return (
    <div className="rounded-2xl p-6 max-h-[300px] overflow-y-auto">
      <div className="flex items-center space-x-2 mb-2">
        <div className="bg-blue-100 p-3 rounded-lg">
          <Users className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">
          Principaux débiteurs
        </h2>
      </div>

      <ul className="divide-y divide-gray-200">
        {topDebtors.map((debtor, i) => {
          const url = `/clients/${debtor.code}`;
          return (
            <li key={i}>
              <Link
                to={url}
                className="flex items-center justify-between px-2 py-3 rounded-md hover:bg-blue-50 transition group"
              >
                <div>
                  <div className="text-sm font-semibold text-gray-800 group-hover:text-blue-600">
                    {debtor.name}
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-800 group-hover:text-blue-600">
                  {debtor.amount.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                    minimumFractionDigits: 0,
                  })}
                  <span className="text-gray-900 ml-4">›</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default OverdueInvoices;
