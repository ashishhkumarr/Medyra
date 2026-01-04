import { ReactNode } from "react";

import { Card } from "../ui/Card";

interface KpiCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  hint?: string;
}

export const KpiCard = ({ label, value, icon, hint }: KpiCardProps) => {
  return (
    <Card className="flex items-center gap-4">
      <div className="rounded-2xl bg-surface-subtle/80 p-3 text-primary">{icon}</div>
      <div>
        <p className="text-sm text-text-muted">{label}</p>
        <p className="text-3xl font-semibold text-text">{value}</p>
        {hint && <p className="text-xs text-text-muted">{hint}</p>}
      </div>
    </Card>
  );
};
