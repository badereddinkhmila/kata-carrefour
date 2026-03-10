import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLogin } from "./use-auth";
import { authApi } from "@/api/auth";
import { useAuthStore } from "@/stores/auth-store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/api/auth", () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    refresh: vi.fn(),
  },
}));

function TestLoginForm() {
  const loginMutation = useLogin();
  return (
    <div>
      <button
        type="button"
        onClick={() => loginMutation.mutate({ email: "user@test.com", password: "secret123" })}
      >
        Log in
      </button>
      {loginMutation.isSuccess && <span>Logged in</span>}
    </div>
  );
}

describe("useLogin", () => {
  beforeEach(() => {
    vi.mocked(authApi.login).mockResolvedValue({
      accessToken: "access",
      refreshToken: "refresh",
    });
    if (typeof localStorage !== "undefined") localStorage.clear();
    useAuthStore.getState().logout();
  });

  it("calls authApi.login and updates auth store on success", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TestLoginForm />
      </QueryClientProvider>
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: "user@test.com",
        password: "secret123",
      });
    });

    await waitFor(() => {
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.email).toBe("user@test.com");
      expect(state.accessToken).toBe("access");
      expect(state.refreshToken).toBe("refresh");
    });
  });
});
