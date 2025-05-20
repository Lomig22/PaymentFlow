import { useEffect, useState } from "react";
// types.ts ou dans ton fichier composant
export interface DateTimeInputProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  datemin?: Date;
  datemax?: Date;
  optional?: boolean;
  onToggleOptional?: (checked: boolean) => void;
}

export default function DateTimeInput({
  label,
  value,
  onChange,
  datemin,
  datemax,
  optional = false,
  onToggleOptional,
}: DateTimeInputProps) {
  const [enabled, setEnabled] = useState(!optional);

  useEffect(() => {
    setEnabled(optional);
  }, [optional]);

  const handleToggle = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    if (onToggleOptional) onToggleOptional(newEnabled);
  };

  const toDateTimeLocal = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow ">
      {" "}
      <div className="flex items-center justify-between mb-2">
        <div className="min-h-[40px] mb-2 mt-1">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={handleToggle}
              className="sr-only peer"
            />
            <div
              className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white 
    after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all 
    peer-checked:bg-blue-600"
            ></div>
          </label>
        </div>
        <span className="ml-2 font-medium">{label}</span>
      </div>
      <input
        type="datetime-local"
        value={toDateTimeLocal(value)}
        min={datemin ? toDateTimeLocal(datemin) : undefined}
        max={datemax ? toDateTimeLocal(datemax) : undefined}
        onChange={(e) => onChange(new Date(e.target.value))}
        className="w-full border border-gray-300 rounded-md p-2"
        disabled={!enabled}
      />
    </div>
  );
}
