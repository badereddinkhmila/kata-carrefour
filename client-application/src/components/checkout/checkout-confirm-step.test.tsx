import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CheckoutConfirmStep } from "./checkout-confirm-step";

describe("CheckoutConfirmStep", () => {
  it("renders title, seat count, and confirm button and calls onConfirm when clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <CheckoutConfirmStep
        totalSeats={3}
        isPending={false}
        error={null}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByText(/hold your seats/i)).toBeInTheDocument();
    expect(screen.getByText(/3 seats reserved for you/i)).toBeInTheDocument();
    const button = screen.getByRole("button", { name: /confirm reservation/i });
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("shows loading state and disables button when isPending", () => {
    render(
      <CheckoutConfirmStep
        totalSeats={1}
        isPending={true}
        error={null}
        onConfirm={vi.fn()}
      />
    );

    const button = screen.getByRole("button", { name: /creating reservation/i });
    expect(button).toBeDisabled();
  });

  it("shows error message when error is set", () => {
    render(
      <CheckoutConfirmStep
        totalSeats={2}
        isPending={false}
        error={new Error("Reservation failed")}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText(/reservation failed/i)).toBeInTheDocument();
  });
});
