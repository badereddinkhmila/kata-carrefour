import { z } from "zod";
import { ReservationStatus } from "./reservation";

const uuidSchema = z.string().uuid();

export const eventViewSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  startsAt: z.string(),
  roomId: uuidSchema,
  banner: z.string().url().optional(),
});

export type EventView = z.infer<typeof eventViewSchema>;

export const pagedResponseEventViewSchema = z.object({
  content: z.array(eventViewSchema),
  page: z.number().int(),
  size: z.number().int(),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  hasNext: z.boolean(),
  hasPrevious: z.boolean(),
});

export type PagedResponseEventView = z.infer<typeof pagedResponseEventViewSchema>;

export const roomViewSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  capacity: z.number().int().nonnegative(),
});

export const seatViewSchema = z.object({
  id: uuidSchema,
  roomId: uuidSchema,
  seatNumber: z.string(),
  reserved: z.boolean(),
  reservedByUserId: z.string().uuid().optional().nullable(),
});

export const eventReservationDetailViewSchema = z.object({
  eventId: uuidSchema,
  eventName: z.string(),
  startsAt: z.string(),
  banner: z.string().url().optional(),
  room: roomViewSchema,
  seats: z.array(seatViewSchema),
});

export const reserveSeatCommandSchema = z.object({
  seatId: uuidSchema,
});

export type RoomView = z.infer<typeof roomViewSchema>;
export type SeatView = z.infer<typeof seatViewSchema>;
export type EventReservationDetailView = z.infer<
  typeof eventReservationDetailViewSchema
>;
export type ReserveSeatCommand = z.infer<typeof reserveSeatCommandSchema>;

export const seatUpdateEventSchema = z.object({
  eventId: uuidSchema,
  seatId: uuidSchema,
  reservationId: uuidSchema,
  status: z.nativeEnum(ReservationStatus),
  expiresAt: z.string().nullable().optional(),
  occurredAt: z.string(),
});
export type SeatUpdateEvent = z.infer<typeof seatUpdateEventSchema>;
