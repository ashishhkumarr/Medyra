import type { ReactNode } from "react";

import { BarChartD3, type BarDatum } from "../charts/BarChartD3";
import { LineChartD3 } from "../charts/LineChartD3";
import { Card } from "../ui/Card";

type DayPoint = { date: string; count: number };
type WeekPoint = { weekStart: string; count: number };
type StatusPoint = { status: string; count: number };

interface AnalyticsChartsProps {
  appointmentsByDay: DayPoint[];
  newPatientsByWeek: WeekPoint[];
  appointmentsByStatus: StatusPoint[];
  refreshKey?: number;
}

const ChartCard = ({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) => (
  <Card className="space-y-4">
    <div>
      <p className="text-sm font-semibold text-text">{title}</p>
      {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
    </div>
    {children}
  </Card>
);

const EmptyChartState = () => (
  <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-border/50 bg-surface/60 px-6 py-8 text-center text-sm text-text-muted">
    <p className="text-sm font-semibold text-text">No data in this period</p>
    <p className="mt-1 text-xs text-text-muted">
      Activity will appear here once you start using Medyra.
    </p>
  </div>
);

const statusColors: Record<string, string> = {
  unconfirmed: "rgb(var(--color-warning))",
  confirmed: "rgb(var(--color-primary))",
  scheduled: "rgb(var(--color-warning))",
  completed: "rgb(var(--color-success))",
  cancelled: "rgb(var(--color-danger))",
  no_show: "rgb(var(--color-warning))",
  other: "rgb(var(--color-border))"
};

const toStatusBars = (data: StatusPoint[]): BarDatum[] =>
  data.map((point) => {
    const key = point.status.toLowerCase();
    return {
      key,
      label: point.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      count: point.count,
      color: statusColors[key] || statusColors.other
    };
  });

export const AnalyticsCharts = ({
  appointmentsByDay,
  newPatientsByWeek,
  appointmentsByStatus,
  refreshKey
}: AnalyticsChartsProps) => {
  const weeklySeries = newPatientsByWeek.map((point) => ({
    date: point.weekStart,
    count: point.count
  }));
  const appointmentsEmpty =
    appointmentsByDay.length === 0 || appointmentsByDay.every((point) => point.count === 0);
  const weeklyEmpty =
    weeklySeries.length === 0 || weeklySeries.every((point) => point.count === 0);
  const statusTotal = appointmentsByStatus.reduce((sum, point) => sum + point.count, 0);
  const statusEmpty = appointmentsByStatus.length === 0 || statusTotal === 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <div className="space-y-6">
        <ChartCard title="Appointments by day" subtitle="Last 30 days">
          {appointmentsEmpty ? (
            <EmptyChartState />
          ) : (
            <LineChartD3
              data={appointmentsByDay}
              ariaLabel="Appointments over the last 30 days"
              animationKey={refreshKey}
            />
          )}
        </ChartCard>
        <ChartCard title="New patients by week" subtitle="Last 12 weeks">
          {weeklyEmpty ? (
            <EmptyChartState />
          ) : (
            <LineChartD3
              data={weeklySeries}
              ariaLabel="New patients over the last 12 weeks"
              animationKey={refreshKey}
            />
          )}
        </ChartCard>
      </div>
      <ChartCard title="Appointments by status" subtitle="Last 30 days">
        {statusEmpty ? (
          <EmptyChartState />
        ) : (
          <BarChartD3
            data={toStatusBars(appointmentsByStatus)}
            ariaLabel="Appointments by status"
            animationKey={refreshKey}
          />
        )}
      </ChartCard>
    </div>
  );
};
