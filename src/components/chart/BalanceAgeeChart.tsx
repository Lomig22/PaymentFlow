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
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchOverdueReceivables() {
      setLoading(true);
      const reference = referenceDate.toISOString();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Utilisateur non authentifié");

      const userEmail = user.email;

      // 1. Récupère les IDs des utilisateurs qui ont invité l'utilisateur actuel
      const { data: invitedByData, error: invitedByError } = await supabase
        .from("invited_users")
        .select("invited_by")
        .eq("invited_email", userEmail);

      if (invitedByError) throw invitedByError;

      const invitedByIds = invitedByData.map((entry) => entry.invited_by);

      // 2. Inclure l'utilisateur actuel dans les IDs à filtrer
      const allOwnerIds = [user.id, ...invitedByIds];

      const { data: receivables, error } = await supabase
        .from("receivables")
        .select("due_date, amount")
        .lt("due_date", reference)
        .in("owner_id", allOwnerIds); // uniquement les en retard

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
        ">120 jours": 0,
      };

      receivables?.forEach((item) => {
        const dueDate = dayjs(item.due_date);
        const daysOverdue = refDay.diff(dueDate, "day");
        const amount = Number(item.amount || 0);

        if (daysOverdue <= 30) {
          grouped["0-30 jours"] += amount;
        } else if (daysOverdue <= 60) {
          grouped["30-60 jours"] += amount;
        } else if (daysOverdue <= 90) {
          grouped["60-90 jours"] += amount;
        } else if (daysOverdue <= 120) {
          grouped["90-120 jours"] += amount;
        } else {
          grouped[">120 jours"] += amount;
        }
      });

      const chartData: BalanceData[] = Object.entries(grouped).map(
        ([periode, montant]) => ({ periode, montant })
      );

      setData(chartData);
      setLoading(false);
    }

    fetchOverdueReceivables();
    
  }, [referenceDate]);

  interface CustomYAxisTickProps {
  x: number;
  y: number;
  payload: { value: number };
}
function CustomYAxisTick({ x, y, payload }: CustomYAxisTickProps) {
    const value = payload.value;
    let displayValue = "";
    let unit = "";

    if (value >= 1_000_000) {
      displayValue = (value / 1_000_000).toFixed(1);
      unit = "M€";
    } else if (value >= 1_000) {
      displayValue = (value / 1_000).toFixed(1);
      unit = "k€";
    } else {
      displayValue = value.toFixed(1);
      unit = "€";
    }

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={0}
          textAnchor="end"
          fill="#374151"
          fontSize={13}
          fontWeight={500}
        >
          <tspan x={0} dy={0}>
            {displayValue} {unit}
          </tspan>
          {/* <tspan x={0} dy={14}>
            {unit}
          </tspan> */}
        </text>
      </g>
    );
  }

  return (
    <div className="rounded-2xl w-full h-full">
      <Card className="p-6 shadow-xl bg-white min-h-[350px]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-[20px] font-bold text-black mb-4 mt-4">
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
        {loading ? (
          <div
            className="flex justify-center align-center items-center"
            style={{ height: 320 }}
          >
            <span className="animate-spin border-t-4 border-blue-600 rounded-full h-8 w-8"></span>
            <p className="text-gray-600 ml-3 font-semibold">Chargement des données...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="1 1"
                stroke="#e5e7eb"
                vertical={false}
              />
              <XAxis
                dataKey="periode"
                tick={{ fontSize: 13, fontWeight: 500 }}
                stroke="#374151"
              />
              <YAxis stroke="#374151" tick={<CustomYAxisTick />} />

              <Tooltip
                formatter={(value: number) => [
                  `${value.toFixed(2)} €`,
                  "Montant",
                ]}
              />
              <Bar
                dataKey="montant"
                fill="rgb(255, 67, 67)"
                radius={[12, 12, 12, 12]}
                barSize={54}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}
