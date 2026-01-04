import { Activity, CalendarClock, UserPlus, Users } from "lucide-react";

import { AnalyticsCharts } from "../components/dashboard/AnalyticsCharts";
import { DashboardEmptyState } from "../components/dashboard/DashboardEmptyState";
import { KpiCard } from "../components/dashboard/KpiCard";
import { ErrorState } from "../components/ErrorState";
import { Button } from "../components/ui/Button";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useDashboardAnalytics } from "../hooks/useDashboardAnalytics";

const AdminDashboard = () => {
  const {
    data: analytics,
    isLoading,
    isError,
    refetch
  } = useDashboardAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fadeUp">
        <SectionHeader
          title="Dashboard"
          description="Demo analytics overview"
          action={<div className="h-10 w-32 rounded-xl bg-surface-subtle" />}
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-24 rounded-2xl border border-border/60 bg-surface/70"
            />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <div className="h-64 rounded-2xl border border-border/60 bg-surface/70" />
            <div className="h-60 rounded-2xl border border-border/60 bg-surface/70" />
          </div>
          <div className="h-[520px] rounded-2xl border border-border/60 bg-surface/70" />
        </div>
      </div>
    );
  }

  if (isError || !analytics) {
    return (
      <div className="space-y-4 animate-fadeUp">
        <ErrorState message="Unable to load dashboard analytics." />
        <Button variant="secondary" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const { kpis, trends, breakdowns } = analytics;
  const isEmpty =
    kpis.totalPatients === 0 &&
    kpis.appointmentsToday === 0 &&
    kpis.upcomingAppointments7d === 0 &&
    kpis.newPatients30d === 0;

  return (
    <div className="space-y-8 animate-fadeUp">
      <SectionHeader
        title="Dashboard"
        description="Demo analytics overview"
        action={<Button variant="secondary" onClick={() => refetch()}>Refresh</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total patients"
          value={kpis.totalPatients}
          icon={<Users className="h-6 w-6" />}
        />
        <KpiCard
          label="Appointments today"
          value={kpis.appointmentsToday}
          icon={<Activity className="h-6 w-6" />}
        />
        <KpiCard
          label="Upcoming (7 days)"
          value={kpis.upcomingAppointments7d}
          icon={<CalendarClock className="h-6 w-6" />}
        />
        <KpiCard
          label="New patients (30 days)"
          value={kpis.newPatients30d}
          icon={<UserPlus className="h-6 w-6" />}
        />
      </div>

      {isEmpty ? (
        <DashboardEmptyState />
      ) : (
        <AnalyticsCharts
          appointmentsByDay={trends.appointmentsByDay30d}
          newPatientsByWeek={trends.newPatientsByWeek12w}
          appointmentsByStatus={breakdowns.appointmentsByStatus30d}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
