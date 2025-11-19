import { apiClient } from "./api";
import { AuthUser } from "../context/AuthContext";

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export const loginRequest = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", {
    email,
    password
  });
  return data;
};

export const registerUser = async (payload: {
  email: string;
  password: string;
  full_name: string;
  role: string;
  phone?: string;
}) => {
  const { data } = await apiClient.post("/auth/register", payload);
  return data;
};
