import {
  Activity,
  CalendarClock,
  Info,
  Moon,
  RefreshCcw,
  Sun,
  Trash2,
  UserPlus,
  Users
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { AnalyticsCharts } from "../components/dashboard/AnalyticsCharts";
import { DashboardEmptyState } from "../components/dashboard/DashboardEmptyState";
import { KpiCard } from "../components/dashboard/KpiCard";
import { ErrorState } from "../components/ErrorState";
import { Button } from "../components/ui/Button";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useAuth } from "../hooks/useAuth";
import { useDashboardAnalytics } from "../hooks/useDashboardAnalytics";
import { usePageTitle } from "../hooks/usePageTitle";
import { resetDemoData } from "../services/demo";

const AdminDashboard = () => {
  usePageTitle("Dashboard");
  const { user } = useAuth();
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
  const [refreshKey, setRefreshKey] = useState(0);
  const resetEnabled = import.meta.env.VITE_ENABLE_DEMO_RESET === "true";
  const infoRef = useRef<HTMLButtonElement | null>(null);
  const resetModalRef = useRef<HTMLDivElement | null>(null);
  const resetLastFocusRef = useRef<HTMLElement | null>(null);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [infoPosition, setInfoPosition] = useState<{ top: number; left: number } | null>(
    null
  );

  useEffect(() => {
    if (!resetNotice && !resetError) return;
    const timer = window.setTimeout(() => {
      setResetNotice(null);
      setResetError(null);
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [resetNotice, resetError]);

  useEffect(() => {
    if (!showInfoTooltip || !infoRef.current) return;
    const updatePosition = () => {
      if (!infoRef.current) return;
      const rect = infoRef.current.getBoundingClientRect();
      setInfoPosition({
        top: rect.bottom + 10,
        left: rect.left + rect.width / 2
      });
    };
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [showInfoTooltip]);

  useEffect(() => {
    if (!showInfoTooltip) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowInfoTooltip(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showInfoTooltip]);

  useEffect(() => {
    if (!showResetModal) return;
    resetLastFocusRef.current = document.activeElement as HTMLElement | null;
    requestAnimationFrame(() => resetModalRef.current?.focus());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowResetModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      resetLastFocusRef.current?.focus();
    };
  }, [showResetModal]);

  const handleRefresh = async () => {
    const result = await refetch();
    if (!result.error) {
      setRefreshKey((prev) => prev + 1);
    }
  };

  const infoTooltip =
    showInfoTooltip && infoPosition
      ? createPortal(
          <div
            role="tooltip"
            className="fixed z-[9999] w-[260px] -translate-x-1/2 rounded-2xl border border-border/60 bg-surface/90 px-3 py-2 text-xs text-text shadow-card backdrop-blur transition-opacity duration-150"
            style={{ top: infoPosition.top, left: infoPosition.left }}
          >
            <p className="text-xs font-semibold text-text">What this dashboard shows</p>
            <p className="mt-1 text-xs text-text-muted">
              This dashboard provides a high-level overview of your clinic activity,
              including patient growth, appointment volume, and recent trends. All
              metrics are calculated per account and reflect demo data only.
            </p>
          </div>,
          document.body
        )
      : null;

  const firstName = user?.first_name?.trim();
  const emptyOnceKey = user?.id
    ? `dashboard-empty-${user.id}`
    : user?.email
      ? `dashboard-empty-${user.email}`
      : undefined;
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour <= 11) return { text: "Good morning", icon: Sun };
    if (hour >= 12 && hour <= 16) return { text: "Good afternoon", icon: Sun };
    if (hour >= 17 && hour <= 20) return { text: "Good evening", icon: Moon };
    return { text: "Good night", icon: Moon };
  };
  const { text: baseGreeting, icon: GreetingIcon } = useMemo(getGreeting, []);
  const greetingName = (firstName ?? "").trim();
  const greetingLabel = `${baseGreeting}${greetingName ? "," : ""}`;
  const [animateGreeting, setAnimateGreeting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setAnimateGreeting(false);
      return;
    }
    const key = "medyra:greetingAnimated";
    const hasAnimated = sessionStorage.getItem(key);
    if (!hasAnimated) {
      setAnimateGreeting(true);
      sessionStorage.setItem(key, "true");
    }
  }, []);

  const greetingBlock = (
    <div
      className={`flex items-center gap-2 text-xl font-semibold tracking-tight text-text ${
        animateGreeting ? "animate-fadeUp" : ""
      }`}
      style={animateGreeting ? { animationDelay: "90ms" } : undefined}
    >
      <GreetingIcon className="h-5 w-5 text-text-muted" />
      <span>{greetingLabel}</span>
      {greetingName ? (
        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {` ${greetingName}`}
        </span>
      ) : null}
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fadeUp">
        {greetingBlock}
        {infoTooltip}
        <SectionHeader
          title={
            <span className="inline-flex items-center gap-2">
              Dashboard
              <button
                ref={infoRef}
                type="button"
                aria-label="What this dashboard shows"
                onMouseEnter={() => setShowInfoTooltip(true)}
                onMouseLeave={() => setShowInfoTooltip(false)}
                onFocus={() => setShowInfoTooltip(true)}
                onBlur={() => setShowInfoTooltip(false)}
                onClick={() => setShowInfoTooltip((prev) => !prev)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-surface/70 text-text-muted shadow-sm backdrop-blur transition hover:text-text"
              >
                <Info className="h-4 w-4" />
              </button>
            </span>
          }
          description="Demo analytics overview"
          action={<div className="h-10 w-32 rounded-xl bg-surface/60" />}
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" data-tour="dash-kpis">
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
        {greetingBlock}
        {infoTooltip}
        <SectionHeader
          title={
            <span className="inline-flex items-center gap-2">
              Dashboard
              <button
                ref={infoRef}
                type="button"
                aria-label="What this dashboard shows"
                onMouseEnter={() => setShowInfoTooltip(true)}
                onMouseLeave={() => setShowInfoTooltip(false)}
                onFocus={() => setShowInfoTooltip(true)}
                onBlur={() => setShowInfoTooltip(false)}
                onClick={() => setShowInfoTooltip((prev) => !prev)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-surface/70 text-text-muted shadow-sm backdrop-blur transition hover:text-text"
              >
                <Info className="h-4 w-4" />
              </button>
            </span>
          }
          description="Demo analytics overview"
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  void handleRefresh();
                }}
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
                  Clear data
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
      {greetingBlock}
      {infoTooltip}
      <SectionHeader
        title={
          <span className="inline-flex items-center gap-2">
            Dashboard
            <button
              ref={infoRef}
              type="button"
              aria-label="What this dashboard shows"
              onMouseEnter={() => setShowInfoTooltip(true)}
              onMouseLeave={() => setShowInfoTooltip(false)}
              onFocus={() => setShowInfoTooltip(true)}
              onBlur={() => setShowInfoTooltip(false)}
              onClick={() => setShowInfoTooltip((prev) => !prev)}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-surface/70 text-text-muted shadow-sm backdrop-blur transition hover:text-text"
            >
              <Info className="h-4 w-4" />
            </button>
          </span>
        }
        description="Demo analytics overview"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                void handleRefresh();
              }}
              disabled={isFetching}
            >
              <RefreshCcw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              {isFetching ? "Refreshing…" : "Refresh"}
            </Button>
            {resetEnabled && (
              <Button variant="destructive" size="sm" onClick={() => setShowResetModal(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear data
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" data-tour="dash-kpis">
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
        <DashboardEmptyState
          onSampleLoaded={handleRefresh}
          onceKey={emptyOnceKey}
        />
      ) : (
        <AnalyticsCharts
          appointmentsByDay={trends.appointmentsByDay30d}
          newPatientsByWeek={trends.newPatientsByWeek12w}
          appointmentsByStatus={breakdowns.appointmentsByStatus30d}
          refreshKey={refreshKey}
        />
      )}

      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div
            ref={resetModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-demo-title"
            aria-describedby="reset-demo-desc"
            tabIndex={-1}
            className="w-full max-w-[95vw] rounded-[32px] border border-border/60 bg-surface/80 shadow-card backdrop-blur-xl sm:max-w-lg"
          >
            <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
              <div>
                <h3 id="reset-demo-title" className="text-lg font-semibold text-text">
                  Clear all data?
                </h3>
                <p id="reset-demo-desc" className="text-xs text-text-muted">
                  This will delete the entire data.
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
                Reseed data after reset
              </label>
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
                    await handleRefresh();
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
