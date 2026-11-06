import clsx from "classnames";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

export const Card = ({ className, children, padded = true, ...props }: CardProps) => {
  return (
    <div
      className={clsx(
        "glass-card border border-border/60 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_24px_50px_-24px_rgba(46,58,38,0.3)]",
        padded && "p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
