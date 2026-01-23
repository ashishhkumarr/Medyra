import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";

import { IS_DEMO } from "../config/demo";

export const DemoBanner = () => {
  const badgeRef = useRef<HTMLButtonElement | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(
    null
  );

  useEffect(() => {
    if (!showTooltip || !badgeRef.current) return;
    const updatePosition = () => {
      if (!badgeRef.current) return;
      const rect = badgeRef.current.getBoundingClientRect();
      setTooltipPos({
        top: rect.bottom + 10,
        left: rect.left + rect.width / 2
      });
    };
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [showTooltip]);

  useEffect(() => {
    if (!showTooltip) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowTooltip(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showTooltip]);

  if (!IS_DEMO) return null;

  return (
    <div className="safe-top border-b border-border/60 bg-surface/70 text-text-muted backdrop-blur">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-10">
        <div className="mx-auto w-full max-w-[1400px]">
          <div className="flex items-center justify-between gap-3 px-4 py-2 text-xs font-semibold sm:text-sm">
            <div className="relative flex items-center">
              <button
                ref={badgeRef}
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onFocus={() => setShowTooltip(true)}
                onBlur={() => setShowTooltip(false)}
                aria-label="Demo only. Do not enter real patient data."
                className="flex items-center gap-2 rounded-full border border-border/60 bg-surface/70 px-3 py-1 text-xs font-semibold text-text-muted shadow-sm backdrop-blur transition hover:text-text"
              >
                <span className="h-2 w-2 rounded-full bg-warning/70 shadow-[0_0_12px_rgba(245,182,79,0.4)]" />
                Demo Mode
              </button>
              {showTooltip &&
                tooltipPos &&
                createPortal(
                  <div
                    className="fixed z-[9999] -translate-x-1/2 rounded-2xl border border-border/60 bg-surface/90 px-3 py-2 text-xs text-text shadow-card backdrop-blur"
                    style={{ top: tooltipPos.top, left: tooltipPos.left }}
                    role="tooltip"
                  >
                    Demo only. Do not enter real patient data.
                  </div>,
                  document.body
                )}
            </div>
            <Link
              to="/demo-notice"
              className="inline-flex items-center gap-1 text-text-muted transition hover:text-text"
            >
              Demo notice
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
