import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card } from "../ui/card";

const data = [
  { periode: "0-30 jours", montant: 1200 },
  { periode: "31-60 jours", montant: 950 },
  { periode: "61-90 jours", montant: 800 },
  { periode: "91+ jours", montant: 400 },
];

export default function BalanceAgeeChart() {
  return (
    <div className="rounded-2xl w-full h-full">
      <Card className="p-6 shadow-xl bg-white h-full">
        <h2 className="text-xl font-semibold text-gray-800">Balance âgée</h2>

        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="periode" stroke="#6b7280" />
            <YAxis stroke="#6b7280" tickFormatter={(v) => `${v}€`} />
            <Tooltip formatter={(value: number) => [`${value} €`, "Montant"]} />
            <Bar
              dataKey="montant"
              fill="rgb(79, 140, 255)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
