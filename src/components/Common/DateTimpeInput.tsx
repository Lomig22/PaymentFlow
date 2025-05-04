import Datetime from "react-datetime";
import moment from "moment";
import "react-datetime/css/react-datetime.css";

interface DateTimeInputProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
}

export default function DateTimeInput({ label, value, onChange }: DateTimeInputProps) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <Datetime
        value={moment(value)}
        onChange={(date) => {
          const d = date && typeof date !== "string" && date.toDate ? date.toDate() : date;
          if (d instanceof Date && !isNaN(d.getTime())) {
            onChange(d);
          }
        }}
        dateFormat="YYYY-MM-DD"
        timeFormat="HH:mm"
        timeConstraints={{
          hours: { min: 0, max: 23, step: 1 },
          minutes: { min: 0, max: 59, step: 15 },
        }}
        inputProps={{ className: "w-full" }}
      />
    </div>
  );
}
