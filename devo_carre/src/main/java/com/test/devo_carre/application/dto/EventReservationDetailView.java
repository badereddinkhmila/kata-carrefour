package com.test.devo_carre.application.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record EventReservationDetailView(
        UUID eventId,
        String eventName,
        String banner,
        Instant startsAt,
        RoomView room,
        List<SeatView> seats
) {
}
