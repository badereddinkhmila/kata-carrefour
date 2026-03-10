import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventCard } from "./event-card";
import type { Event } from "@/types/event";

const mockEvent: Event = {
  id: "evt-1",
  title: "Summer Concert",
  date: "2026-07-15T19:00:00.000Z",
  location: "Central Park",
  category: "Concert",
  description: "An outdoor summer concert.",
};

describe("EventCard", () => {
  it("renders event title, date, category, and location", () => {
    render(<EventCard event={mockEvent} />);

    expect(screen.getByRole("heading", { name: /summer concert/i })).toBeInTheDocument();
    expect(screen.getByText(/2026/)).toBeInTheDocument();
    expect(screen.getByText(/central park/i)).toBeInTheDocument();
    expect(document.body.textContent).toContain("Concert");
  });

  it("renders with featured variant when variant is featured", () => {
    const { container } = render(<EventCard event={mockEvent} index={0} variant="featured" />);

    expect(screen.getByRole("heading", { name: /summer concert/i })).toBeInTheDocument();
    const card = container.querySelector("[class*='aspect-[21/9]']");
    expect(card).toBeInTheDocument();
  });
});
