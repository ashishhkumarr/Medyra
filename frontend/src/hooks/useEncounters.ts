import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  Encounter,
  EncounterCreatePayload,
  createEncounter,
  deleteEncounter,
  fetchEncounters,
  fetchRecentEncounters,
  signEncounter
} from "../services/encounters";

export const usePatientEncounters = (patientId: number) => {
  return useQuery<Encounter[]>({
    queryKey: ["encounters", patientId],
    queryFn: () => fetchEncounters(patientId),
    enabled: !!patientId
  });
};

export const useRecentEncounters = (limit = 8) => {
  return useQuery<Encounter[]>({
    queryKey: ["encounters", "recent", limit],
    queryFn: () => fetchRecentEncounters(limit)
  });
};

export const useCreateEncounter = (patientId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EncounterCreatePayload) => createEncounter(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["encounters", patientId] });
      queryClient.invalidateQueries({ queryKey: ["encounters", "recent"] });
    }
  });
};

export const useSignEncounter = (patientId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (encounterId: number) => signEncounter(encounterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["encounters", patientId] });
      queryClient.invalidateQueries({ queryKey: ["encounters", "recent"] });
    }
  });
};

export const useDeleteEncounter = (patientId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (encounterId: number) => deleteEncounter(encounterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["encounters", patientId] });
      queryClient.invalidateQueries({ queryKey: ["encounters", "recent"] });
    }
  });
};
