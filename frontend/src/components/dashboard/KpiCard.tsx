import { ReactNode } from "react";

import { Card } from "../ui/Card";

interface KpiCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  hint?: string;
  trendText?: string;
  trendTone?: "positive" | "negative" | "neutral" | "muted";
}

export const KpiCard = ({ label, value, icon, hint, trendText, trendTone }: KpiCardProps) => {
  const trendClass = (() => {
    switch (trendTone) {
      case "positive":
        return "text-success";
      case "negative":
        return "text-danger";
      case "neutral":
      case "muted":
      default:
        return "text-text-muted";
    }
  })();

  return (
    <Card className="flex items-center gap-4">
      <div className="rounded-2xl bg-surface/70 p-3 text-primary shadow-sm backdrop-blur">
        {icon}
      </div>
      <div>
        <p className="text-sm text-text-muted">{label}</p>
        <p className="text-3xl font-semibold text-text">{value}</p>
        {trendText && (
          <p className={`text-xs ${trendClass}`} aria-label={`${label} trend: ${trendText}`}>
            {trendText}
          </p>
        )}
        {hint && <p className="text-xs text-text-muted">{hint}</p>}
      </div>
    </Card>
  );
};
