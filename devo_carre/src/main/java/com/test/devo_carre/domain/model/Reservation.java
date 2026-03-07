package com.test.devo_carre.domain.model;

import java.time.Instant;
import java.util.UUID;

public record Reservation(
        UUID id,
        UUID eventId,
        UUID seatId,
        UUID userId,
        ReservationStatus status,
        Instant createdAt,
        Instant confirmedAt,
        Instant expiresAt,
        Long version
) {
    public Reservation confirm(Instant at) {
        if (status != ReservationStatus.PENDING) {
            throw new IllegalStateException("Reservation cannot be confirmed in status " + status);
        }
        return new Reservation(id, eventId, seatId, userId, ReservationStatus.CONFIRMED, createdAt, at, expiresAt, version);
    }

    public Reservation expire() {
        if (status != ReservationStatus.PENDING) {
            return this;
        }
        return new Reservation(id, eventId, seatId, userId, ReservationStatus.EXPIRED, createdAt, confirmedAt, expiresAt, version);
    }

    public Reservation cancel() {
        if (status != ReservationStatus.PENDING && status != ReservationStatus.CONFIRMED) {
            throw new IllegalStateException("Reservation cannot be cancelled in status " + status);
        }
        return new Reservation(id, eventId, seatId, userId, ReservationStatus.CANCELLED, createdAt, confirmedAt, expiresAt, version);
    }

    public boolean isActive(Instant now) {
        return status == ReservationStatus.CONFIRMED
                || (status == ReservationStatus.PENDING && expiresAt != null && expiresAt.isAfter(now));
    }
}
