import { useEffect, useMemo, useState } from "react";

import { Button } from "./ui/Button";
import { DateTimePicker } from "./ui/DateTimePicker";
import { InputField, TextAreaField } from "./ui/FormField";
import { Patient } from "../services/patients";

interface Props {
  patients: Patient[];
  onSubmit: (values: {
    patient_id: number;
    doctor_name?: string;
    department?: string;
    appointment_datetime: string;
    appointment_end_datetime?: string;
    notes?: string;
    reminder_email_enabled?: boolean;
    reminder_sms_enabled?: boolean;
    reminder_email_minutes_before?: number;
    reminder_sms_minutes_before?: number;
  }) => Promise<void> | void;
  isSubmitting?: boolean;
}

export const AppointmentForm = ({ patients, onSubmit, isSubmitting }: Props) => {
  const [formState, setFormState] = useState({
    patient_id: patients[0]?.id ?? 0,
    appointment_datetime: "",
    appointment_end_datetime: "",
    doctor_name: "",
    department: "",
    notes: "",
    reminder_email_enabled: false,
    reminder_sms_enabled: false,
    reminder_email_minutes_before: 1440,
    reminder_sms_minutes_before: 120
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (patients.length) {
      setFormState((prev) => ({ ...prev, patient_id: patients[0].id }));
    }
  }, [patients]);

  const filteredPatients = useMemo(() => {
    const trimmed = searchTerm.trim().toLowerCase();
    if (!trimmed) return patients;
    return patients.filter((patient) => {
      const name = patient.full_name?.toLowerCase() ?? "";
      const email = patient.email?.toLowerCase() ?? "";
      const phone = patient.phone?.toLowerCase() ?? "";
      return name.includes(trimmed) || email.includes(trimmed) || phone.includes(trimmed);
    });
  }, [patients, searchTerm]);

  const isPastAppointment = useMemo(() => {
    if (!formState.appointment_datetime) return false;
    const startTime = new Date(formState.appointment_datetime).getTime();
    return !Number.isNaN(startTime) && startTime < Date.now();
  }, [formState.appointment_datetime]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: "appointment_datetime" | "appointment_end_datetime") => {
    return (value: string) => {
      setFormState((prev) => ({ ...prev, [name]: value }));
    };
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!formState.patient_id) {
      nextErrors.patient_id = "Select a patient";
    }
    if (!formState.appointment_datetime) {
      nextErrors.appointment_datetime = "Required";
    }
    if (formState.appointment_end_datetime) {
      const startTime = new Date(formState.appointment_datetime).getTime();
      const endTime = new Date(formState.appointment_end_datetime).getTime();
      if (!Number.isNaN(startTime) && !Number.isNaN(endTime) && endTime <= startTime) {
        nextErrors.appointment_end_datetime = "End time must be after start time";
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    await onSubmit(formState);
  };

  const hasStartTime = Boolean(formState.appointment_datetime);
  const reminderMessage = isPastAppointment
    ? "Reminders aren’t available for completed or past visits."
    : "Confirm the appointment to enable reminders.";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-3">
        <InputField
          label="Search patients"
          placeholder="Search by name, email, or phone"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <label className="text-sm font-medium text-text">
          Patient
          <select
            name="patient_id"
            value={formState.patient_id}
            onChange={handleChange}
            className="glass-input mt-2 w-full text-sm"
          >
            {filteredPatients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.full_name}
              </option>
            ))}
          </select>
          {errors.patient_id && <span className="mt-1 block text-xs text-danger">{errors.patient_id}</span>}
        </label>
        {!filteredPatients.length && (
          <p className="rounded-2xl border border-border/60 bg-surface/70 px-4 py-3 text-sm text-text-muted shadow-sm backdrop-blur">
            No patients match your search.
          </p>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <DateTimePicker
          label="Start time"
          mode="datetime"
          value={formState.appointment_datetime}
          onChange={handleDateChange("appointment_datetime")}
          error={errors.appointment_datetime}
          required
        />
        <DateTimePicker
          label="End time (optional)"
          mode="datetime"
          value={formState.appointment_end_datetime}
          onChange={handleDateChange("appointment_end_datetime")}
          error={errors.appointment_end_datetime}
        />
        <InputField
          label="Doctor (optional)"
          name="doctor_name"
          value={formState.doctor_name}
          onChange={handleChange}
          placeholder="Dr. Adams"
        />
        <InputField
          label="Department (optional)"
          name="department"
          value={formState.department}
          onChange={handleChange}
          placeholder="Cardiology"
        />
      </div>
      {isPastAppointment && (
        <p className="text-xs text-text-muted">
          This is a past date. The appointment will be saved as a completed visit (no reminders).
        </p>
      )}
      <div className="rounded-3xl border border-border/60 bg-surface/70 px-4 py-4 text-sm text-text-muted shadow-sm backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
              Reminders (Demo)
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Reminders are simulated in demo mode and do not send real messages.
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formState.reminder_email_enabled}
                            onChange={(event) =>
                              setFormState((prev) => ({
                                ...prev,
                                reminder_email_enabled: event.target.checked
                              }))
                            }
                          />
                          <span className="text-sm text-text">Email reminder</span>
                        </label>
                        <select
                          value={formState.reminder_email_minutes_before}
                          onChange={(event) =>
                            setFormState((prev) => ({
                              ...prev,
                              reminder_email_minutes_before: Number(event.target.value)
                            }))
                          }
                          disabled={!formState.reminder_email_enabled || !hasStartTime}
                          className={`glass-input w-full max-w-[180px] text-xs ${
                            !formState.reminder_email_enabled || !hasStartTime
                              ? "cursor-not-allowed opacity-60"
                              : ""
                          }`}
                        >
                          {[1440, 720, 240, 120, 60, 30].map((minutes) => (
                            <option key={minutes} value={minutes}>
                              {minutes} min before
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formState.reminder_sms_enabled}
                            onChange={(event) =>
                              setFormState((prev) => ({
                                ...prev,
                                reminder_sms_enabled: event.target.checked
                              }))
                            }
                          />
                          <span className="text-sm text-text">SMS reminder (Demo)</span>
                        </label>
                        <select
                          value={formState.reminder_sms_minutes_before}
                          onChange={(event) =>
                            setFormState((prev) => ({
                              ...prev,
                              reminder_sms_minutes_before: Number(event.target.value)
                            }))
                          }
                          disabled={!formState.reminder_sms_enabled || !hasStartTime}
                          className={`glass-input w-full max-w-[180px] text-xs ${
                            !formState.reminder_sms_enabled || !hasStartTime
                              ? "cursor-not-allowed opacity-60"
                              : ""
                          }`}
                        >
                          {[240, 120, 60, 30, 15].map((minutes) => (
                            <option key={minutes} value={minutes}>
                              {minutes} min before
                            </option>
                          ))}
                        </select>
                      </div>
                      {!hasStartTime && !isPastAppointment && (
                        <p className="text-xs text-text-subtle">
                          Select a start time to enable reminder scheduling.
                        </p>
                      )}
                      <p className="text-xs text-text-subtle">{reminderMessage}</p>
                    </div>
                  </div>
      <TextAreaField
        label="Notes (optional)"
        name="notes"
        value={formState.notes}
        onChange={handleChange}
        placeholder="Add patient prep instructions or key reminders…"
      />
      <Button type="submit" size="lg" className="w-full justify-center" isLoading={isSubmitting}>
        {isSubmitting ? "Scheduling..." : "Schedule appointment"}
      </Button>
    </form>
  );
};
