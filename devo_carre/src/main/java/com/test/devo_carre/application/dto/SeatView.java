package com.test.devo_carre.application.dto;

import com.test.devo_carre.domain.model.ReservationStatus;

import java.time.Instant;
import java.util.UUID;

public record SeatView(
        UUID id,
        UUID roomId,
        String seatNumber,
        boolean reserved,
        UUID reservedByUserId,
        ReservationStatus reservationStatus,
        Instant reservationExpiresAt
) {
}
