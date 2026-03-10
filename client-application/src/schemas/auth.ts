import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const loginFormDataSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
});
export const loginFormSchema = loginFormDataSchema;
export type LoginFormData = z.infer<typeof loginFormDataSchema>;

export const registerFormDataSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
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
