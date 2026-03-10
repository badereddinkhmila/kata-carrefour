import {
  eventReservationDetailViewSchema,
  pagedResponseEventViewSchema,
  seatUpdateEventSchema,
  type SeatUpdateEvent,
} from "@/schemas";
import { API_BASE_URL } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";
import { apiClient } from "@/lib/client";

export const eventsApi = {
  list: async (params: { page?: number; size?: number } = {}) => {
    const { data } = await apiClient.get("/events", {
      params: { page: params.page ?? 0, size: params.size ?? 10 },
    });
    return pagedResponseEventViewSchema.parse(data);
  },

  getDetail: async (eventId: string) => {
    const { data } = await apiClient.get(`/events/${eventId}`);
    return eventReservationDetailViewSchema.parse(data);
  },

  subscribeSeatsStream: async (
    eventId: string,
    options: {
      onMessage: (event: SeatUpdateEvent) => void;
      signal: AbortSignal;
    }
  ): Promise<void> => {
    const token = useAuthStore.getState().accessToken;
    const url = `${API_BASE_URL}/events/${eventId}/stream`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "text/event-stream",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: options.signal,
    });

    if (!res.ok || !res.body) {
      throw new Error(`Stream failed: ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split(/\n\n/);
        buffer = chunks.pop() ?? "";

        for (const chunk of chunks) {
          const dataLines = chunk
            .split(/\n/)
            .filter((l) => l.startsWith("data:"))
            .map((l) => l.slice(5).trim());
          const data = dataLines.length > 0 ? dataLines.join("\n").trim() : "";
          if (data && data !== "null") {
            try {
              const payload = seatUpdateEventSchema.parse(JSON.parse(data));
              options.onMessage(payload);
            } catch (parseError) {
              console.error("[EventStream] Parse error for chunk:", {
                chunk: data.slice(0, 200),
                error: parseError,
              });
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },
};
