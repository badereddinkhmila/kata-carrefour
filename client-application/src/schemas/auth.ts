import { z } from "zod";

export const loginFormDataSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password required"),
});
export const loginFormSchema = loginFormDataSchema;
export type LoginFormData = z.infer<typeof loginFormDataSchema>;

export const registerFormDataSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password required"),
});
export const registerFormSchema = registerFormDataSchema;
export type RegisterFormData = z.infer<typeof registerFormDataSchema>;

export const refreshTokenCommandSchema = z.object({
  refreshToken: z.string(),
});
export type RefreshTokenCommand = z.infer<typeof refreshTokenCommandSchema>;

export const authResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});
