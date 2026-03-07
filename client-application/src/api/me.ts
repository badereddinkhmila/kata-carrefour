import { eventViewSchema, reservationViewSchema } from "@/schemas";
import { apiClient } from "@/lib/client";

const eventViewListSchema = eventViewSchema.array();
const reservationViewListSchema = reservationViewSchema.array();

export const meApi = {
  getMyBookedEvents: async () => {
    const { data } = await apiClient.get("/me/events");
    return eventViewListSchema.parse(data);
  },

  getMyReservations: async () => {
    const { data } = await apiClient.get("/me/reservations");
    return reservationViewListSchema.parse(data);
  },
};
