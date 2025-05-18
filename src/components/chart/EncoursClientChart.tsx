import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  Line,
} from "recharts";

const data = [
  { label: "Échu", value: 762212, color: "#FFB183" },
  { label: "Non-échu", value: 903909, color: "#D5D9FF" },
  { label: "Litige", value: 262455, color: "#F44336" },
  { label: "Promesse de paiement", value: 194192, color: "#A4F3D2" },
  { label: "Recouvrement", value: 16315, color: "#FFCD55" },
  { label: "Avoirs non associés", value: -72769, color: "#D5B3FF" },
];

const total = data.reduce((sum, item) => sum + Math.abs(item.value), 0);

const EncoursClientBar = () => {
  return (
    <div style={{ width: "100%", maxWidth: 800 }}>
      <div
        style={{
          display: "flex",
          height: 24,
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "inset 0 0 2px rgba(0,0,0,0.1)",
        }}
      >
        {data.map((item, index) => {
          const widthPercent = (Math.abs(item.value) / total) * 100;
          return (
            <div
              key={index}
              style={{
                width: `${widthPercent}%`,
                backgroundColor: item.color,
              }}
              title={`${item.label}: ${item.value.toLocaleString()} €`}
            />
          );
        })}
      </div>

      {/* Légende */}
      <div
        style={{
          marginTop: 20,
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        {data.map((item, index) => (
          <div
            key={index}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                backgroundColor: item.color,
                borderRadius: 3,
              }}
            ></div>
            <span style={{ fontSize: 14 }}>
              {item.label} <strong>{item.value.toLocaleString()} €</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EncoursClientBar;
