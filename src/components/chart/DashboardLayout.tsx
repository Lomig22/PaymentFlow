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
  Area,
  AreaChart,
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
  const [loading, setLoading] = useState<boolean>(true);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    (async () => {
      setLoading(true);
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
      setLoading(false);
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
            <h2 className="text-[20px] font-bold text-black mb-4 mt-4">
              Activité récente
            </h2>

            <div className={`inline-flex items-center gap-1 ${colorClass}`}>
              <span className="font-semibold">{arrow}</span>
              <span className="font-medium">{Math.abs(diffPct)}%</span>
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
          <>
            {loading ? (
              <div className="flex justify-center align-center items-center" style={{ height: 320 }}>
                <span className="animate-spin border-t-4 border-blue-600 rounded-full h-8 w-8"></span>
                <p className="text-gray-600 ml-3 font-semibold">Chargement des données...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart
                  data={filteredData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="paidFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00C853" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#00C853" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="unpaidFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF4333" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#FF4333" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="1 1"
                    stroke="#e5e7eb"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    stroke="#374151"
                    tick={{ fontSize: 13, fontWeight: 500 }}
                  />
                  <YAxis
                    stroke="#374151"
                    tick={{ fontSize: 13, fontWeight: 500 }}
                    tickFormatter={(v: number | undefined) => typeof v === 'number' ? formatEuro(v) : ''}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const year = payload[0].payload.year;
                        return (
                          <div className="bg-white shadow-xl rounded-xl p-4 border border-gray-200">
                            {" "}
                            <p className="text-sm text-gray-500 mb-2 font-semibold">
                              {" "}
                              {label} {year}{" "}
                            </p>{" "}
                            {payload.map((entry, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center mb-1"
                              >
                                {" "}
                                <span className="flex items-center text-sm font-medium text-gray-700">
                                  {" "}
                                  <span
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: entry.color }}
                                  ></span>{" "}
                                  {entry.name}{" "}
                                </span>{" "}
                                <span className="text-sm font-semibold text-gray-900 ml-2">
                                  {" "}
                                  {formatEuro(entry.value)}{" "}
                                </span>{" "}
                              </div>
                            ))}{" "}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />{" "}
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: 8 }} />
                  <Area
                    type="monotone"
                    dataKey="paid"
                    stroke="#00C853"
                    strokeWidth={2}
                    fill="url(#paidFill)"
                    name="Payé"
                  />
                  <Area
                    type="monotone"
                    dataKey="unpaid"
                    stroke="#FF4333"
                    strokeWidth={2}
                    fill="url(#unpaidFill)"
                    name="En attente"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </>
        ) : (
          <p className="text-sm italic text-gray-500">
            Aucune donnée pour la période sélectionnée.
          </p>
        )}
      </Card>
    </div>
  );
}
