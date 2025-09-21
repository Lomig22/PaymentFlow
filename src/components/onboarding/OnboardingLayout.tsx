import React from "react";
import { cn } from "../../lib/utils";

interface OnboardingLayoutProps {
  step: number; // 0-index
  total: number;
  canNext: boolean;
  saving?: boolean;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
  children: React.ReactNode;
}

export default function OnboardingLayout({ step, total, canNext, saving, onPrev, onNext, onFinish, children }: OnboardingLayoutProps) {
  const percent = Math.round(((step + 1) / total) * 100);
  const isLast = step >= total - 1;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header / Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>Étape {step + 1} / {total}</span>
          <span>{percent}%</span>
        </div>
        <div className="h-2 w-full bg-gray-200/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 rounded-full transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="mt-4">{children}</div>

      {/* Footer nav */}
      <div className="mt-6 sm:mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          disabled={step === 0}
          className={cn(
            "px-3 py-2 text-sm rounded-md border border-gray-300 text-gray-700",
            step === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
          )}
        >
          Précédent
        </button>
        {!isLast ? (
          <button
            type="button"
            onClick={onNext}
            disabled={!canNext}
            className={cn(
              "px-4 py-2 rounded-md bg-blue-600 text-white",
              !canNext ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
            )}
          >
            Suivant
          </button>
        ) : (
          <button
            type="button"
            onClick={onFinish}
            disabled={!!saving}
            className={cn(
              "px-4 py-2 rounded-md bg-green-600 text-white",
              saving ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"
            )}
          >
            {saving ? "Enregistrement…" : "Terminer"}
          </button>
        )}
      </div>
    </div>
  );
}
