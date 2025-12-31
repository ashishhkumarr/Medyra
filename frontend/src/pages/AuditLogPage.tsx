import { useMemo, useState } from "react";

import { ErrorState } from "../components/ErrorState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Card } from "../components/ui/Card";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useAuditLogs } from "../hooks/useAuditLogs";

const ACTION_OPTIONS = [
  "auth.login",
  "auth.change_password",
  "auth.otp_requested",
  "auth.signup_verified",
  "patient.create",
  "patient.update",
  "patient.delete",
  "patient.export_pdf",
  "appointment.create",
  "appointment.update",
  "appointment.reschedule",
  "appointment.cancel",
  "appointment.complete",
  "appointment.delete",
  "reminder.run"
];

const ENTITY_OPTIONS = ["patient", "appointment", "user", "reminder"];

const AuditLogPage = () => {
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useAuditLogs({
    action: actionFilter || undefined,
    entity_type: entityFilter || undefined,
    limit: 100
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter((log) => (log.summary || "").toLowerCase().includes(term));
  }, [data, search]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Audit Log"
        description="Track who did what and when across your clinic workspace."
      />

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Action
            </label>
            <select
              value={actionFilter}
              onChange={(event) => setActionFilter(event.target.value)}
              className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text shadow-sm focus:border-primary focus:outline-none"
            >
              <option value="">All actions</option>
              {ACTION_OPTIONS.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Entity
            </label>
            <select
              value={entityFilter}
              onChange={(event) => setEntityFilter(event.target.value)}
              className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text shadow-sm focus:border-primary focus:outline-none"
            >
              <option value="">All entities</option>
              {ENTITY_OPTIONS.map((entity) => (
                <option key={entity} value={entity}>
                  {entity}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-1 flex-col gap-1 min-w-[220px]">
            <label className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Search summary
            </label>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by summary..."
              className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text shadow-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </Card>

      {isLoading && <LoadingSpinner />}
      {error && <ErrorState message="Unable to load audit logs right now." />}

      {!isLoading && !error && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-surface-muted text-xs uppercase text-text-muted">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity</th>
                  <th className="px-4 py-3">Summary</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-text-muted" colSpan={4}>
                      No audit entries found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-border/60 bg-surface/70 hover:bg-surface-subtle"
                    >
                      <td className="px-4 py-3 text-text-muted">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-semibold text-text">{log.action}</td>
                      <td className="px-4 py-3 text-text-muted">
                        {log.entity_type}
                        {log.entity_id ? ` #${log.entity_id}` : ""}
                      </td>
                      <td className="px-4 py-3 text-text">
                        {log.summary || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AuditLogPage;
