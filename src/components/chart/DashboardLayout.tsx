import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card } from "../ui/card";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale";


const monthOrder = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const formatEuro = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M €`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k €`;
  return `${value} €`;
};

export default function DashboardLayout() {
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [dataByYear, setDataByYear] = useState<Record<number, any[]>>({});

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("receivables")
        .select("due_date, amount, paid_amount")
        .eq("owner_id", user?.id);

      if (error) {
        console.error("Erreur de chargement Supabase", error);
        return;
      }

      const grouped: Record<number, any[]> = {};

      for (const item of data || []) {
        if (!item.due_date || item.amount == null) continue;

        const date = new Date(item.due_date);
        const year = date.getFullYear();
        const month = date.getMonth(); // 0 = Janvier

        const paid = item.paid_amount || 0;
        const unpaid = item.amount - paid;

        if (!grouped[year]) {
          grouped[year] = Array.from({ length: 12 }, (_, i) => ({
            month: monthOrder[i],
            paid: 0,
            unpaid: 0,
            year,
          }));
        }

        grouped[year][month].paid += paid;
        grouped[year][month].unpaid += unpaid;
      }

      setDataByYear(grouped);
    };

    fetchData();
  }, []);

  const handleYearChange = (date: Date) => {
    setSelectedYear(date.getFullYear());
  };


  const currentYearData = dataByYear[selectedYear] || [];
  const nextYearData = dataByYear[selectedYear + 1] || [];

  let filteredData: any[] = [];

  if (!selectedMonth) {
    filteredData = currentYearData;
  } else {
    const startIndex = monthOrder.indexOf(selectedMonth);
    filteredData = [
      ...currentYearData.slice(startIndex),
      ...nextYearData.slice(0, startIndex + 1),
    ];
  }

  return (
    <div className="rounded-2xl w-full h-full">
      <Card className="p-6 shadow-xl h-full bg-white">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Activité (de {selectedYear} à {selectedYear + 1})
          </h2>
          <div className="flex gap-3">
            <DatePicker
              selected={new Date(selectedYear, 0)}
              onChange={handleYearChange}
              dateFormat="yyyy"
              showYearPicker
              locale={fr}
              className="border border-gray-300 text-sm rounded-md px-2 py-1"
            />

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-300 text-sm rounded-lg px-3 py-2 text-gray-700 bg-gray-50"
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

        {filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={filteredData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" tickFormatter={formatEuro} />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", borderColor: "#000" }}
                formatter={(value: number) => formatEuro(value)}
                labelFormatter={(label, payload) => {
                  const year = payload?.[0]?.payload?.year ?? "";
                  return `${label} ${year}`;
                }}
              />
              <Legend iconType="circle" />
              <Line
                type="monotone"
                dataKey="paid"
                stroke="#4CAF50"
                strokeWidth={2}
                name="Payé"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="unpaid"
                stroke="#FF5252"
                strokeWidth={2}
                name="En attente"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-500 italic">
            Aucune donnée disponible pour la période sélectionnée.
          </p>
        )}
      </Card>
    </div>
  );
}
