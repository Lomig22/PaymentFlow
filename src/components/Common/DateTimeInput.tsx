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
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
        <input
          type="checkbox"
          checked={enabled}
          onChange={handleToggle}
          className="mr-2"
        />
        {label} {/* optional && "(optionnel)" */}
      </label>
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
