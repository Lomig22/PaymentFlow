import React from "react";

const ClientBalanceBar = () => {
  const data = [
    { label: "Échu", value: 762212, color: "#FDB58D" },
    { label: "Non-échu", value: 903909, color: "#D4DEFF" },
    { label: "Litige", value: 262455, color: "#F03C3C" },
    { label: "Promesse de paiement", value: 194192, color: "#C0F1D4" },
    { label: "Recouvrement", value: 16315, color: "#F6C752" },
    { label: "Avoirs non associés", value: -72769, color: "#DBC9FF" },
  ];

  const total = data.reduce((sum, d) => sum + Math.abs(d.value), 0);

  const format = (val) =>
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
};

export default ClientBalanceBar;
