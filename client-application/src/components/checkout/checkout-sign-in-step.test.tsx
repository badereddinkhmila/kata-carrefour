import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { useLogin } from "@/hooks/use-auth";
import { authApi } from "@/api/auth";
import { loginFormSchema, type LoginFormData } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { renderWithProviders } from "@/test/test-utils";
import { CheckoutSignInStep } from "./checkout-sign-in-step";

vi.mock("@/api/auth", () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    refresh: vi.fn(),
  },
}));

function CheckoutSignInStepWithHooks() {
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });
  const loginMutation = useLogin({ onSuccess: () => {} });
  return <CheckoutSignInStep loginForm={loginForm} loginMutation={loginMutation} />;
}

describe("CheckoutSignInStep", () => {
  beforeEach(() => {
    vi.mocked(authApi.login).mockResolvedValue({
      accessToken: "token",
      refreshToken: "refresh",
    });
  });

  it("renders sign in form and calls login API on submit", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CheckoutSignInStepWithHooks />);
    const title = await screen.findByText(/sign in to continue/i);
    expect(title).toBeInTheDocument();
    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.type(screen.getByLabelText(/password/i), "Password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(vi.mocked(authApi.login)).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "Password123",
      });
    });
  });
});
