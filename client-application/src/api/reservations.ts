import {
  reservationBatchItemCommandSchema,
  reservationViewSchema,
  type ReservationBatchItemCommand,
  type ReservationView,
} from "@/schemas";
import { apiClient } from "@/lib/client";

const reservationViewListSchema = reservationViewSchema.array();

export const reservationsApi = {
  createBatch: async (
    body: ReservationBatchItemCommand[]
  ): Promise<ReservationView[]> => {
    const payload = body.map((item) =>
      reservationBatchItemCommandSchema.parse(item)
    );
    const { data } = await apiClient.post("/reservations/batch", payload);
    return reservationViewListSchema.parse(data);
  },

  confirm: async (
    body: ReservationBatchItemCommand[]
  ): Promise<ReservationView[]> => {
    const payload = body.map((item) =>
      reservationBatchItemCommandSchema.parse(item)
    );
    const { data } = await apiClient.post("/reservations/confirm", payload);
    return reservationViewListSchema.parse(data);
  },

  cancel: async (
    body: ReservationBatchItemCommand[]
  ): Promise<ReservationView[]> => {
    const payload = body.map((item) =>
      reservationBatchItemCommandSchema.parse(item)
    );
    const { data } = await apiClient.post("/reservations/cancel", payload);
    return reservationViewListSchema.parse(data);
  },
};
