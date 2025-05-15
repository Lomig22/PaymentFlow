import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
registerLocale("fr", fr);

const allData = {
  2023: [
    { month: "Janv. 23", value: 75 },
    { month: "Févr. 23", value: 72 },
    { month: "Mars 23", value: 68 },
    { month: "Avr. 23", value: 65 },
    { month: "Mai 23", value: 63 },
    { month: "Juin 23", value: 62 },
    { month: "Juil. 23", value: 73 },
    { month: "Août 23", value: 55 },
    { month: "Sept. 23", value: 82 },
    { month: "Oct. 23", value: 73 },
    { month: "Nov. 23", value: 70 },
    { month: "Déc. 23", value: 68 },
  ],
  2024: [
    { month: "Janv. 24", value: 80 },
    { month: "Févr. 24", value: 76 },
    { month: "Mars 24", value: 69 },
    { month: "Avr. 24", value: 67 },
    { month: "Mai 24", value: 63 },
    { month: "Juin 24", value: 62 },
    { month: "Juil. 24", value: 73 },
    { month: "Août 24", value: 55 },
    { month: "Sept. 24", value: 82 },
    { month: "Oct. 24", value: 73 },
    { month: "Nov. 24", value: 70 },
    { month: "Déc. 24", value: 68 },
  ],
};

const DsoChart = () => {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const data = allData[selectedYear] || [];
  const max = Math.max(...data.map((d) => d.value));

  const handleYearChange = (date: Date | null) => {
    if (date) {
      setSelectedYear(date.getFullYear());
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-gray-800 font-semibold text-lg">DSO</h2>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-500">
          Année sélectionnée : {selectedYear}
        </div>
        <DatePicker
          selected={new Date(selectedYear, 0)}
          onChange={handleYearChange}
          dateFormat="yyyy"
          showYearPicker
          locale="fr"
          className="border border-gray-300 text-sm rounded-md px-2 py-1"
        />
      </div>

      {data.length > 0 ? (
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
                  backgroundColor:
                    i === data.length - 1 ? "#4F8CFF" : "#E0ECFF",
                }}
              />
              <span className="text-xs text-gray-500 mt-2">{d.month}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">
          Aucune donnée disponible pour l’année sélectionnée.
        </p>
      )}
    </div>
  );
};

export default DsoChart;
