package com.test.devo_carre.application.dto;

import com.test.devo_carre.domain.model.ReservationStatus;

import java.time.Instant;
import java.util.UUID;

public record RoomUpdateView(
        UUID eventId,
        UUID seatId,
        UUID reservationId,
        ReservationStatus status,
        Instant expiresAt,
        Instant occurredAt
) {
}
