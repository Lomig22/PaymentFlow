import React, { useEffect } from "react";

export type OnboardingStep = {
  title: string;
  description: string;
  actionLabel?: string;
};

type OnboardingTourProps = {
  open: boolean;
  step: number;
  steps: OnboardingStep[];
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onComplete: () => void;
  onAction?: () => void;
  // Advanced rendering
  renderStep?: (stepIndex: number) => React.ReactNode;
  hideFooterForStep?: (stepIndex: number) => boolean;
};

export default function OnboardingTour({
  open,
  step,
  steps,
  onClose,
  onPrev,
  onNext,
  onComplete,
  onAction,
  renderStep,
  hideFooterForStep,
}: OnboardingTourProps) {
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;
  const current = steps[step] || steps[0];
  const isLast = step >= steps.length - 1;

  return (
    <div className="fixed inset-0 z-[1000]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Centered card */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-xl bg-white shadow-2xl border border-gray-100">
          <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {current.title}
                </h2>
                <p className="mt-2 text-sm sm:text-base text-gray-600 whitespace-pre-line">
                  {current.description}
                </p>
              </div>
              <button
                onClick={onClose}
                className="shrink-0 inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                aria-label="Fermer le didacticiel"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Custom step content (e.g., survey form) */}
            {typeof (renderStep) === 'function' && (
              <div className="mt-4 sm:mt-6">
                {renderStep(step)}
              </div>
            )}

            {/* Footer */}
            {!(hideFooterForStep && hideFooterForStep(step)) && (
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  {steps.map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-2 w-2 rounded-full ${idx === step ? "bg-blue-600" : "bg-gray-300"}`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  {current.actionLabel && (
                    <button
                      onClick={onAction}
                      className="px-3 py-2 text-sm sm:text-base rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                    >
                      {current.actionLabel}
                    </button>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onPrev}
                      disabled={step === 0}
                      className="px-3 py-2 text-sm sm:text-base rounded-md border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Précédent
                    </button>
                    {!isLast ? (
                      <button
                        onClick={onNext}
                        className="px-3 py-2 text-sm sm:text-base rounded-md bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Suivant
                      </button>
                    ) : (
                      <button
                        onClick={onComplete}
                        className="px-3 py-2 text-sm sm:text-base rounded-md bg-green-600 text-white hover:bg-green-700"
                      >
                        Terminer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-5 pb-5 text-xs text-gray-400">
            Astuce: tu peux revenir à ce guide plus tard depuis Paramètres → Aide.
          </div>
        </div>
      </div>
    </div>
  );
}
