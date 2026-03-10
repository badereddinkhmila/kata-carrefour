import {
  authResponseSchema,
  type LoginFormData,
  type RegisterFormData,
  type RefreshTokenCommand,
} from "@/schemas";
import { authClient } from "@/lib/client";

export const authApi = {
  login: async (body: LoginFormData) => {
    const { data } = await authClient.post("/auth/login", body);
    return authResponseSchema.parse(data);
  },

  register: async (body: RegisterFormData) => {
    const { data } = await authClient.post("/auth/register", body);
    return authResponseSchema.parse(data);
  },

  refresh: async (body: RefreshTokenCommand) => {
    const { data } = await authClient.post("/auth/refresh", body);
    return authResponseSchema.parse(data);
  },
};
