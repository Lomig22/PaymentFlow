import React from "react";
import CardOption from "./CardOption";

type Option = {
  label: string;
  value: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

interface OnboardingStepProps {
  title: string;
  description?: string;
  options: Option[];
  // single-select
  selected?: string;
  onSelect?: (value: string) => void;
  // multi-select
  multi?: boolean;
  selectedList?: string[];
  onToggle?: (value: string) => void;
}

export default function OnboardingStep({
  title,
  description,
  options,
  selected,
  onSelect,
  multi = false,
  selectedList = [],
  onToggle,
}: OnboardingStepProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-800 mb-3">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-3">{description}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt) => {
          const isSelected = multi
            ? selectedList?.includes(opt.value)
            : selected === opt.value;
          return (
            <CardOption
              key={opt.value}
              label={opt.label}
              icon={opt.icon}
              selected={!!isSelected}
              onClick={() => (multi ? onToggle?.(opt.value) : onSelect?.(opt.value))}
            />
          );
        })}
      </div>
    </div>
  );
}
