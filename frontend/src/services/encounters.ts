import { apiClient } from "./api";

export type EncounterType =
  | "Office visit"
  | "Telehealth"
  | "Follow-up"
  | "New patient"
  | "Procedure";

export type EncounterStatus = "Draft" | "Signed";

export interface Encounter {
  id: number;
  patient_id: number;
  provider?: string | null;
  encounter_date?: string | null;
  encounter_type: EncounterType;
  chief_complaint?: string | null;
  subjective?: string | null;
  objective?: string | null;
  assessment?: string | null;
  plan?: string | null;
  diagnosis?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  bp_systolic?: number | null;
  bp_diastolic?: number | null;
  heart_rate?: number | null;
  temperature_c?: number | null;
  respiratory_rate?: number | null;
  spo2?: number | null;
  status: EncounterStatus;
  created_at: string;
  signed_at?: string | null;
}

export interface EncounterCreatePayload {
  patient_id: number;
  encounter_type?: EncounterType;
  provider?: string;
  encounter_date?: string;
  chief_complaint?: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  diagnosis?: string;
  height_cm?: number;
  weight_kg?: number;
  bp_systolic?: number;
  bp_diastolic?: number;
  heart_rate?: number;
  temperature_c?: number;
  respiratory_rate?: number;
  spo2?: number;
}

export const fetchEncounters = async (patientId: number): Promise<Encounter[]> => {
  const { data } = await apiClient.get<Encounter[]>("/encounters/", {
    params: { patient_id: patientId }
  });
  return data;
};

export const fetchRecentEncounters = async (limit = 8): Promise<Encounter[]> => {
  const { data } = await apiClient.get<Encounter[]>("/encounters/recent", {
    params: { limit }
  });
  return data;
};

export const createEncounter = async (
  payload: EncounterCreatePayload
): Promise<Encounter> => {
  const { data } = await apiClient.post<Encounter>("/encounters/", payload);
  return data;
};

export const signEncounter = async (encounterId: number): Promise<Encounter> => {
  const { data } = await apiClient.post<Encounter>(`/encounters/${encounterId}/sign`);
  return data;
};

export const deleteEncounter = async (encounterId: number): Promise<void> => {
  await apiClient.delete(`/encounters/${encounterId}`);
};
