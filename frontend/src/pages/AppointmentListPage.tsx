import { AppointmentCard } from "../components/AppointmentCard";
import { ErrorState } from "../components/ErrorState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAppointments } from "../hooks/useAppointments";

const AppointmentListPage = () => {
  const { data, isLoading, error } = useAppointments();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState message="Unable to fetch appointments." />;

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-700">All Appointments</h1>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {data?.map((appointment) => (
          <AppointmentCard key={appointment.id} appointment={appointment} />
        ))}
        {!data?.length && (
          <p className="text-sm text-slate-500">No appointments scheduled.</p>
        )}
      </div>
    </div>
  );
};

export default AppointmentListPage;
