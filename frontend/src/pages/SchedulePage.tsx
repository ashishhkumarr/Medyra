import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarPlus, ChevronLeft, ChevronRight, List } from "lucide-react";

import { ErrorState } from "../components/ErrorState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useAppointments } from "../hooks/useAppointments";
import { usePatients } from "../hooks/usePatients";
import { usePageTitle } from "../hooks/usePageTitle";
import type { Appointment } from "../services/appointments";

const DAY_START = 7; // 07:00
const DAY_END = 20; // 20:00
const HOUR_PX = 64;

const statusStyle: Record<string, string> = {
  Confirmed: "border-secondary/40 bg-secondary-soft/70 text-secondary",
  Unconfirmed: "border-warning/40 bg-warning-soft/70 text-warning",
  Scheduled: "border-warning/40 bg-warning-soft/70 text-warning",
  Completed: "border-success/40 bg-success-soft/70 text-success",
  Cancelled: "border-danger/40 bg-danger-soft/70 text-danger"
};

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
const addDays = (d: Date, n: number) => {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
};
const fmtTime = (d: Date) =>
  d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).replace(" ", "");
const fmtHour = (h: number) => {
  const period = h >= 12 ? "pm" : "am";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}${period}`;
};

const SchedulePage = () => {
  usePageTitle("Schedule");
  const navigate = useNavigate();
  const { data: appointments, isLoading, error } = useAppointments();
  const { data: patients } = usePatients();
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));

  const nameById = useMemo(
    () => new Map((patients ?? []).map((p) => [p.id, p.full_name])),
    [patients]
  );

  const placed = useMemo(() => {
    const dayAppts = (appointments ?? [])
      .filter((a) => isSameDay(new Date(a.appointment_datetime), selectedDate))
      .sort(
        (a, b) =>
          new Date(a.appointment_datetime).getTime() -
          new Date(b.appointment_datetime).getTime()
      );
    const laneEnds: number[] = [];
    const items = dayAppts.map((appt: Appointment) => {
      const startDate = new Date(appt.appointment_datetime);
      const start = startDate.getTime();
      const end = appt.appointment_end_datetime
        ? new Date(appt.appointment_end_datetime).getTime()
        : start + 30 * 60000;
      let lane = laneEnds.findIndex((e) => e <= start);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(end);
      } else {
        laneEnds[lane] = end;
      }
      return { appt, startDate, start, end, lane };
    });
    return { items, laneCount: Math.max(1, laneEnds.length) };
  }, [appointments, selectedDate]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState message="We couldn't load the schedule. Please try again." />;

  const hours = Array.from({ length: DAY_END - DAY_START + 1 }, (_, i) => DAY_START + i);
  const gridHeight = (DAY_END - DAY_START) * HOUR_PX;
  const todayIsSelected = isSameDay(selectedDate, new Date());
  const now = new Date();
  const nowOffset =
    (now.getHours() + now.getMinutes() / 60 - DAY_START) * HOUR_PX;

  return (
    <Card className="animate-fadeUp space-y-5 p-4 sm:p-6">
      <SectionHeader
        title="Schedule"
        description="Your day at a glance."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/appointments">
              <Button variant="secondary" size="sm" className="gap-2">
                <List className="h-4 w-4" /> List view
              </Button>
            </Link>
            <Link to="/appointments/create">
              <Button size="sm" className="gap-2">
                <CalendarPlus className="h-4 w-4" /> New appointment
              </Button>
            </Link>
          </div>
        }
      />

      {/* date controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous day"
            onClick={() => setSelectedDate((d) => addDays(d, -1))}
            className="rounded-xl border border-border/60 bg-surface p-2 text-text-muted transition hover:text-text"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next day"
            onClick={() => setSelectedDate((d) => addDays(d, 1))}
            className="rounded-xl border border-border/60 bg-surface p-2 text-text-muted transition hover:text-text"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <p className="font-display text-xl text-text">
            {selectedDate.toLocaleDateString([], {
              weekday: "long",
              month: "long",
              day: "numeric"
            })}
          </p>
        </div>
        {!todayIsSelected && (
          <Button variant="secondary" size="sm" onClick={() => setSelectedDate(startOfDay(new Date()))}>
            Today
          </Button>
        )}
      </div>

      {!placed.items.length && (
        <p className="rounded-2xl border border-border/60 bg-surface/70 px-4 py-10 text-center text-sm text-text-muted">
          No appointments on this day.
        </p>
      )}

      {!!placed.items.length && (
        <div className="overflow-x-auto">
          <div className="flex min-w-[520px] gap-3">
            {/* hour gutter */}
            <div className="relative w-14 flex-none" style={{ height: gridHeight }}>
              {hours.map((h, i) => (
                <div
                  key={h}
                  className="absolute right-2 -translate-y-1/2 text-[11px] font-medium text-text-subtle"
                  style={{ top: i * HOUR_PX }}
                >
                  {fmtHour(h)}
                </div>
              ))}
            </div>

            {/* grid */}
            <div
              className="relative flex-1 rounded-2xl border border-border/60 bg-surface/50"
              style={{ height: gridHeight }}
            >
              {hours.map((h, i) => (
                <div
                  key={h}
                  className="absolute left-0 right-0 border-t border-border/40"
                  style={{ top: i * HOUR_PX }}
                />
              ))}

              {todayIsSelected && nowOffset >= 0 && nowOffset <= gridHeight && (
                <div
                  className="absolute left-0 right-0 z-10 border-t-2 border-danger/70"
                  style={{ top: nowOffset }}
                >
                  <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-danger" />
                </div>
              )}

              {placed.items.map(({ appt, startDate, start, end, lane }) => {
                const startHours = startDate.getHours() + startDate.getMinutes() / 60;
                const top = Math.max(0, (startHours - DAY_START) * HOUR_PX);
                const durMin = Math.max(20, (end - start) / 60000);
                const height = Math.max(26, (durMin / 60) * HOUR_PX - 4);
                const widthPct = 100 / placed.laneCount;
                const status = appt.status === "Scheduled" ? "Unconfirmed" : appt.status;
                return (
                  <button
                    key={appt.id}
                    type="button"
                    onClick={() => navigate(`/patients/${appt.patient_id}`)}
                    className={`absolute overflow-hidden rounded-lg border px-2 py-1 text-left shadow-sm transition hover:shadow-card ${statusStyle[status] ?? statusStyle.Unconfirmed}`}
                    style={{
                      top,
                      height,
                      left: `calc(${lane * widthPct}% + 4px)`,
                      width: `calc(${widthPct}% - 8px)`
                    }}
                  >
                    <p className="truncate text-xs font-semibold text-text">
                      {fmtTime(startDate)} · {nameById.get(appt.patient_id) ?? `Patient #${appt.patient_id}`}
                    </p>
                    {height > 38 && (
                      <p className="truncate text-[11px] text-text-muted">
                        {appt.department || "Visit"}
                        {appt.doctor_name ? ` · ${appt.doctor_name}` : ""}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default SchedulePage;
