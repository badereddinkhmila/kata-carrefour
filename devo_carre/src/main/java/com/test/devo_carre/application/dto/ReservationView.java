package com.test.devo_carre.application.dto;

import com.test.devo_carre.domain.model.ReservationStatus;

import java.time.Instant;
import java.util.UUID;

public record ReservationView(
        UUID id,
        UUID eventId,
        UUID seatId,
        UUID userId,
        ReservationStatus status,
        Instant createdAt,
        Instant confirmedAt,
        Instant expiresAt
) {
}
