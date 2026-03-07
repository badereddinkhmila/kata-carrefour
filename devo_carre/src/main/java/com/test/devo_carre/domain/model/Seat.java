package com.test.devo_carre.domain.model;

import java.util.UUID;

public record Seat(UUID id, UUID roomId, String seatNumber, Long version) {
}
