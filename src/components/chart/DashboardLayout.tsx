import React, { useState, useEffect, useMemo } from "react";
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
import { supabase } from "../../lib/supabase";
import { Activity } from "lucide-react";
import { YearPicker } from "../../components/ui/year-picker";

const monthLabelsShort = [
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

const monthOrderFull = [
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

const formatEuro = (v: number) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M €`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k €`;
  return `${v} €`;
};

export default function DashboardLayout() {
  const now = new Date();
  const defaultYear = now.getFullYear();
  const defaultMonth = monthOrderFull[now.getMonth()];

  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonth);
  const [dataByYear, setDataByYear] = useState<Record<number, any[]>>({});

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");


  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data: invData } = await supabase
        .from("invited_users")
        .select("invited_by")
        .eq("invited_email", user.email);
      const invitedByIds = invData?.map((e) => e.invited_by) || [];
      const ownerIds = [user.id, ...invitedByIds];

      const { data, error } = await supabase
        .from("receivables")
        .select("due_date, amount, paid_amount")
        .in("owner_id", ownerIds);
      if (error) return console.error(error);

      const grouped: Record<number, any[]> = {};
      data?.forEach((item) => {
        if (!item.due_date || item.amount == null) return;
        const d = new Date(item.due_date);
        if (isNaN(d.getTime())) return;
        const y = d.getFullYear(),
          m = d.getMonth();
        if (!grouped[y]) {
          grouped[y] = monthLabelsShort.map((lbl, idx) => ({
            month: lbl,
            paid: 0,
            unpaid: 0,
            year: y,
          }));
        }
        const paid = Number(item.paid_amount || 0);
        const unpaid = Math.max(item.amount - paid, 0);
        grouped[y][m].paid += paid;
        grouped[y][m].unpaid += unpaid;
      });

      setDataByYear(grouped);
    })();
  }, []);

  const filteredData = useMemo(() => {
    const startIdx = monthOrderFull.indexOf(selectedMonth);
    if (startIdx < 0) return [];

    const result: any[] = [];
    for (let i = 0; i <= 12; i++) {
      const monthIndex = (startIdx + i) % 12;
      const yearOffset = Math.floor((startIdx + i) / 12);
      const year = selectedYear - 1 + yearOffset;
      const dataForYear = dataByYear[year] || [];
      const item = dataForYear[monthIndex] || {
        month: monthLabelsShort[monthIndex],
        paid: 0,
        unpaid: 0,
        year,
      };
      result.push({
        ...item,
        label: `${item.month}`,
      });
    }

    return result;
  }, [dataByYear, selectedYear, selectedMonth]);

  const { diff, diffPct, arrow, colorClass } = useMemo(() => {
    if (filteredData.length < 2) {
      return { diff: 0, diffPct: 0, arrow: "→", colorClass: "text-gray-500" };
    }
    const L = filteredData.length;
    const last = filteredData[L - 1],
      prev = filteredData[L - 2];
    const totalLast = (last.paid || 0) + (last.unpaid || 0);
    const totalPrev = (prev.paid || 0) + (prev.unpaid || 0);
    const d = totalLast - totalPrev;
    const pct =
      totalPrev === 0 ? 100 : parseFloat(((d / totalPrev) * 100).toFixed(1));
    return {
      diff: d,
      diffPct: pct,
      arrow: d > 0 ? "↑" : d < 0 ? "↓" : "→",
      colorClass:
        d > 0 ? "text-green-600" : d < 0 ? "text-red-600" : "text-gray-500",
    };
  }, [filteredData]);

  return (
    <div className="rounded-2xl w-full h-full">
      <Card className="p-6 shadow-xl h-full bg-white">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Activité récente
            </h2>
            <div className={`inline-flex items-center gap-1 ${colorClass}`}>
              <span className="font-semibold">{arrow}</span>
              <span className="font-medium">
                {Math.abs(diffPct)}%
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <YearPicker value={selectedYear} onChange={setSelectedYear} />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              {monthOrderFull.map((m, i) => (
                <option key={m} value={m}>
                  {monthLabelsShort[i]}
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
              <XAxis dataKey="label" stroke="#6b7280" />
              <YAxis stroke="#6b7280" tickFormatter={formatEuro} />
              <Tooltip
                formatter={(v: number, name: string) => [
                  `${formatEuro(v)}`,
                  name,
                ]}
                labelFormatter={(lbl, payload) => {
                  const yr = payload?.[0]?.payload?.year;
                  return `${lbl} ${yr}`;
                }}
              />
              <Legend iconType="circle" />
              <Line
                type="monotone"
                dataKey="paid"
                stroke="#00C853"
                name="Payé"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="unpaid"
                stroke="#FF4333"
                name="En attente"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm italic text-gray-500">
            Aucune donnée pour la période sélectionnée.
          </p>
        )}
      </Card>
    </div>
  );
}
