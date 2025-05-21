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
import { AlertCircle } from "lucide-react";

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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: receivables, error } = await supabase
        .from("receivables")
        .select("due_date, amount")
        .lt("due_date", reference)
        .eq("owner_id", user?.id); // uniquement les en retard

      if (error) {
        console.error("Erreur Supabase :", error.message);
        return;
      }

      const refDay = dayjs(referenceDate);
      const grouped = {
        "0-30 jours": 0,
        "30-60 jours": 0,
        "60-90 jours": 0,
        "90-120 jours": 0,
        "120+ jours": 0,
      };

      receivables?.forEach((item) => {
        const dueDate = dayjs(item.due_date);
        const daysOverdue = refDay.diff(dueDate, "day");
        const amount = Number(item.amount || 0); // ✅ correction ici

        if (daysOverdue <= 30) {
          grouped["0-30 jours"] += amount;
        } else if (daysOverdue <= 60) {
          grouped["30-60 jours"] += amount;
        } else if (daysOverdue <= 90) {
          grouped["60-90 jours"] += amount;
        } else if (daysOverdue <= 120) {
          grouped["90-120 jours"] += amount;
        } else {
          grouped["120+ jours"] += amount;
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
          <div className="flex items-center space-x-2 mb-2">
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Balance âgée (retards)
            </h2>
          </div>
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
              fill="rgb(220 38 38 / var(--tw-text-opacity, 1))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
