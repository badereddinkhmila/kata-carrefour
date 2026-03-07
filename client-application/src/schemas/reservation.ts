import { z } from "zod";

const uuidSchema = z.string().uuid();

export enum ReservationStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

export const reservationBatchItemCommandSchema = z.object({
  eventId: uuidSchema,
  seats: z.array(uuidSchema).min(1, "At least one seat required"),
});

export const reservationViewSchema = z
  .object({
    id: uuidSchema,
    eventId: uuidSchema,
    seatId: uuidSchema,
    userId: uuidSchema,
    status: z.nativeEnum(ReservationStatus),
    createdAt: z.string(),
    confirmedAt: z.string().optional().nullable(),
    expiresAt: z.string().optional().nullable(),
    expires_at: z.string().optional().nullable(),
  })
  .transform((o) => ({
    id: o.id,
    eventId: o.eventId,
    seatId: o.seatId,
    userId: o.userId,
    status: o.status,
    createdAt: o.createdAt,
    confirmedAt: o.confirmedAt ?? null,
    expiresAt: o.expiresAt ?? o.expires_at ?? null,
  }));

export type ReservationBatchItemCommand = z.infer<
  typeof reservationBatchItemCommandSchema
>;
export type ReservationView = z.infer<typeof reservationViewSchema>;
