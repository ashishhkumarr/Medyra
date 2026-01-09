import { Activity, CalendarClock, RefreshCcw, Trash2, UserPlus, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { AnalyticsCharts } from "../components/dashboard/AnalyticsCharts";
import { DashboardEmptyState } from "../components/dashboard/DashboardEmptyState";
import { KpiCard } from "../components/dashboard/KpiCard";
import { ErrorState } from "../components/ErrorState";
import { Button } from "../components/ui/Button";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useDashboardAnalytics } from "../hooks/useDashboardAnalytics";
import { usePageTitle } from "../hooks/usePageTitle";
import { resetDemoData } from "../services/demo";

const AdminDashboard = () => {
  usePageTitle("Dashboard");
  const {
    data: analytics,
    isLoading,
    isError,
    refetch,
    isFetching
  } = useDashboardAnalytics();
  const [showResetModal, setShowResetModal] = useState(false);
  const [reseedAfterReset, setReseedAfterReset] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [resetNotice, setResetNotice] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const resetEnabled = import.meta.env.VITE_ENABLE_DEMO_RESET === "true";

  useEffect(() => {
    if (!resetNotice && !resetError) return;
    const timer = window.setTimeout(() => {
      setResetNotice(null);
      setResetError(null);
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [resetNotice, resetError]);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fadeUp">
        <SectionHeader
          title="Dashboard"
          description="Demo analytics overview"
          action={<div className="h-10 w-32 rounded-xl bg-surface/60" />}
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-24 rounded-2xl border border-border/60 bg-surface/60"
            />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <div className="h-64 rounded-2xl border border-border/60 bg-surface/60" />
            <div className="h-60 rounded-2xl border border-border/60 bg-surface/60" />
          </div>
          <div className="h-[520px] rounded-2xl border border-border/60 bg-surface/60" />
        </div>
      </div>
    );
  }

  if (isError || !analytics) {
    return (
      <div className="space-y-4 animate-fadeUp">
        <SectionHeader
          title="Dashboard"
          description="Demo analytics overview"
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                {isFetching ? (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing…
                  </>
                ) : (
                  "Retry"
                )}
              </Button>
              {resetEnabled && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowResetModal(true)}
                >
                  Reset demo (dev)
                </Button>
              )}
            </div>
          }
        />
        <ErrorState message="Unable to load dashboard analytics." />
        {resetNotice && (
          <div className="rounded-2xl border border-success/30 bg-success-soft/80 px-4 py-3 text-sm text-success shadow-sm animate-toastIn">
            {resetNotice}
          </div>
        )}
        {resetError && (
          <div className="rounded-2xl border border-danger/40 bg-danger-soft/70 px-4 py-3 text-sm text-danger shadow-sm animate-toastIn">
            {resetError}
          </div>
        )}
      </div>
    );
  }

  const { kpis, trends, breakdowns } = analytics;
  const buildTrend = (
    current?: number,
    previous?: number,
    label?: string
  ): { text: string; tone: "positive" | "negative" | "neutral" | "muted" } => {
    if (current === undefined || previous === undefined) {
      return { text: "— No prior data", tone: "muted" };
    }
    const delta = current - previous;
    if (delta > 0) {
      return {
        text: `↑ +${delta}${label ? ` ${label}` : ""}`,
        tone: "positive"
      };
    }
    if (delta < 0) {
      return {
        text: `↓ -${Math.abs(delta)}${label ? ` ${label}` : ""}`,
        tone: "negative"
      };
    }
    return { text: "No change", tone: "neutral" };
  };

  const daySeries = trends.appointmentsByDay30d ?? [];
  const todayPoint = daySeries[daySeries.length - 1];
  const yesterdayPoint = daySeries[daySeries.length - 2];
  const appointmentsTrend = buildTrend(
    todayPoint?.count,
    yesterdayPoint?.count,
    "vs yesterday"
  );

  const weekSeries = trends.newPatientsByWeek12w ?? [];
  const latestWeek = weekSeries[weekSeries.length - 1];
  const priorWeek = weekSeries[weekSeries.length - 2];
  const newPatientsTrend = buildTrend(
    latestWeek?.count,
    priorWeek?.count,
    "vs last week"
  );

  const noPriorTrend = { text: "— No prior data", tone: "muted" as const };
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
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCcw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              {isFetching ? "Refreshing…" : "Refresh"}
            </Button>
            {resetEnabled && (
              <Button variant="destructive" size="sm" onClick={() => setShowResetModal(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Reset demo (dev)
              </Button>
            )}
          </div>
        }
      />

      {resetNotice && (
        <div className="rounded-2xl border border-success/30 bg-success-soft/80 px-4 py-3 text-sm text-success shadow-sm animate-toastIn">
          {resetNotice}
        </div>
      )}
      {resetError && (
        <div className="rounded-2xl border border-danger/40 bg-danger-soft/70 px-4 py-3 text-sm text-danger shadow-sm animate-toastIn">
          {resetError}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total patients"
          value={kpis.totalPatients}
          icon={<Users className="h-6 w-6" />}
          trendText={noPriorTrend.text}
          trendTone={noPriorTrend.tone}
        />
        <KpiCard
          label="Appointments today"
          value={kpis.appointmentsToday}
          icon={<Activity className="h-6 w-6" />}
          trendText={appointmentsTrend.text}
          trendTone={appointmentsTrend.tone}
        />
        <KpiCard
          label="Upcoming (7 days)"
          value={kpis.upcomingAppointments7d}
          icon={<CalendarClock className="h-6 w-6" />}
          trendText={noPriorTrend.text}
          trendTone={noPriorTrend.tone}
        />
        <KpiCard
          label="New patients (30 days)"
          value={kpis.newPatients30d}
          icon={<UserPlus className="h-6 w-6" />}
          trendText={newPatientsTrend.text}
          trendTone={newPatientsTrend.tone}
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

      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-[32px] border border-border/60 bg-surface/80 shadow-card backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-text">Reset demo data?</h3>
                <p className="text-xs text-text-muted">
                  This will delete your demo patients and appointments.
                </p>
              </div>
              <Button variant="ghost" type="button" onClick={() => setShowResetModal(false)}>
                Close
              </Button>
            </div>
            <div className="space-y-4 px-6 py-5 text-sm text-text-muted">
              <p>This cannot be undone.</p>
              <label className="flex items-center gap-3 text-sm text-text">
                <input
                  type="checkbox"
                  checked={reseedAfterReset}
                  onChange={(event) => setReseedAfterReset(event.target.checked)}
                  className="h-4 w-4 rounded border-border/60 bg-surface/70 text-primary focus:ring-primary"
                />
                Reseed sample data after reset
              </label>
              <p className="text-xs text-text-muted">Dev/demo only. Remove before release.</p>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-border/60 px-6 py-4">
              <Button variant="secondary" type="button" onClick={() => setShowResetModal(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                type="button"
                isLoading={resetting}
                disabled={resetting}
                onClick={async () => {
                  setResetting(true);
                  setResetError(null);
                  try {
                    await resetDemoData(reseedAfterReset);
                    setShowResetModal(false);
                    setResetNotice("Demo reset complete");
                    await refetch();
                  } catch (error) {
                    setResetError("Unable to reset demo.");
                  } finally {
                    setResetting(false);
                  }
                }}
              >
                {resetting ? "Resetting..." : "Reset"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
