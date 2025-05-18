import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

const data = [
  { name: "Santé", value: 400 },
  { name: "Technologie", value: 300 },
  { name: "Finance", value: 300 },
  { name: "Industrie", value: 200 },
  { name: "Services", value: 100 },
];

const COLORS = ["#34d399", "#60a5fa", "#fbbf24", "#f87171", "#a78bfa"];

export default function SectorDistributionPieChart() {
  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 w-full">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Répartition des clients par secteur
      </h2>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="4"
                stdDeviation="6"
                floodColor="#888"
                floodOpacity="0.3"
              />
            </filter>
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
            filter="url(#shadow)"
            cornerRadius={8}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="#ffffff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `${value} clients`}
            contentStyle={{
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
