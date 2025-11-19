import { Appointment } from "../services/appointments";

interface Props {
  appointment: Appointment;
}

export const AppointmentCard = ({ appointment }: Props) => {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-slate-500">{appointment.department}</p>
          <h3 className="text-lg font-semibold">{appointment.doctor_name}</h3>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-brand">
          {appointment.status}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-600">
        {new Date(appointment.appointment_datetime).toLocaleString()}
      </p>
      {appointment.notes && (
        <p className="mt-2 text-sm text-slate-500">{appointment.notes}</p>
      )}
    </div>
  );
};
