import {
  authResponseSchema,
  type LoginFormData,
  type RegisterFormData,
  type RefreshTokenCommand,
} from "@/schemas";
import { apiClient } from "@/lib/client";

export const authApi = {
  login: async (body: LoginFormData) => {
    const { data } = await apiClient.post("/auth/login", body);
    return authResponseSchema.parse(data);
  },

  register: async (body: RegisterFormData) => {
    const { data } = await apiClient.post("/auth/register", body);
    return authResponseSchema.parse(data);
  },

  refresh: async (body: RefreshTokenCommand) => {
    const { data } = await apiClient.post("/auth/refresh", body);
    return authResponseSchema.parse(data);
  },
};
