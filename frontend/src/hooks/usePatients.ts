import { useQuery } from "@tanstack/react-query";

import {
  Patient,
  fetchMyPatientProfile,
  fetchPatient,
  fetchPatients
} from "../services/patients";

export const usePatients = () => {
  return useQuery<Patient[]>({
    queryKey: ["patients"],
    queryFn: fetchPatients
  });
};

export const usePatient = (patientId: number) => {
  return useQuery<Patient>({
    queryKey: ["patient", patientId],
    queryFn: () => fetchPatient(patientId),
    enabled: !!patientId
  });
};

export const useMyPatientProfile = () => {
  return useQuery<Patient>({
    queryKey: ["myPatient"],
    queryFn: fetchMyPatientProfile
  });
};
