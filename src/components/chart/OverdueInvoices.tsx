import React from "react";
const OverdueInvoices = () => {
  const invoices = [
    { name: "ALSTOM", code: "001301", amount: "47 232 €" },
    { name: "COVIVIO", code: "001573", amount: "41 951 €" },
    { name: "BIOMERIEUX", code: "001467", amount: "32 523 €" },
    { name: "EIFFAGE", code: "001566", amount: "32 120 €" },
    { name: "AMUNDI", code: "000956", amount: "29 845 €" },
    { name: "BUREAU VERITAS", code: "001558", amount: "26 315 €" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h3 className="text-gray-800 font-medium mb-2">Factures échues</h3>
      <ul className="divide-y divide-gray-200">
        {invoices.map((inv, i) => (
          <li key={i} className="py-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-800">
                {inv.name}
              </div>
              <div className="text-xs text-gray-500">{inv.code}</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm font-medium text-gray-800">
                {inv.amount}
              </div>
              <span className="text-gray-400">›</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default OverdueInvoices;