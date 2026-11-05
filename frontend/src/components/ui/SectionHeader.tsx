import { ReactNode } from "react";

interface SectionHeaderProps {
  title: ReactNode;
  description?: string;
  action?: ReactNode;
}

export const SectionHeader = ({ title, description, action }: SectionHeaderProps) => (
  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
    <div>
      <h2 className="font-display text-3xl text-text sm:text-4xl">{title}</h2>
      {description && <p className="text-sm text-text-muted sm:text-base">{description}</p>}
    </div>
    {action}
  </div>
);
