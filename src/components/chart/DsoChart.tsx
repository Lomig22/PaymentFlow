import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { fr } from "date-fns/locale/fr";
import { supabase } from "../../lib/supabase";
import { Clock } from "lucide-react";
import { YearPicker } from "../../components/ui/year-picker";
import { dateDiff } from "../../lib/dateDiff";
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
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    monthLabels[currentMonth]
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [dsoData, setDsoData] = useState<
    Record<string, { month: string; value: number }[]>
  >({});

  useEffect(() => {
    const fetchDSO = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Utilisateur non authentifié");

      const userEmail = user.email;

      const { data: invitedByData, error: invitedByError } = await supabase
        .from("invited_users")
        .select("invited_by")
        .eq("invited_email", userEmail);

      if (invitedByError) throw invitedByError;

      const invitedByIds = invitedByData.map((entry) => entry.invited_by);

      const allOwnerIds = [user.id, ...invitedByIds];

      const { data, error } = await supabase
        .from("receivables")
        .select("due_date, document_date, created_at")
        .in("owner_id", allOwnerIds);

      if (error) {
        console.error("Erreur lors du chargement des DSO:", error);
        return;
      }

      const getDelay = (due: string, base: string) => {
        const d1 = new Date(base);
        const d2 = new Date(due);
        const diffMs = d2.getTime() - d1.getTime();
        return Math.floor(diffMs / (1000 * 60 * 60 * 24)); // jours
      };

      const grouped: Record<number, Record<string, number[]>> = {};

      for (const item of data) {
        if (!item.due_date) continue;
        const baseDate = item.document_date || item.created_at;
        if (!baseDate) continue;

        const delay = Math.max(
          0,
          dateDiff(new Date(item.due_date), new Date())
        );
        const date = new Date(item.due_date);
        const year = date.getFullYear();
        const month = date.getMonth();
        const label = `${monthLabels[month]} ${String(year).slice(-2)}`;

        if (!grouped[year]) grouped[year] = {};
        if (!grouped[year][label]) grouped[year][label] = [];

        grouped[year][label].push(delay);
      }

      const finalData: Record<string, { month: string; value: number }[]> = {};

      Object.entries(grouped).forEach(([yearStr, months]) => {
        const year = parseInt(yearStr);
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
      setLoading(false);
    };

    fetchDSO();
  }, []);

  const handleYearChange = (date: Date | null) => {
    if (date) setSelectedYear(date.getFullYear());
  };

  const currentYearData = dsoData[selectedYear] || [];
  const nextYearData = dsoData[selectedYear + 1] || [];

  let filteredData: { month: string; value: number }[] = [];

  if (selectedMonth) {
    const startMonthIndex = monthLabels.findIndex((m) => m === selectedMonth);
    const monthsToDisplay: { year: number; monthIndex: number }[] = [];

    for (let i = 0; i <= 12; i++) {
      const monthOffset = (startMonthIndex + i) % 12;
      const yearOffset = Math.floor((startMonthIndex + i) / 12);
      monthsToDisplay.push({
        year: selectedYear - 1 + yearOffset,
        monthIndex: monthOffset,
      });
    }

    filteredData = monthsToDisplay.map(({ year, monthIndex }) => {
      const yearData = dsoData[year] || [];
      const label = `${monthLabels[monthIndex]} ${String(year).slice(-2)}`;
      const item = yearData.find((d) => d.month === label);
      return item || { month: label, value: 0 };
    });
  }

  const max = Math.max(...filteredData.map((d) => d.value || 0));

  const diff = (() => {
    if (filteredData.length < 2) return 0;
    const last = filteredData[filteredData.length - 1].value;
    const prev = filteredData[filteredData.length - 2].value;
    return last - prev;
  })();

  const isDown = diff < 0;
  const arrow = isDown ? "↓" : "↑";
  const colorClass = isDown ? "text-green-600" : "text-red-600";

  return (
    <div className="bg-white rounded-xl p-5 w-full font-semibold">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        <div className="flex items-center space-x-2 mb-2">
          <div className="bg-yellow-100 p-3 rounded-lg">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <h2 className="text-[20px] font-bold text-black mb-4 mt-4">DSO</h2>
          <div
            className={`inline-flex items-center gap-1 ${colorClass}`}
            title={`Différence entre les deux derniers mois visibles : ${Math.abs(
              diff
            )} jour(s)`}
          >
            <span className="text-sm font-semibold">{arrow}</span>
            <span className="text-sm font-medium">
              {Math.abs(diff)} jour(s)
            </span>
          </div>
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
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <span className="animate-spin border-t-4 border-blue-600 rounded-full h-8 w-8"></span>
          <p className="text-gray-600 ml-3">Chargement des données...</p>
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-500 mb-2">
            Période affichée :{" "}
            {!selectedMonth
              ? `Janvier à Décembre ${selectedYear}`
              : `${selectedMonth} ${
                  selectedYear - 1
                } → ${selectedMonth} ${selectedYear}`}
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
                      title={`Mois : ${d.month} — DSO moyen : ${d.value} jour(s)`}
                      style={{
                        height: `${(d.value / (max || 1)) * 130}px`,
                        backgroundColor: "#1E60FF",
                      }}
                    />

                    <span className="text-xs text-gray-500 mt-2 text-center whitespace-nowrap">
                      {d.month.split(" ")[0].replace(".", "")}
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
        </>
      )}
    </div>
  );
};

export default DsoChart;
