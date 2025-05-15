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
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type BalanceData = {
  periode: string;
  montant: number;
};

export default function BalanceAgeeChart() {
  const [data, setData] = useState<BalanceData[]>([]);
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());

  useEffect(() => {
    async function fetchOverdueReceivables() {
      const reference = referenceDate.toISOString();

      const { data: receivables, error } = await supabase
        .from("receivables")
        .select("due_date, amount")
        .lt("due_date", reference); // uniquement les en retard

      if (error) {
        console.error("Erreur Supabase :", error.message);
        return;
      }

      const refDay = dayjs(referenceDate);
      const grouped = {
        "0-30 jours": 0,
        "31-60 jours": 0,
        "61-90 jours": 0,
        "91+ jours": 0,
      };

      receivables?.forEach((item) => {
        const dueDate = dayjs(item.due_date);
        const daysOverdue = refDay.diff(dueDate, "day");
        const amount = Number(item.amount || 0); // ✅ correction ici

        if (daysOverdue <= 30) {
          grouped["0-30 jours"] += amount;
        } else if (daysOverdue <= 60) {
          grouped["31-60 jours"] += amount;
        } else if (daysOverdue <= 90) {
          grouped["61-90 jours"] += amount;
        } else {
          grouped["91+ jours"] += amount;
        }
      });

      const chartData: BalanceData[] = Object.entries(grouped).map(
        ([periode, montant]) => ({ periode, montant })
      );

      setData(chartData);
    }

    fetchOverdueReceivables();
  }, [referenceDate]);


  return (
    <div className="rounded-2xl w-full h-full">
      <Card className="p-6 shadow-xl bg-white h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Balance âgée (retards)
          </h2>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Date de référence:</label>
            <DatePicker
              selected={referenceDate}
              onChange={(date) => date && setReferenceDate(date)}
              dateFormat="dd/MM/yyyy"
              className="border border-gray-300 text-sm rounded-md px-2 py-1"
            />
          </div>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="periode" stroke="#6b7280" />
            <YAxis
              stroke="#6b7280"
              tickFormatter={(v) => {
                if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} M€`;
                if (v >= 1_000) return `${(v / 1_000).toFixed(1)} k€`;
                return `${v} €`;
              }}
            />

            <Tooltip formatter={(value: number) => [`${value} €`, "Montant"]} />
            <Bar
              dataKey="montant"
              fill="rgb(255, 99, 132)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
