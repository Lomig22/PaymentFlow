import React from "react";
import { cn } from "../../src/lib/utils";

type CardOptionProps = {
  label: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
};

export default function CardOption({ label, icon: Icon, selected = false, onClick, className, disabled = false }: CardOptionProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "group relative w-full text-left rounded-2xl border p-4 sm:p-5 transition-all",
        "bg-white hover:shadow-lg hover:-translate-y-[1px] active:translate-y-0",
        selected ? "border-blue-600 ring-2 ring-blue-200 bg-blue-50/50" : "border-gray-200",
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
            selected ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600",
          )}>
            <Icon className="h-5 w-5" />
          </div>
        )}
        <span className={cn(
          "font-medium",
          selected ? "text-blue-800" : "text-gray-800"
        )}>{label}</span>
      </div>
    </button>
  );
}
