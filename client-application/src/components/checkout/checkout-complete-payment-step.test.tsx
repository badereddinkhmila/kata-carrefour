import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/test-utils";
import { CheckoutCompletePaymentStep } from "./checkout-complete-payment-step";

describe("CheckoutCompletePaymentStep", () => {
  it("renders title and confirm payment button and calls onConfirm when clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    renderWithProviders(
      <CheckoutCompletePaymentStep
        isPending={false}
        error={null}
        onConfirm={onConfirm}
      />
    );

    const title = await screen.findByText(/complete payment/i);
    expect(title).toBeInTheDocument();
    expect(screen.getByText(/your seats are reserved/i)).toBeInTheDocument();
    const button = screen.getByRole("button", { name: /confirm payment/i });
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("shows loading state and disables button when isPending", async () => {
    renderWithProviders(
      <CheckoutCompletePaymentStep
        isPending={true}
        error={null}
        onConfirm={vi.fn()}
      />
    );

    const button = await screen.findByRole("button", { name: /confirming/i });
    expect(button).toBeDisabled();
  });

  it("shows error message when error is set", async () => {
    renderWithProviders(
      <CheckoutCompletePaymentStep
        isPending={false}
        error={new Error("Payment failed")}
        onConfirm={vi.fn()}
      />
    );

    expect(await screen.findByText(/payment failed/i)).toBeInTheDocument();
  });
});
