import { apiClient } from "./api";
import { AuthUser } from "../context/AuthContext";

export const fetchCurrentUser = async (): Promise<AuthUser> => {
  const { data } = await apiClient.get<AuthUser>("/users/me");
  return data;
};

export const updateCurrentUser = async (payload: {
  first_name?: string;
  last_name?: string;
  phone?: string;
  specialty?: string;
  license_number?: string;
  license_state?: string;
  license_country?: string;
  npi_number?: string;
  taxonomy_code?: string;
  clinic_name?: string;
  clinic_address?: string;
  clinic_city?: string;
  clinic_state?: string;
  clinic_zip?: string;
  clinic_country?: string;
}): Promise<AuthUser> => {
  const { data } = await apiClient.patch<AuthUser>("/users/me", payload);
  return data;
};

export const changePassword = async (payload: {
  old_password: string;
  new_password: string;
  confirm_new_password: string;
}) => {
  const { data } = await apiClient.post("/users/change-password", payload);
  return data;
};
