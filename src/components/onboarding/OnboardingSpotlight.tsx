import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

export type SpotlightStep = {
  target: string; // CSS selector e.g. [data-tour="nav-settings"]
  title: string;
  description: string;
  padding?: number; // extra padding around highlight
  radius?: number; // border radius of the highlight
  placement?: "right" | "left" | "bottom" | "top"; // preferred
};

type OnboardingSpotlightProps = {
  open: boolean;
  stepIndex: number;
  steps: SpotlightStep[];
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  onComplete: () => void;
};

export default function OnboardingSpotlight({
  open,
  stepIndex,
  steps,
  onPrev,
  onNext,
  onClose,
  onComplete,
}: OnboardingSpotlightProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [computedPlacement, setComputedPlacement] = useState<"right" | "left" | "bottom" | "top">("right");
  const popRef = useRef<HTMLDivElement>(null);

  const step = steps[stepIndex];
  const count = steps.length;
  const isLast = stepIndex >= count - 1;
  const padding = step?.padding ?? 10;
  const radius = step?.radius ?? 10;

  const targetEl = useMemo(() => {
    if (!open || !step?.target) return null;
    try {
      return document.querySelector(step.target) as HTMLElement | null;
    } catch {
      return null;
    }
  }, [open, step?.target]);

  const updateRect = () => {
    if (!targetEl) {
      setRect(null);
      return;
    }
    const r = targetEl.getBoundingClientRect();
    setRect(r);
  };

  useLayoutEffect(() => {
    if (!open) return;
    updateRect();
    const obs = new ResizeObserver(() => updateRect());
    if (targetEl) obs.observe(targetEl);
    const onScroll = () => updateRect();
    const onResize = () => updateRect();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      obs.disconnect();
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, targetEl, stepIndex]);

  // Compute popover placement
  useEffect(() => {
    if (!rect) return;
    const preferred = step?.placement;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const popW = popRef.current?.offsetWidth ?? 320;
    const popH = popRef.current?.offsetHeight ?? 160;

    const canRight = rect.right + padding + popW < vw;
    const canLeft = rect.left - padding - popW > 0;
    const canBottom = rect.bottom + padding + popH < vh;
    const canTop = rect.top - padding - popH > 0;

    const choose = () => {
      if (preferred === "right" && canRight) return "right" as const;
      if (preferred === "left" && canLeft) return "left" as const;
      if (preferred === "bottom" && canBottom) return "bottom" as const;
      if (preferred === "top" && canTop) return "top" as const;
      if (canRight) return "right" as const;
      if (canLeft) return "left" as const;
      if (canBottom) return "bottom" as const;
      if (canTop) return "top" as const;
      return "right" as const;
    };

    setComputedPlacement(choose());
  }, [rect, step?.placement, padding]);

  if (!open) return null;

  // Compute styles
  const highlightStyle: React.CSSProperties = {};
  const popStyle: React.CSSProperties = {};
  if (rect) {
    const x = rect.left - padding;
    const y = rect.top - padding;
    const w = rect.width + padding * 2;
    const h = rect.height + padding * 2;

    highlightStyle.position = "fixed";
    highlightStyle.left = Math.max(8, x);
    highlightStyle.top = Math.max(8, y);
    highlightStyle.width = w;
    highlightStyle.height = h;
    highlightStyle.borderRadius = radius;
    highlightStyle.boxShadow = "0 0 0 9999px rgba(0,0,0,0.6)";
    highlightStyle.transition = "all 200ms ease";
    highlightStyle.pointerEvents = "none"; // hole is not interactive

    const gap = 14;
    const popW = popRef.current?.offsetWidth ?? 360;
    const popH = popRef.current?.offsetHeight ?? 180;
    if (computedPlacement === "right") {
      popStyle.left = Math.min(window.innerWidth - popW - 8, x + w + gap);
      popStyle.top = Math.max(8, y);
    } else if (computedPlacement === "left") {
      popStyle.left = Math.max(8, x - popW - gap);
      popStyle.top = Math.max(8, y);
    } else if (computedPlacement === "bottom") {
      popStyle.left = Math.max(8, Math.min(window.innerWidth - popW - 8, x));
      popStyle.top = Math.min(window.innerHeight - popH - 8, y + h + gap);
    } else {
      // top
      popStyle.left = Math.max(8, Math.min(window.innerWidth - popW - 8, x));
      popStyle.top = Math.max(8, y - popH - gap);
    }
    popStyle.position = "fixed";
    popStyle.transition = "all 200ms ease";
    popStyle.zIndex = 1002;
  }

  return (
    <div className="fixed inset-0 z-[1001]">
      {/* backdrop intercept clicks */}
      <div className="absolute inset-0" style={{ background: "transparent" }} onClick={onClose} />

      {/* highlight */}
      {rect && (
        <div className="rounded-xl" style={highlightStyle} />
      )}

      {/* popover */}
      <div ref={popRef} className="rounded-xl bg-white shadow-2xl border border-gray-100 p-4 sm:p-5" style={popStyle}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-gray-400">Étape {stepIndex + 1} / {count}</div>
            <h3 className="text-lg font-semibold text-gray-900 mt-0.5">{step?.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            aria-label="Fermer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">
          {step?.description}
        </p>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={onPrev}
            disabled={stepIndex === 0}
            className="px-3 py-2 text-sm rounded-md border border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-50"
          >
            Précédent
          </button>
          {!isLast ? (
            <button
              onClick={onNext}
              className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="px-3 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700"
            >
              Terminer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
