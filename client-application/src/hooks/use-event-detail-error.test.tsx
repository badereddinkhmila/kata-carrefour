import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { useEventDetail } from "./use-events";
import { eventsApi } from "@/api/events";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/api/events", () => ({
  eventsApi: {
    list: vi.fn(),
    getDetail: vi.fn(),
    subscribeSeatsStream: vi.fn(),
  },
}));

function TestEventDetail({ eventId }: { eventId: string }) {
  const { data, isLoading, isError, error } = useEventDetail(eventId);
  if (isLoading) return <div>Loading…</div>;
  if (isError) return <div data-testid="error">{error instanceof Error ? error.message : "Error"}</div>;
  if (data) return <div data-testid="detail">{data.eventName}</div>;
  return null;
}

describe("useEventDetail", () => {
  beforeEach(() => {
    vi.mocked(eventsApi.getDetail).mockRejectedValue(new Error("Event not found"));
  });

  it("shows error state when getDetail fails", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TestEventDetail eventId="bad-id" />
      </QueryClientProvider>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent(/event not found/i);
    });
  });
});
