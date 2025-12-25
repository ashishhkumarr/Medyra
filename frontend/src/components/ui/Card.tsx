import clsx from "classnames";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

export const Card = ({ className, children, padded = true, ...props }: CardProps) => {
  return (
    <div
      className={clsx(
        "glass-card border border-border/60 backdrop-blur-sm",
        padded && "p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
