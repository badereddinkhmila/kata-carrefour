import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { EventReservationDetailView } from "@/schemas";

export interface ReservationCartItem {
  seatId: string;
  seatNumber: string;
}

export interface CartEntry {
  eventId: string;
  eventSnapshot: EventReservationDetailView;
  seatIds: string[];
}

interface ReservationCartState {
  items: CartEntry[];
  addOrUpdateEvent: (
    eventId: string,
    eventSnapshot: EventReservationDetailView,
    seatIds: string[]
  ) => void;
  removeEvent: (eventId: string) => void;
  getTotalSeatCount: () => number;
  getItems: () => CartEntry[];
  getSelectedSeatsForEvent: (eventId: string) => ReservationCartItem[];
  clear: () => void;
}

export const useReservationCartStore = create<ReservationCartState>()(
  persist(
    (set, get) => ({
      items: [],

      addOrUpdateEvent: (eventId, eventSnapshot, seatIds) =>
        set((state) => {
          const existing = state.items.findIndex((i) => i.eventId === eventId);
          const next =
            existing >= 0
              ? state.items.map((item, i) =>
                  i === existing
                    ? { eventId, eventSnapshot, seatIds }
                    : item
                )
              : [...state.items, { eventId, eventSnapshot, seatIds }];
          return { items: next };
        }),

      removeEvent: (eventId) =>
        set((state) => ({
          items: state.items.filter((i) => i.eventId !== eventId),
        })),

      getTotalSeatCount: () =>
        get().items.reduce((acc, i) => acc + i.seatIds.length, 0),

      getItems: () => get().items,

      getSelectedSeatsForEvent: (eventId) => {
        const entry = get().items.find((i) => i.eventId === eventId);
        if (!entry) return [];
        return entry.seatIds
          .map((id) => {
            const seat = entry.eventSnapshot.seats.find((s) => s.id === id);
            return seat
              ? { seatId: seat.id, seatNumber: seat.seatNumber }
              : null;
          })
          .filter((s): s is ReservationCartItem => s != null);
      },

      clear: () => set({ items: [] }),
    }),
    { name: "reservation-cart" }
  )
);
