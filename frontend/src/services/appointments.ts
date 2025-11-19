import { apiClient } from "./api";

export type AppointmentStatus = "Scheduled" | "Completed" | "Cancelled";

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_name: string;
  department?: string;
  appointment_datetime: string;
  status: AppointmentStatus;
  notes?: string;
}

export const fetchAppointments = async (): Promise<Appointment[]> => {
  const { data } = await apiClient.get<Appointment[]>("/appointments/");
  return data;
};

export const fetchMyAppointments = async (): Promise<Appointment[]> => {
  const { data } = await apiClient.get<Appointment[]>("/appointments/my");
  return data;
};

export const createAppointment = async (payload: Partial<Appointment>) => {
  const { data } = await apiClient.post<Appointment>("/appointments/", payload);
  return data;
};
