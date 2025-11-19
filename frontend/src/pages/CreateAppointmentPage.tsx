import { useNavigate } from "react-router-dom";

import { AppointmentForm } from "../components/AppointmentForm";
import { ErrorState } from "../components/ErrorState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useCreateAppointment } from "../hooks/useAppointments";
import { usePatients } from "../hooks/usePatients";

const CreateAppointmentPage = () => {
  const navigate = useNavigate();
  const { data: patients, isLoading, error } = usePatients();
  const mutation = useCreateAppointment();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState message="Unable to load patients" />;

  const handleSubmit = async (values: any) => {
    await mutation.mutateAsync(values);
    navigate("/appointments");
  };

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-700">Create Appointment</h1>
      {patients && patients.length > 0 ? (
        <div className="mt-6">
          <AppointmentForm
            patients={patients}
            onSubmit={handleSubmit}
            isSubmitting={mutation.isPending}
          />
          {mutation.isError && (
            <p className="mt-4 text-sm text-red-500">
              Failed to create appointment. Please try again.
            </p>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-500">
          Add a patient profile before scheduling appointments.
        </p>
      )}
    </div>
  );
};

export default CreateAppointmentPage;
