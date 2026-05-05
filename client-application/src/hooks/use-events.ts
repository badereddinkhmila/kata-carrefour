import { useEffect, useState } from "react";
import {
  useQuery,
  useQueries,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { eventsApi } from "@/api/events";
import { meApi } from "@/api/me";
import { reservationsApi } from "@/api/reservations";
import { useReservationCartStore } from "@/stores/reservation-cart-store";
import type { EventReservationDetailView } from "@/schemas";
import type { ReservationBatchItemCommand } from "@/schemas";
import { ReservationStatus } from "@/schemas";

const EVENTS_QUERY_KEY = ["events"] as const;
const EVENT_DETAIL_QUERY_KEY = (eventId: string) => ["event", eventId] as const;
const MY_BOOKED_EVENTS_QUERY_KEY = ["me", "booked-events"] as const;
const MY_RESERVATIONS_QUERY_KEY = ["me", "reservations"] as const;

const DEFAULT_PAGE_SIZE = 10;

export function useMyBookedEvents() {
  return useQuery({
    queryKey: MY_BOOKED_EVENTS_QUERY_KEY,
    queryFn: () => meApi.getMyBookedEvents(),
  });
}

export function useMyReservations() {
  return useQuery({
    queryKey: MY_RESERVATIONS_QUERY_KEY,
    queryFn: () => meApi.getMyReservations(),
  });
}

export function useEventDetails(eventIds: string[]) {
  const queries = useQueries({
    queries: eventIds.map((eventId) => ({
      queryKey: EVENT_DETAIL_QUERY_KEY(eventId),
      queryFn: () => eventsApi.getDetail(eventId),
      enabled: Boolean(eventId),
    })),
  });
  return queries;
}

export function useGetAllEvents(pageSize = DEFAULT_PAGE_SIZE) {
  return useInfiniteQuery({
    queryKey: [...EVENTS_QUERY_KEY, pageSize],
    queryFn: ({ pageParam }) =>
      eventsApi.list({ page: pageParam as number, size: pageSize }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.page + 1 : undefined,
  });
}

export function useEventDetail(eventId: string) {
  return useQuery({
    queryKey: EVENT_DETAIL_QUERY_KEY(eventId),
    queryFn: () => eventsApi.getDetail(eventId),
    enabled: Boolean(eventId),
  });
}

export interface UseEventSeatsStreamOptions {
  enabled?: boolean;
}

export function useEventSeatsStream(eventId: string, options?: UseEventSeatsStreamOptions) {
  const queryClient = useQueryClient();
  const enabled = options?.enabled ?? true;
  const [connectionState, setConnectionState] = useState<"idle" | "connecting" | "connected" | "error">("idle");

  useEffect(() => {
    if (!eventId || !enabled) {
      setConnectionState("idle");
      return;
    }

    const controller = new AbortController();
    setConnectionState("connecting");

    eventsApi
      .subscribeSeatsStream(eventId, {
        signal: controller.signal,
        onMessage: (payload) => {
          console.log("onMessage", payload);
          setConnectionState("connected");
          const prev = queryClient.getQueryData<EventReservationDetailView>(
            EVENT_DETAIL_QUERY_KEY(eventId)
          );
          const seatLabel =
            prev?.seats.find((s) => s.id === payload.seatId)?.seatNumber ??
            `Seat ${payload.seatId.slice(0, 8)}`;
          const held =
            payload.status === ReservationStatus.PENDING ||
            payload.status === ReservationStatus.CONFIRMED;
          if (held) {
            toast.info("Seat update", {
              description: `${seatLabel} was reserved.`,
            });
          } else {
            toast.info("Seat update", {
              description: `${seatLabel} is now available.`,
            });
          }
          queryClient.invalidateQueries({ queryKey: EVENT_DETAIL_QUERY_KEY(eventId) });
          queryClient.invalidateQueries({ queryKey: MY_RESERVATIONS_QUERY_KEY });
        },
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setConnectionState("error");
      });

    return () => {
      controller.abort();
    };
  }, [eventId, enabled, queryClient]);

  return { connectionState };
}

export interface ReservationSuccessSnapshot {
  eventId: string;
  eventName: string;
  seatCount: number;
}

export function getCartBatchPayload(): ReservationBatchItemCommand[] {
  const { getItems } = useReservationCartStore.getState();
  return getItems().map((entry) => ({
    eventId: entry.eventId,
    seats: entry.seatIds,
  }));
}

export function useCreateReservationsBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ReservationBatchItemCommand[]) =>
      reservationsApi.createBatch(body),
    onSuccess: (_, variables) => {
      variables.forEach(({ eventId }) => {
        queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      });
      queryClient.invalidateQueries({ queryKey: MY_RESERVATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MY_BOOKED_EVENTS_QUERY_KEY });
    },
  });
}

export function useConfirmReservations(options?: {
  onSuccess?: (snapshot: ReservationSuccessSnapshot[]) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ReservationBatchItemCommand[]) =>
      reservationsApi.confirm(body),
    onSuccess: (_, variables) => {
      variables.forEach(({ eventId }) => {
        queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      });
      queryClient.invalidateQueries({ queryKey: MY_RESERVATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MY_BOOKED_EVENTS_QUERY_KEY });
      const { getItems, clear } = useReservationCartStore.getState();
      const snapshot: ReservationSuccessSnapshot[] = getItems().map(
        (entry) => ({
          eventId: entry.eventId,
          eventName: entry.eventSnapshot.eventName,
          seatCount: entry.seatIds.length,
        })
      );
      clear();
      options?.onSuccess?.(snapshot);
    },
  });
}
