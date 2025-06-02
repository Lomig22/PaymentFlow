import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { cn } from "../../lib/utils";
import { useState } from "react";
import { CalendarIcon, CheckIcon } from "lucide-react";

const getYears = (start = 2015, end = new Date().getFullYear()) =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

type YearPickerProps = {
  value: number;
  onChange: (year: number) => void;
};

export function YearPicker({ value, onChange }: YearPickerProps) {
  const [open, setOpen] = useState(false);
  const years = getYears();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center justify-between w-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-all hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-ring"
          )}
        >
          {value}
          <CalendarIcon className="h-4 w-4 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-40 max-h-64 overflow-y-auto p-1 bg-white rounded-md shadow-lg animate-in fade-in slide-in-from-top-2" style={{ zIndex: 1000 }}>
        <ul className="space-y-1">
          {years.map((year) => (
            <li key={year}>
              <button
                onClick={() => {
                  onChange(year);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                  year === value && "bg-muted font-semibold"
                )}
              >
                {year}
                {year === value && (
                  <CheckIcon className="h-4 w-4 text-green-600" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
