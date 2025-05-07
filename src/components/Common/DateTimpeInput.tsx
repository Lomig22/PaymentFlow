import Datetime from "react-datetime";
import moment from "moment";
import "react-datetime/css/react-datetime.css";

interface DateTimeInputProps {
  label: string;
  value: Date;
  datemin: Date;
  datemax?: Date; // 👈 ajouté ici
  onChange: (date: Date) => void;
}

export default function DateTimeInput({ label, value, onChange, datemin, datemax }: DateTimeInputProps) {
  const toDateTimeLocal = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type="datetime-local"
        value={toDateTimeLocal(value)}
        min={datemin ? toDateTimeLocal(datemin) : undefined}
        max={datemax ? toDateTimeLocal(datemax) : undefined} 
        onChange={(e) => onChange(new Date(e.target.value))}
        className="w-full border border-gray-300 rounded-md p-2"
      />
    </div>
  );
}
