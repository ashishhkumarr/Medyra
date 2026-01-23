import clsx from "classnames";
import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  isLoading?: boolean;
  size?: Size;
}

const baseStyles =
  "inline-flex min-h-[44px] items-center justify-center rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-0";

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-primary to-secondary text-white shadow-[0_14px_36px_rgba(102,128,255,0.28)] hover:shadow-[0_18px_40px_rgba(42,203,184,0.32)] focus-visible:ring-primary/40",
  secondary:
    "border border-border/60 bg-surface/70 text-text shadow-sm backdrop-blur hover:border-primary/30 hover:bg-surface/90 focus-visible:ring-primary/30",
  ghost:
    "text-text-muted hover:text-text hover:bg-surface/60 focus-visible:ring-primary/20",
  destructive:
    "bg-gradient-to-r from-danger to-warning text-white shadow-[0_14px_36px_rgba(244,105,122,0.25)] hover:shadow-[0_18px_40px_rgba(244,105,122,0.3)] focus-visible:ring-danger/40"
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-7 py-3.5 text-lg"
};

export const Button = ({
  children,
  className,
  variant = "primary",
  isLoading,
  size = "md",
  ...props
}: ButtonProps) => {
  return (
    <button
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        "hover:-translate-y-0.5 hover:scale-[1.01] active:translate-y-0",
        className
      )}
      {...props}
    >
      {isLoading ? "Processing..." : children}
    </button>
  );
};
