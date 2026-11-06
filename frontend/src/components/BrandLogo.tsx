type MarkProps = {
  className?: string;
};

/**
 * Medyra mark — a shield (trust / secure records) holding a heart (care).
 * Colors come from theme classes (see index.css): forest shield + lime heart
 * in light mode, inverting cleanly in dark mode.
 */
export const BrandMark = ({ className }: MarkProps) => (
  <svg
    viewBox="0 0 32 32"
    className={className}
    fill="none"
    role="img"
    aria-label="Medyra"
  >
    <path
      className="brand-shield"
      d="M16 3 5 7.5V15c0 6.5 4.8 10.8 11 13 6.2-2.2 11-6.5 11-13V7.5Z"
    />
    <path
      className="brand-heart"
      d="M16 20c-4.2-3.2-6.5-5-6.5-7.6A2.8 2.8 0 0 1 16 10.3a2.8 2.8 0 0 1 6.5 2.1c0 2.6-2.3 4.4-6.5 7.6Z"
    />
  </svg>
);

// Back-compat: existing imports of BrandLogo render the mark.
export const BrandLogo = ({ className }: MarkProps) => <BrandMark className={className} />;

type LockupProps = {
  size?: "sm" | "lg";
  className?: string;
};

/**
 * Mark + wordmark lockup with a balanced ratio (mark ≈ wordmark size).
 */
export const BrandLockup = ({ size = "sm", className }: LockupProps) => {
  const mark = size === "lg" ? "h-10 w-10" : "h-7 w-7";
  const word = size === "lg" ? "text-4xl" : "text-[22px]";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <BrandMark className={`${mark} flex-none`} />
      <span className={`font-display ${word} leading-none tracking-tight text-text`}>Medyra</span>
    </span>
  );
};
