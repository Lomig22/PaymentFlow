import React from "react";

const data = [
  {
    label: "avant",
    values: [5, 3, 1],
    colors: ["#DC2626", "#8B5CF6", "#C084FC"],
  },
  {
    label: "juil. 23",
    values: [15, 25, 10],
    colors: ["#FCA5A5", "#10B981", "#C4B5FD"],
  },
  {
    label: "août. 23",
    values: [20, 30, 15],
    colors: ["#FDBA74", "#10B981", "#5EEAD4"],
  },
  {
    label: "sept. 23",
    values: [15, 20],
    colors: ["#FACC15", "#5EEAD4"],
  },
  {
    label: "oct. 23",
    values: [18, 10],
    colors: ["#FDBA74", "#C4B5FD"],
  },
  {
    label: "nov. 23",
    values: [20],
    colors: ["#C4B5FD"],
  },
];

export default function RecentActivityChart() {
  const maxHeight = 120;

  return (
    <div className="bg-white rounded-2xl p-6 w-full max-w-3xl">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">
        Mon activité récente
      </h2>
      <div className="flex items-end justify-between h-48">
        {data.map((entry, idx) => {
          const total = entry.values.reduce((a, b) => a + b, 0);

          return (
            <div key={idx} className="flex flex-col items-center w-12">
              <div className="flex flex-col-reverse gap-1 justify-end items-center h-32">
                {entry.values.map((val, i) => (
                  <div
                    key={i}
                    className="w-4 rounded-full"
                    style={{
                      height: `${(val / total) * maxHeight}px`,
                      backgroundColor: entry.colors[i],
                    }}
                  />
                ))}
              </div>
              <span className="text-xs mt-2 text-gray-600">{entry.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
