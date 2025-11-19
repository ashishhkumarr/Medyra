import { apiClient } from "./api";
import { AuthUser } from "../context/AuthContext";

export const fetchCurrentUser = async (): Promise<AuthUser> => {
  const { data } = await apiClient.get<AuthUser>("/users/me");
  return data;
};

export const updateCurrentUser = async (payload: {
  full_name?: string;
  phone?: string;
  password?: string;
}): Promise<AuthUser> => {
  const { data } = await apiClient.put<AuthUser>("/users/me", payload);
  return data;
};
