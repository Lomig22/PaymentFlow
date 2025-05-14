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
import { Card, CardContent } from "../ui/card";

const investmentData = [
  { month: "Jan", retour: 200, payes: 100, nonPayes: 100 },
  { month: "Feb", retour: 400, payes: 250, nonPayes: 150 },
  { month: "Mar", retour: 600, payes: 350, nonPayes: 250 },
  { month: "Apr", retour: 900, payes: 700, nonPayes: 200 },
  { month: "May", retour: 1100, payes: 900, nonPayes: 200 },
  { month: "Jun", retour: 1300, payes: 1200, nonPayes: 100 },
];

export default function DashboardLayout() {
  return (
    <div className="rounded-2xl w-full">
      <Card className="p-4 shadow-xl bg-white">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Retours sur investissement
        </h2>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={investmentData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", borderColor: "#ddd" }}
            />
            <Legend iconType="circle" />
            <Line
              type="monotone"
              dataKey="retour"
              stroke="#4f46e5"
              strokeWidth={3}
              name="Nombre de retours"
              dot={{ r: 5, stroke: "white", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="payes"
              stroke="#10b981"
              strokeWidth={3}
              name="Payés"
              dot={{ r: 5, stroke: "white", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="nonPayes"
              stroke="#f87171"
              strokeWidth={3}
              name="Non payés"
              dot={{ r: 5, stroke: "white", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
