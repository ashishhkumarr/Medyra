import { useState } from "react";

import { AppointmentCard } from "../components/AppointmentCard";
import { ErrorState } from "../components/ErrorState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useCreateAppointment, useMyAppointments } from "../hooks/useAppointments";
import { useMyPatientProfile } from "../hooks/usePatients";

const PatientDashboard = () => {
  const { data: profile, isLoading: profileLoading, error: profileError } = useMyPatientProfile();
  const { data: appointments, isLoading: apptLoading, error: apptError } = useMyAppointments();
  const createAppointment = useCreateAppointment();
  const [requestForm, setRequestForm] = useState({
    doctor_name: "",
    department: "",
    appointment_datetime: "",
    notes: ""
  });

  if (profileLoading || apptLoading) {
    return <LoadingSpinner />;
  }

  if (profileError || apptError) {
    return <ErrorState message="Unable to load patient dashboard." />;
  }
  if (!profile) {
    return <ErrorState message="Patient profile unavailable." />;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-700">Welcome back, {profile?.full_name}</h2>
        <p className="mt-2 text-sm text-slate-500">
          Keep your contact details up to date and monitor your visits.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs text-slate-500">Phone</p>
            <p className="font-medium">{profile?.phone || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Email</p>
            <p className="font-medium">{profile?.email || "—"}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-700">Request an Appointment</h2>
        <p className="mt-1 text-sm text-slate-500">
          Submit your preferred slot and the clinic team will confirm.
        </p>
        <form
          className="mt-4 grid gap-4 md:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();
            await createAppointment.mutateAsync({
              doctor_name: requestForm.doctor_name,
              department: requestForm.department,
              appointment_datetime: requestForm.appointment_datetime,
              notes: requestForm.notes,
              patient_id: profile?.id,
              status: "Scheduled"
            });
            setRequestForm({
              doctor_name: "",
              department: "",
              appointment_datetime: "",
              notes: ""
            });
          }}
        >
          <div>
            <label className="text-sm font-semibold text-slate-600">Doctor</label>
            <input
              required
              value={requestForm.doctor_name}
              onChange={(event) =>
                setRequestForm((prev) => ({ ...prev, doctor_name: event.target.value }))
              }
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-600">Department</label>
            <input
              value={requestForm.department}
              onChange={(event) =>
                setRequestForm((prev) => ({ ...prev, department: event.target.value }))
              }
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-600">Preferred Time</label>
            <input
              type="datetime-local"
              required
              value={requestForm.appointment_datetime}
              onChange={(event) =>
                setRequestForm((prev) => ({
                  ...prev,
                  appointment_datetime: event.target.value
                }))
              }
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-600">Notes</label>
            <textarea
              value={requestForm.notes}
              onChange={(event) =>
                setRequestForm((prev) => ({ ...prev, notes: event.target.value }))
              }
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={createAppointment.isPending}
            className="rounded bg-brand px-4 py-2 text-white hover:bg-brand-dark disabled:opacity-60 md:col-span-2"
          >
            {createAppointment.isPending ? "Submitting..." : "Send Request"}
          </button>
        </form>
        {createAppointment.isSuccess && (
          <p className="mt-2 text-sm text-green-600">Request submitted!</p>
        )}
        {createAppointment.isError && (
          <p className="mt-2 text-sm text-red-500">
            Unable to send request. Please try again.
          </p>
        )}
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-700">Your Appointments</h2>
        <div className="mt-4 space-y-4">
          {appointments?.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
          {!appointments?.length && (
            <p className="text-sm text-slate-500">No appointments yet. Request one above.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
