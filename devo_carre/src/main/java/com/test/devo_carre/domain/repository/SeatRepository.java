package com.test.devo_carre.domain.repository;

import com.test.devo_carre.domain.model.Seat;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SeatRepository {
    List<Seat> findByRoomId(UUID roomId);

    Optional<Seat> findById(UUID seatId);

    Seat save(Seat seat);

    void deleteAll();
}
