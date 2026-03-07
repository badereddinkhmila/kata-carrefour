package com.test.devo_carre.domain.service;

import com.test.devo_carre.domain.model.Seat;

public final class ReservationPolicy {

    public void ensureSeatExists(Seat seat) {
        if (seat == null) {
            throw new IllegalArgumentException("Seat not found");
        }
    }
}
