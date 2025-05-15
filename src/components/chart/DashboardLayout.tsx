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
};

export default function DashboardLayout() {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const data = allData[selectedYear] || [];

  return (
    <div className="rounded-2xl w-full">
      <Card className="p-6 shadow-xl bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Activité récente(en Euro) ({selectedYear})
          </h2>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="border border-gray-300 text-sm rounded-lg px-3 py-2 text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {Object.keys(allData)
              .sort((a, b) => parseInt(b) - parseInt(a))
              .map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
          </select>
        </div>

        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", borderColor: "#000" }}
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
            Aucune donnée pour l’année sélectionnée.
          </p>
        )}
      </Card>
    </div>
  );
}
