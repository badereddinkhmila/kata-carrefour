package com.test.devo_carre.domain.event;

import com.test.devo_carre.domain.model.ReservationStatus;

import java.time.Instant;
import java.util.UUID;

public sealed interface RoomChangeEvent permits RoomChangeEvent.SeatReservedEvent,
        RoomChangeEvent.ReservationConfirmedEvent,
        RoomChangeEvent.ReservationCancelledEvent,
        RoomChangeEvent.ReservationExpiredEvent {
    UUID eventId();

    UUID seatId();

    UUID reservationId();

    Instant occurredAt();

    ReservationStatus status();

    record SeatReservedEvent(UUID eventId, UUID seatId, UUID reservationId, Instant occurredAt)
            implements RoomChangeEvent {
        @Override
        public ReservationStatus status() {
            return ReservationStatus.PENDING;
        }
    }

    record ReservationConfirmedEvent(UUID eventId, UUID seatId, UUID reservationId, Instant occurredAt)
            implements RoomChangeEvent {
        @Override
        public ReservationStatus status() {
            return ReservationStatus.CONFIRMED;
        }
    }

    record ReservationCancelledEvent(UUID eventId, UUID seatId, UUID reservationId, Instant occurredAt)
            implements RoomChangeEvent {
        @Override
        public ReservationStatus status() {
            return ReservationStatus.CANCELLED;
        }
    }

    record ReservationExpiredEvent(UUID eventId, UUID seatId, UUID reservationId, Instant occurredAt)
            implements RoomChangeEvent {
        @Override
        public ReservationStatus status() {
            return ReservationStatus.EXPIRED;
        }
    }
}
