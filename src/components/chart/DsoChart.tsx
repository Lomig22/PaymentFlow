import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
import { supabase } from "../../lib/supabase";
import { Clock } from "lucide-react";
import { YearPicker } from "../../components/ui/year-picker";
registerLocale("fr", fr);

const monthLabels = [
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
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [dsoData, setDsoData] = useState<Record<string, any[]>>({});

  useEffect(() => {
    const fetchDSO = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("receivables")
        .select("due_date, document_date, created_at")
        .eq("owner_id", user?.id);

      if (error) {
        console.error("Erreur lors du chargement des DSO:", error);
        return;
      }

      const getDelay = (due: string, base: string) => {
        const d1 = new Date(base);
        const d2 = new Date(due);
        const diffMs = d2.getTime() - d1.getTime();
        return Math.floor(diffMs / (1000 * 60 * 60 * 24));
      };

      const grouped: Record<number, { [key: string]: number[] }> = {};

      for (const item of data) {
        if (!item.due_date) continue;
        const baseDate = item.document_date || item.created_at;
        if (!baseDate) continue;

        const delay = getDelay(item.due_date, baseDate);
        const date = new Date(item.due_date);
        const year = date.getFullYear();
        const month = date.getMonth();

        const label = `${monthLabels[month]} ${String(year).slice(-2)}`;

        if (!grouped[year]) grouped[year] = {};
        if (!grouped[year][label]) grouped[year][label] = [];

        grouped[year][label].push(delay);
      }

      const finalData: Record<string, any[]> = {};

      Object.entries(grouped).forEach(([year, months]) => {
        finalData[year] = monthLabels.map((label, index) => {
          const fullLabel = `${label} ${String(year).slice(-2)}`;
          const delays = months[fullLabel] || [];
          const avg =
            delays.length > 0
              ? Math.round(delays.reduce((a, b) => a + b, 0) / delays.length)
              : 0;
          return {
            month: fullLabel,
            value: avg,
          };
        });
      });

      setDsoData(finalData);
    };

    fetchDSO();
  }, []);

  const handleYearChange = (date: Date | null) => {
    if (date) setSelectedYear(date.getFullYear());
  };

  const currentYearData = dsoData[selectedYear] || [];
  const nextYearData = dsoData[selectedYear + 1] || [];

  let filteredData: any[] = [];

  if (!selectedMonth) {
    filteredData = currentYearData;
  } else {
    const startIndex = monthLabels.findIndex((m) =>
      selectedMonth.startsWith(m)
    );
    filteredData = [
      ...currentYearData.slice(startIndex),
      ...nextYearData.slice(0, startIndex + 1),
    ];
  }

  const max = Math.max(...filteredData.map((d) => d.value || 0));

  return (
    <div className="bg-white rounded-xl p-5 w-full font-semibold">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        <div className="flex items-center space-x-2 mb-2">
          <div className="bg-yellow-100 p-3 rounded-lg">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <h2 className="text-gray-800 font-semibold text-lg">DSO</h2>
        </div>
        <div className="flex gap-3">
          <YearPicker value={selectedYear} onChange={setSelectedYear} />

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-300 text-sm rounded-md px-2 py-1 text-gray-700 bg-gray-50"
          >
            <option value="">-- Mois (facultatif) --</option>
            {monthLabels.map((month) => (
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
        <div className="overflow-x-auto w-full">
          <div
            className="flex items-end gap-4 min-w-[600px]"
            style={{ height: "180px" }}
          >
            {filteredData.map((d, i) => (
              <div
                key={i}
                className="flex flex-col items-center w-10 sm:w-12 flex-shrink-0"
              >
                <span className="text-sm text-gray-700 font-medium mb-1">
                  {d.value}
                </span>
                <div
                  className="w-full rounded-md transition-all duration-300"
                  style={{
                    height: `${(d.value / (max || 1)) * 130}px`,
                    backgroundColor:
                      i === filteredData.length - 1 ? "#4F8CFF" : "#E0ECFF",
                  }}
                />
                <span className="text-xs text-gray-500 mt-2 text-center whitespace-nowrap">
                  {d.month}
                </span>
              </div>
            ))}
          </div>
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
