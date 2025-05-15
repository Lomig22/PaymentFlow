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
  2025: [
    { month: "Janv. 25", value: 77 },
    { month: "Févr. 25", value: 74 },
    { month: "Mars 25", value: 70 },
    { month: "Avr. 25", value: 66 },
    { month: "Mai 25", value: 61 },
    { month: "Juin 25", value: 60 },
    { month: "Juil. 25", value: 72 },
    { month: "Août 25", value: 56 },
    { month: "Sept. 25", value: 80 },
    { month: "Oct. 25", value: 74 },
    { month: "Nov. 25", value: 71 },
    { month: "Déc. 25", value: 69 },
  ],
};

const monthOrder = [
  "Janv.",
  "Févr.",
  "Mars",
  "Avr.",
  "Mai",
  "Juin",
  "Juil.",
  "Août",
  "Sept.",
  "Oct.",
  "Nov.",
  "Déc.",
];

const DsoChart = () => {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  const currentYearData = allData[selectedYear] || [];
  const nextYearData = allData[selectedYear + 1] || [];

  let filteredData: any[] = [];

  if (!selectedMonth) {
    // Afficher tous les mois de l'année sélectionnée
    filteredData = currentYearData;
  } else {
    const startIndex = monthOrder.findIndex((m) => selectedMonth.startsWith(m));
    filteredData = [
      ...currentYearData.slice(startIndex),
      ...nextYearData.slice(0, startIndex + 1),
    ];
  }

  const max = Math.max(...filteredData.map((d) => d.value || 0));

  const handleYearChange = (date: Date | null) => {
    if (date) setSelectedYear(date.getFullYear());
  };

  return (
    <div className="bg-white rounded-xl p-5 w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        <h2 className="text-gray-800 font-semibold text-lg">DSO</h2>
        <div className="flex gap-3">
          <DatePicker
            selected={new Date(selectedYear, 0)}
            onChange={handleYearChange}
            dateFormat="yyyy"
            showYearPicker
            locale="fr"
            className="border border-gray-300 text-sm rounded-md px-2 py-1"
          />

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-300 text-sm rounded-md px-2 py-1 text-gray-700 bg-gray-50"
          >
            <option value="">-- Mois (facultatif) --</option>
            {monthOrder.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-2">
        Période affichée :{" "}
        {!selectedMonth
          ? `Année ${selectedYear}`
          : `${selectedMonth} ${selectedYear} à ${selectedMonth} ${
              selectedYear + 1
            }`}
      </div>

      {filteredData.length > 0 ? (
        <div
          className="flex items-end justify-between"
          style={{ height: "160px" }}
        >
          {filteredData.map((d, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-sm text-gray-700 font-medium mb-1">
                {d.value}
              </span>
              <div
                className="w-6 rounded-md transition-all duration-300"
                style={{
                  height: `${(d.value / max) * 130}px`,
                  backgroundColor:
                    i === filteredData.length - 1 ? "#4F8CFF" : "#E0ECFF",
                }}
              />
              <span className="text-xs text-gray-500 mt-2">{d.month}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">
          Aucune donnée disponible pour la période sélectionnée.
        </p>
      )}
    </div>
  );
};

export default DsoChart;
