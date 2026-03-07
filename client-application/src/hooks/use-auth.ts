import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { authApi } from "@/api/auth";
import type { LoginFormData, RegisterFormData } from "@/schemas";

export interface UseLoginOptions {
  onSuccess?: () => void;
}

export function useLogin(options?: UseLoginOptions) {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (data: LoginFormData) => authApi.login(data),
    onSuccess: (data, variables) => {
      setAuth(
        { id: "", email: variables.email },
        data.accessToken,
        data.refreshToken
      );
      options?.onSuccess?.();
    },
  });
}

export interface UseRegisterOptions {
  onSuccess?: () => void;
}

export function useRegister(options?: UseRegisterOptions) {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (data: RegisterFormData) => authApi.register(data),
    onSuccess: (data, variables) => {
      setAuth(
        { id: "", email: variables.email },
        data.accessToken,
        data.refreshToken
      );
      options?.onSuccess?.();
    },
  });
}
