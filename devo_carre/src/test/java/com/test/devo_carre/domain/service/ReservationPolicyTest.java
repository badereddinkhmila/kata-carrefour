package com.test.devo_carre.domain.service;

import com.test.devo_carre.domain.model.Seat;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ReservationPolicyTest {

    private final ReservationPolicy reservationPolicy = new ReservationPolicy();

    @Test
    void ensureSeatExists_whenNull_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> reservationPolicy.ensureSeatExists(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Seat not found");
    }

    @Test
    void ensureSeatExists_whenPresent_doesNotThrow() {
        var seat = new Seat(UUID.randomUUID(), UUID.randomUUID(), "A1", 1L);
        reservationPolicy.ensureSeatExists(seat);
    }
}
