import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { useGetAllEvents } from "./use-events";
import { eventsApi } from "@/api/events";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/api/events", () => ({
  eventsApi: {
    list: vi.fn(),
    getDetail: vi.fn(),
    subscribeSeatsStream: vi.fn(),
  },
}));

function TestEventsList() {
  const { data, isLoading, isError } = useGetAllEvents(10);
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;
  const count = data?.pages.flatMap((p) => p.content).length ?? 0;
  return <div>Events: {count}</div>;
}

describe("useGetAllEvents", () => {
  beforeEach(() => {
    vi.mocked(eventsApi.list).mockResolvedValue({
      content: [
        {
          id: "e1",
          name: "Test Event",
          startsAt: new Date().toISOString(),
          roomId: "r1",
        },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    });
  });

  it("fetches events and renders count", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <TestEventsList />
      </QueryClientProvider>
    );
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/Events: 1/)).toBeInTheDocument();
    });
    expect(eventsApi.list).toHaveBeenCalledWith({ page: 0, size: 10 });
  });
});
