import { Calendar, FileText, User } from "lucide-react";

import { Appointment } from "../services/appointments";

interface Props {
  appointment: Appointment;
}

const statusColors: Record<string, string> = {
  Scheduled: "bg-secondary-soft/80 text-secondary",
  Completed: "bg-success-soft/80 text-success",
  Cancelled: "bg-danger-soft/80 text-danger"
};

export const AppointmentCard = ({ appointment }: Props) => {
  const statusStyle = statusColors[appointment.status] ?? "bg-surface-muted text-text-muted";

  return (
    <div className="glass-card flex flex-col gap-3 border border-border/70 p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-subtle">{appointment.department || "General"}</p>
          <h3 className="text-lg font-semibold text-text">{appointment.doctor_name}</h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle}`}>
          {appointment.status}
        </span>
      </div>
      {appointment.patient && (
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <User className="h-4 w-4" />
          <span>{appointment.patient.full_name}</span>
        </div>
      )}
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <Calendar className="h-4 w-4" />
        {new Date(appointment.appointment_datetime).toLocaleString()}
      </div>
      {appointment.notes && (
        <div className="flex items-start gap-2 rounded-2xl bg-surface-subtle px-3 py-2 text-sm text-text-muted">
          <FileText className="h-4 w-4" />
          {appointment.notes}
        </div>
      )}
    </div>
  );
};
