import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { CheckoutSuccessCard } from "./checkout-success-card";

describe("CheckoutSuccessCard", () => {
  it("shows reservation confirmed and summary for single event", async () => {
    const summary = [
      { eventId: "e1", eventName: "Concert", seatCount: 2 },
    ];
    renderWithProviders(<CheckoutSuccessCard summary={summary} />);
    const heading = await screen.findByRole("heading", { name: /reservation confirmed/i });
    expect(heading).toBeInTheDocument();
    expect(screen.getByText(/your 2 seat.*have been reserved.*for Concert/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view event/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /browse more events/i })).toBeInTheDocument();
  });

  it("shows plural seats and multiple events when summary has multiple items", async () => {
    const summary = [
      { eventId: "e1", eventName: "Event A", seatCount: 1 },
      { eventId: "e2", eventName: "Event B", seatCount: 2 },
    ];
    renderWithProviders(<CheckoutSuccessCard summary={summary} />);
    await screen.findByRole("heading", { name: /reservation confirmed/i });
    const summaryParagraph = screen.getByText((_, el) =>
      el?.tagName === "P" &&
      Boolean(el?.textContent?.includes("Your 3 seats") && el?.textContent?.includes("across 2 events"))
    );
    expect(summaryParagraph).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Event A/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Event B/i })).toBeInTheDocument();
  });
});
