import { AppointmentCard } from "../components/AppointmentCard";
import { ErrorState } from "../components/ErrorState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAppointments } from "../hooks/useAppointments";
import { usePatients } from "../hooks/usePatients";

const AdminDashboard = () => {
  const { data: appointments, isLoading: apptLoading, error: apptError } = useAppointments();
  const { data: patients, isLoading: patientLoading, error: patientError } = usePatients();

  if (apptLoading || patientLoading) {
    return <LoadingSpinner />;
  }

  if (apptError || patientError) {
    return <ErrorState message="Unable to load dashboard data." />;
  }

  const scheduledCount = appointments ? appointments.filter((appt) => appt.status === "Scheduled").length : 0;
  const completedCount = appointments ? appointments.filter((appt) => appt.status === "Completed").length : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Active Patients</p>
          <p className="text-3xl font-bold">{patients?.length ?? 0}</p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Scheduled Appointments</p>
          <p className="text-3xl font-bold">{scheduledCount}</p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Completed Appointments</p>
          <p className="text-3xl font-bold">{completedCount}</p>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-700">Upcoming Appointments</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {appointments?.slice(0, 6).map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
          {!appointments?.length && (
            <p className="text-sm text-slate-500">No appointments scheduled.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
