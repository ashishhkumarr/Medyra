import { Link } from "react-router-dom";
import { FileText, HeartPulse } from "lucide-react";

import { usePatients } from "../../hooks/usePatients";
import { useRecentEncounters } from "../../hooks/useEncounters";
import { Card } from "../ui/Card";

const formatDate = (value?: string | null) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString([], { month: "short", day: "numeric" });
};

export const RecentEncountersPanel = () => {
  const { data: encounters, isLoading } = useRecentEncounters(8);
  const { data: patients } = usePatients();

  const nameById = new Map((patients ?? []).map((p) => [p.id, p.full_name]));
  const drafts = (encounters ?? []).filter((e) => e.status === "Draft").length;

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <FileText className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-text">Recent clinical notes</h3>
            <p className="text-xs text-text-subtle">Latest documented visits</p>
          </div>
        </div>
        {drafts > 0 && (
          <span className="rounded-full bg-warning-soft/80 px-3 py-1 text-xs font-semibold text-warning">
            {drafts} draft{drafts > 1 ? "s" : ""} pending
          </span>
        )}
      </div>

      {isLoading && (
        <div className="space-y-2 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-surface-subtle" />
          ))}
        </div>
      )}

      {!isLoading && !encounters?.length && (
        <p className="rounded-2xl border border-border/60 bg-surface/70 px-4 py-6 text-center text-sm text-text-muted">
          No clinical notes yet. Open a patient and document a visit to see it here.
        </p>
      )}

      {!isLoading && !!encounters?.length && (
        <div className="divide-y divide-border/40">
          {encounters.map((e) => (
            <Link
              key={e.id}
              to={`/patients/${e.patient_id}`}
              className="flex items-center gap-3 py-2.5 transition hover:opacity-80"
            >
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-surface-subtle text-primary">
                <HeartPulse className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-text">
                  {nameById.get(e.patient_id) ?? `Patient #${e.patient_id}`}
                </p>
                <p className="truncate text-xs text-text-subtle">
                  {e.encounter_type}
                  {e.chief_complaint ? ` · ${e.chief_complaint}` : ""}
                </p>
              </div>
              <div className="flex flex-none items-center gap-2">
                <span className="text-xs text-text-subtle">{formatDate(e.encounter_date)}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    e.status === "Draft"
                      ? "bg-warning-soft/80 text-warning"
                      : "bg-success-soft/80 text-success"
                  }`}
                >
                  {e.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
};
