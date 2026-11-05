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
    "bg-primary text-white shadow-[0_10px_24px_-12px_rgba(13,110,104,0.8)] hover:bg-primary-strong hover:shadow-[0_16px_30px_-12px_rgba(13,110,104,0.7)] focus-visible:ring-primary/40",
  secondary:
    "border border-border/60 bg-surface/70 text-text shadow-sm backdrop-blur hover:border-primary/30 hover:bg-surface/90 focus-visible:ring-primary/30",
  ghost:
    "text-text-muted hover:text-text hover:bg-surface/60 focus-visible:ring-primary/20",
  destructive:
    "bg-danger text-white shadow-[0_10px_24px_-12px_rgba(185,60,60,0.75)] hover:brightness-95 focus-visible:ring-danger/40"
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
