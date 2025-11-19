import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  Appointment,
  createAppointment,
  fetchAppointments,
  fetchMyAppointments
} from "../services/appointments";
import { useAuth } from "./useAuth";

export const useAppointments = () => {
  return useQuery<Appointment[]>({
    queryKey: ["appointments"],
    queryFn: fetchAppointments
  });
};

export const useMyAppointments = () => {
  return useQuery<Appointment[]>({
    queryKey: ["myAppointments"],
    queryFn: fetchMyAppointments
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      if (user?.role === "patient") {
        queryClient.invalidateQueries({ queryKey: ["myAppointments"] });
      }
    }
  });
};
