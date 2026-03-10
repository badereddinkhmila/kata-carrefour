package com.test.devo_carre.support.fake;

import com.test.devo_carre.domain.model.Reservation;
import com.test.devo_carre.domain.model.ReservationStatus;
import com.test.devo_carre.domain.repository.ReservationRepository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public class FakeReservationRepository implements ReservationRepository {
    private final Map<UUID, Reservation> reservations = new LinkedHashMap<>();

    @Override
    public Optional<Reservation> findById(UUID id) {
        return Optional.ofNullable(reservations.get(id));
    }

    @Override
    public Optional<Reservation> findByEventIdAndSeatId(UUID eventId, UUID seatId) {
        return reservations.values().stream()
                .filter(r -> r.eventId().equals(eventId) && r.seatId().equals(seatId))
                .findFirst();
    }

    @Override
    public Optional<Reservation> findActiveByEventIdAndSeatIdAndUserId(UUID eventId, UUID seatId, UUID userId, Instant now) {
        return reservations.values().stream()
                .filter(r -> r.eventId().equals(eventId)
                        && r.seatId().equals(seatId)
                        && r.userId().equals(userId)
                        && r.isActive(now))
                .findFirst();
    }

    @Override
    public Optional<Reservation> findActiveByEventIdAndSeatId(UUID eventId, UUID seatId, Instant now) {
        return reservations.values().stream()
                .filter(r -> r.eventId().equals(eventId)
                        && r.seatId().equals(seatId)
                        && r.isActive(now))
                .findFirst();
    }

    @Override
    public List<Reservation> findActiveByEventId(UUID eventId, Instant now) {
        return reservations.values().stream()
                .filter(r -> r.eventId().equals(eventId) && r.isActive(now))
                .toList();
    }

    @Override
    public List<Reservation> findPendingExpired(Instant now) {
        var result = new ArrayList<Reservation>();
        for (var reservation : reservations.values()) {
            if (reservation.status() == ReservationStatus.PENDING
                    && reservation.expiresAt() != null
                    && reservation.expiresAt().isBefore(now)) {
                result.add(reservation);
            }
        }
        return result;
    }

    @Override
    public List<Reservation> findByUserId(UUID userId) {
        return reservations.values().stream()
                .filter(r -> r.userId().equals(userId))
                .toList();
    }

    @Override
    public List<Reservation> findAll() {
        return new ArrayList<>(reservations.values());
    }

    @Override
    public Reservation save(Reservation reservation) {
        var id = reservation.id() != null ? reservation.id() : UUID.randomUUID();
        var toSave = reservation.id() == null
                ? new Reservation(id, reservation.eventId(), reservation.seatId(), reservation.userId(),
                reservation.status(), reservation.createdAt(), reservation.confirmedAt(), reservation.expiresAt(), reservation.version())
                : reservation;
        reservations.put(id, toSave);
        return toSave;
    }

    @Override
    public void deleteAll() {
        reservations.clear();
    }
}
