import { apiClient } from "./api";
import type { Patient } from "./patients";

export type AppointmentStatus =
  | "Unconfirmed"
  | "Confirmed"
  | "Scheduled"
  | "Completed"
  | "Cancelled";

export interface Appointment {
  id: number;
  patient_id: number;
  patient?: Patient;
  doctor_name: string;
  department?: string;
  appointment_datetime: string;
  appointment_end_datetime?: string;
  status: AppointmentStatus;
  notes?: string;
  reminder_email_enabled?: boolean;
  reminder_sms_enabled?: boolean;
  reminder_email_minutes_before?: number;
  reminder_sms_minutes_before?: number;
  reminder_next_run_at?: string | null;
}

export interface AppointmentUpdatePayload {
  doctor_name?: string;
  department?: string;
  appointment_datetime?: string;
  appointment_end_datetime?: string | null;
  notes?: string;
  status?: AppointmentStatus;
  reminder_email_enabled?: boolean;
  reminder_sms_enabled?: boolean;
  reminder_email_minutes_before?: number;
  reminder_sms_minutes_before?: number;
}

export const fetchAppointments = async (): Promise<Appointment[]> => {
  const { data } = await apiClient.get<Appointment[]>("/appointments/");
  return data;
};

export const createAppointment = async (payload: Partial<Appointment>) => {
  const { data } = await apiClient.post<Appointment>("/appointments/", payload);
  return data;
};

export const updateAppointment = async (
  appointmentId: number,
  payload: AppointmentUpdatePayload
): Promise<Appointment> => {
  const { data } = await apiClient.patch<Appointment>(
    `/appointments/${appointmentId}`,
    payload
  );
  return data;
};

export const cancelAppointment = async (appointmentId: number): Promise<Appointment> => {
  const { data } = await apiClient.patch<Appointment>(
    `/appointments/${appointmentId}/cancel`
  );
  return data;
};

export const completeAppointment = async (appointmentId: number): Promise<Appointment> => {
  const { data } = await apiClient.patch<Appointment>(
    `/appointments/${appointmentId}/complete`
  );
  return data;
};

export const simulateAppointmentReminder = async (appointmentId: number) => {
  const { data } = await apiClient.post(
    `/appointments/${appointmentId}/reminders/simulate`
  );
  return data;
};
