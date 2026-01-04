import type { ReactNode } from "react";

import { Card } from "../ui/Card";

type DayPoint = { date: string; count: number };
type WeekPoint = { weekStart: string; count: number };
type StatusPoint = { status: string; count: number };

interface AnalyticsChartsProps {
  appointmentsByDay: DayPoint[];
  newPatientsByWeek: WeekPoint[];
  appointmentsByStatus: StatusPoint[];
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

const LineChart = ({ data }: { data: DayPoint[] }) => {
  const values = data.map((point) => point.count);
  const maxValue = Math.max(...values, 1);
  const width = 520;
  const height = 180;
  const stepX = data.length > 1 ? width / (data.length - 1) : width;
  const points = data.map((point, index) => {
    const x = index * stepX;
    const y = height - (point.count / maxValue) * height;
    return { x, y, ...point };
  });
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const areaPath = `${path} L ${width} ${height} L 0 ${height} Z`;

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-44 w-full overflow-visible"
        role="img"
        aria-label="Appointments over the last 30 days"
      >
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(34,197,94,0.35)" />
            <stop offset="100%" stopColor="rgba(34,197,94,0.04)" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#areaFill)" />
        <path
          d={path}
          fill="none"
          stroke="rgb(34,197,94)"
          strokeWidth="3"
        />
        {points.map((point, index) => (
          <circle
            key={`${point.date}-${index}`}
            cx={point.x}
            cy={point.y}
            r="3.5"
            fill="rgb(34,197,94)"
          >
            <title>
              {point.date}: {point.count}
            </title>
          </circle>
        ))}
      </svg>
      <div className="flex justify-between text-xs text-text-muted">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
};

const BarChart = ({ data }: { data: WeekPoint[] }) => {
  const values = data.map((point) => point.count);
  const maxValue = Math.max(...values, 1);

  return (
    <div className="space-y-3">
      <div className="flex h-40 items-end gap-2">
        {data.map((point) => {
          const height = `${Math.max((point.count / maxValue) * 100, 6)}%`;
          return (
            <div key={point.weekStart} className="flex flex-1 items-end">
              <div
                className="w-full rounded-full bg-secondary/70 shadow-sm"
                style={{ height }}
                title={`${point.weekStart}: ${point.count}`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-text-muted">
        <span>{data[0]?.weekStart}</span>
        <span>{data[data.length - 1]?.weekStart}</span>
      </div>
    </div>
  );
};

const StatusBars = ({ data }: { data: StatusPoint[] }) => {
  const total = data.reduce((sum, point) => sum + point.count, 0) || 1;
  const colors: Record<string, string> = {
    scheduled: "bg-primary/80",
    completed: "bg-success/80",
    cancelled: "bg-danger/70",
    no_show: "bg-warning/80",
    other: "bg-border"
  };

  return (
    <div className="space-y-4">
      {data.map((point) => {
        const percentage = Math.round((point.count / total) * 100);
        return (
          <div key={point.status} className="space-y-2">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span className="uppercase tracking-wide">{point.status}</span>
              <span>
                {point.count} ({percentage}%)
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-surface-subtle">
              <div
                className={`h-2 rounded-full ${colors[point.status] || colors.other}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const AnalyticsCharts = ({
  appointmentsByDay,
  newPatientsByWeek,
  appointmentsByStatus
}: AnalyticsChartsProps) => {
  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <div className="space-y-6">
        <ChartCard title="Appointments by day" subtitle="Last 30 days">
          <LineChart data={appointmentsByDay} />
        </ChartCard>
        <ChartCard title="New patients by week" subtitle="Last 12 weeks">
          <BarChart data={newPatientsByWeek} />
        </ChartCard>
      </div>
      <ChartCard title="Appointments by status" subtitle="Last 30 days">
        <StatusBars data={appointmentsByStatus} />
      </ChartCard>
    </div>
  );
};
