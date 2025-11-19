import { apiClient } from "./api";

export interface Patient {
  id: number;
  full_name: string;
  email?: string;
  phone?: string;
  medical_history?: string;
  medications?: string;
  notes?: string;
  user_id?: number;
}

export const fetchPatients = async (): Promise<Patient[]> => {
  const { data } = await apiClient.get<Patient[]>("/patients/");
  return data;
};

export const fetchPatient = async (patientId: number): Promise<Patient> => {
  const { data } = await apiClient.get<Patient>(`/patients/${patientId}`);
  return data;
};

export const fetchMyPatientProfile = async (): Promise<Patient> => {
  const { data } = await apiClient.get<Patient>("/patients/me");
  return data;
};

export const createPatient = async (payload: Partial<Patient>) => {
  const { data } = await apiClient.post<Patient>("/patients/", payload);
  return data;
};
