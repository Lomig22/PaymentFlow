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
import { useState } from "react";

// --- Données
const allData = {
  2022: [
    { month: "Janvier", retour: 200 },
    { month: "Février", retour: 400 },
    { month: "Mars", retour: 600 },
    { month: "Avril", retour: 900 },
    { month: "Mai", retour: 1100 },
    { month: "Juin", retour: 1300 },
    { month: "Juillet", retour: 1400 },
    { month: "Août", retour: 1500 },
    { month: "Septembre", retour: 160 },
    { month: "Octobre", retour: 1800 },
    { month: "Novembre", retour: 190 },
    { month: "Décembre", retour: 200 },
  ],
  2023: [
    { month: "Janvier", retour: 250 },
    { month: "Février", retour: 430 },
    { month: "Mars", retour: 650 },
    { month: "Avril", retour: 920 },
    { month: "Mai", retour: 1150 },
    { month: "Juin", retour: 1350 },
    { month: "Juillet", retour: 1450 },
    { month: "Août", retour: 1550 },
    { month: "Septembre", retour: 200 },
    { month: "Octobre", retour: 1850 },
    { month: "Novembre", retour: 210 },
    { month: "Décembre", retour: 230 },
  ],
  2024: [
    { month: "Janvier", retour: 300 },
    { month: "Février", retour: 470 },
    { month: "Mars", retour: 670 },
    { month: "Avril", retour: 940 },
    { month: "Mai", retour: 1200 },
    { month: "Juin", retour: 1400 },
    { month: "Juillet", retour: 1500 },
    { month: "Août", retour: 1600 },
    { month: "Septembre", retour: 250 },
    { month: "Octobre", retour: 1900 },
    { month: "Novembre", retour: 240 },
    { month: "Décembre", retour: 260 },
  ],
  2025: [
    { month: "Janvier", retour: 320 },
    { month: "Février", retour: 480 },
    { month: "Mars", retour: 690 },
    { month: "Avril", retour: 960 },
    { month: "Mai", retour: 1250 },
    { month: "Juin", retour: 1450 },
    { month: "Juillet", retour: 1550 },
    { month: "Août", retour: 1650 },
    { month: "Septembre", retour: 300 },
    { month: "Octobre", retour: 2000 },
    { month: "Novembre", retour: 260 },
    { month: "Décembre", retour: 280 },
  ],
};

// Pour l’ordre des mois
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

// ✅ Format Y en euros
const formatEuro = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M €`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k €`;
  return `${value} €`;
};

export default function DashboardLayout() {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  const currentYearData = allData[selectedYear] || [];
  const nextYearData = allData[selectedYear + 1] || [];

  const startIndex = monthOrder.indexOf(selectedMonth);

  let filteredData: any[] = [];

  if (!selectedMonth) {
    filteredData = currentYearData.map((d) => ({ ...d, year: selectedYear }));
  } else {
    const startIndex = monthOrder.indexOf(selectedMonth);
    filteredData = [
      ...currentYearData
        .slice(startIndex)
        .map((d) => ({ ...d, year: selectedYear })),
      ...nextYearData
        .slice(0, startIndex + 1)
        .map((d) => ({ ...d, year: selectedYear + 1 })),
    ];
  }

  return (
    <div className="rounded-2xl w-full">
      <Card className="p-6 shadow-xl bg-white">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Activité (de {selectedMonth} {selectedYear} à {selectedMonth}{" "}
            {selectedYear + 1})
          </h2>
          <div className="flex gap-3">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="border border-gray-300 text-sm rounded-lg px-3 py-2 text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {Object.keys(allData)
                .map(Number)
                .sort((a, b) => b - a)
                .filter((y) => allData[y + 1]) // montrer que si année suivante existe
                .map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-300 text-sm rounded-lg px-3 py-2 text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              <YAxis
                stroke="#6b7280"
                domain={[0, 2000]}
                tickFormatter={formatEuro}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", borderColor: "#000" }}
                formatter={(value: number) => `${value} €`}
                labelFormatter={(label, payload) => {
                  const year = payload?.[0]?.payload?.year ?? "";
                  return `${label} ${year}`;
                }}
              />
              <Legend iconType="circle" />
              <Line
                type="monotone"
                dataKey="retour"
                stroke="rgb(79, 140, 255)"
                strokeWidth={3}
                name="Nombre de retours"
                dot={{ r: 5, stroke: "black", strokeWidth: 2 }}
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
