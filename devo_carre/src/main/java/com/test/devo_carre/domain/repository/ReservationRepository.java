package com.test.devo_carre.domain.repository;

import com.test.devo_carre.domain.model.Reservation;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReservationRepository {
    Optional<Reservation> findById(UUID id);

    Optional<Reservation> findByEventIdAndSeatId(UUID eventId, UUID seatId);

    Optional<Reservation> findActiveByEventIdAndSeatIdAndUserId(UUID eventId, UUID seatId, UUID userId, Instant now);

    Optional<Reservation> findActiveByEventIdAndSeatId(UUID eventId, UUID seatId, Instant now);

    List<Reservation> findActiveByEventId(UUID eventId, Instant now);

    List<Reservation> findPendingExpired(Instant now);

    List<Reservation> findByUserId(UUID userId);

    List<Reservation> findAll();

    Reservation save(Reservation reservation);

    void deleteAll();
}
