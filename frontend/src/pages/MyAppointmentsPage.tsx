import { AppointmentCard } from "../components/AppointmentCard";
import { ErrorState } from "../components/ErrorState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useMyAppointments } from "../hooks/useAppointments";

const MyAppointmentsPage = () => {
  const { data, isLoading, error } = useMyAppointments();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState message="Unable to fetch your appointments." />;

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-700">My Appointments</h1>
      <div className="mt-4 space-y-4">
        {data?.map((appointment) => (
          <AppointmentCard key={appointment.id} appointment={appointment} />
        ))}
        {!data?.length && (
          <p className="text-sm text-slate-500">You have no appointments scheduled.</p>
        )}
      </div>
    </div>
  );
};

export default MyAppointmentsPage;
