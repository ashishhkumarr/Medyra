import { useEffect, useState } from "react";

import { AppointmentStatus } from "../services/appointments";
import { Patient } from "../services/patients";

interface Props {
  patients: Patient[];
  onSubmit: (values: {
    patient_id: number;
    doctor_name: string;
    department?: string;
    appointment_datetime: string;
    notes?: string;
    status: AppointmentStatus;
  }) => Promise<void> | void;
  isSubmitting?: boolean;
}

export const AppointmentForm = ({ patients, onSubmit, isSubmitting }: Props) => {
  const [formState, setFormState] = useState({
    patient_id: patients[0]?.id ?? 0,
    doctor_name: "",
    department: "",
    appointment_datetime: "",
    notes: "",
    status: "Scheduled" as AppointmentStatus
  });

  useEffect(() => {
    if (patients.length) {
      setFormState((prev) => ({ ...prev, patient_id: patients[0].id }));
    }
  }, [patients]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(formState);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-semibold text-slate-600">Patient</label>
        <select
          name="patient_id"
          value={formState.patient_id}
          onChange={handleChange}
          className="mt-1 w-full rounded border px-3 py-2"
        >
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.full_name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-slate-600">Doctor</label>
          <input
            name="doctor_name"
            value={formState.doctor_name}
            onChange={handleChange}
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="Dr. Adams"
            required
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-600">Department</label>
          <input
            name="department"
            value={formState.department}
            onChange={handleChange}
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="Cardiology"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold text-slate-600">
          Appointment Date & Time
        </label>
        <input
          type="datetime-local"
          name="appointment_datetime"
          value={formState.appointment_datetime}
          onChange={handleChange}
          className="mt-1 w-full rounded border px-3 py-2"
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-slate-600">Status</label>
          <select
            name="status"
            value={formState.status}
            onChange={handleChange}
            className="mt-1 w-full rounded border px-3 py-2"
          >
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-600">Notes</label>
          <textarea
            name="notes"
            value={formState.notes}
            onChange={handleChange}
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="Prep instructions..."
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : "Create Appointment"}
      </button>
    </form>
  );
};
