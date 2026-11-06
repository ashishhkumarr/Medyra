import { useEffect, useState } from "react";

type MicroHintProps = {
  text: string;
  condition?: boolean;
  onceKey?: string;
  className?: string;
};

const buildStorageKey = (key: string) => `microhint:${key}`;

export const MicroHint = ({ text, condition = true, onceKey, className }: MicroHintProps) => {
  const [hidden, setHidden] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!media) return;
    const update = () => setReduceMotion(media.matches);
    update();
    if (media.addEventListener) {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }
  }, []);

  useEffect(() => {
    if (!onceKey || !condition || typeof window === "undefined") return;
    const key = buildStorageKey(onceKey);
    if (localStorage.getItem(key) === "1") {
      setHidden(true);
      return;
    }
    localStorage.setItem(key, "1");
  }, [onceKey, condition]);

  useEffect(() => {
    if (!condition || hidden) return;
    if (reduceMotion) {
      setVisible(true);
      return;
    }
    const timer = window.setTimeout(() => setVisible(true), 0);
    return () => window.clearTimeout(timer);
  }, [condition, hidden, reduceMotion]);

  if (!condition || hidden) return null;

  return (
    <p
      role="note"
      className={`flex items-start gap-2 text-xs text-text-muted/80 ${
        reduceMotion ? "" : "transition-opacity duration-150"
      } ${visible || reduceMotion ? "opacity-100" : "opacity-0"} ${className ?? ""}`}
    >
      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50 shadow-[0_0_8px_rgba(46,58,38,0.25)]" />
      <span>{text}</span>
    </p>
  );
};
