import React from "react";

const DsoChart = () => {
  const data = [
    { month: "Mai 24", value: 63 },
    { month: "Juin 24", value: 62 },
    { month: "Juil. 24", value: 73 },
    { month: "Août 24", value: 55 },
    { month: "Sept. 24", value: 82 },
    { month: "Oct. 24", value: 73 },
  ];

  const max = Math.max(...data.map((d) => d.value));

  return (
    <div className="bg-white rounded-xl p-5 w-full max-w-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-800 font-semibold text-lg">DSO</h3>
        <span className="text-sm text-green-700 bg-green-100 px-2 py-1 rounded-full font-medium">
          ↓ -9 jours
        </span>
      </div>
      <div className="text-sm text-gray-500 mb-4">6 derniers mois</div>

      <div
        className="flex items-end justify-between"
        style={{ height: "160px" }}
      >
        {data.map((d, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="text-sm text-gray-700 font-medium mb-1">
              {d.value}
            </span>
            <div
              className="w-6 rounded-md transition-all duration-300"
              style={{
                height: `${(d.value / max) * 130}px`,
                backgroundColor: i === data.length - 1 ? "#4F8CFF" : "#E0ECFF",
              }}
            />
            <span className="text-xs text-gray-500 mt-2">{d.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DsoChart;
