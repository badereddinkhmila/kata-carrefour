package com.test.devo_carre.adapter.out.persistence.jpa.adapter;

import com.test.devo_carre.adapter.out.persistence.jpa.entity.ReservationEntity;
import com.test.devo_carre.adapter.out.persistence.jpa.repository.SpringDataReservationRepository;
import com.test.devo_carre.domain.model.Reservation;
import com.test.devo_carre.domain.model.ReservationStatus;
import com.test.devo_carre.domain.repository.ReservationRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class JpaReservationRepositoryAdapter implements ReservationRepository {

    private final SpringDataReservationRepository repository;

    public JpaReservationRepositoryAdapter(SpringDataReservationRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<Reservation> findById(UUID id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<Reservation> findByEventIdAndSeatId(UUID eventId, UUID seatId) {
        return repository.findByEventIdAndSeatId(eventId, seatId).map(this::toDomain);
    }

    @Override
    public Optional<Reservation> findActiveByEventIdAndSeatIdAndUserId(UUID eventId, UUID seatId, UUID userId, Instant now) {
        return repository.findActiveByEventIdAndSeatIdAndUserId(eventId, seatId, userId, now).stream()
                .findFirst()
                .map(this::toDomain);
    }

    @Override
    public Optional<Reservation> findActiveByEventIdAndSeatId(UUID eventId, UUID seatId, Instant now) {
        return repository.findActiveByEventIdAndSeatId(eventId, seatId, now).map(this::toDomain);
    }

    @Override
    public List<Reservation> findActiveByEventId(UUID eventId, Instant now) {
        return repository.findActiveByEventId(eventId, now).stream().map(this::toDomain).toList();
    }

    @Override
    public List<Reservation> findPendingExpired(Instant now) {
        return repository.findByStatusAndExpiresAtBefore(ReservationStatus.PENDING, now).stream().map(this::toDomain).toList();
    }

    @Override
    public List<Reservation> findByUserId(UUID userId) {
        return repository.findByUserId(userId).stream().map(this::toDomain).toList();
    }

    @Override
    public List<Reservation> findAll() {
        return repository.findAll().stream().map(this::toDomain).toList();
    }

    @Override
    public Reservation save(Reservation reservation) {
        return toDomain(repository.saveAndFlush(toEntity(reservation)));
    }

    @Override
    public void deleteAll() {
        repository.deleteAllInBatch();
    }

    private Reservation toDomain(ReservationEntity entity) {
        return new Reservation(
                entity.getId(),
                entity.getEventId(),
                entity.getSeatId(),
                entity.getUserId(),
                entity.getStatus(),
                entity.getCreatedAt(),
                entity.getConfirmedAt(),
                entity.getExpiresAt(),
                entity.getVersion()
        );
    }

    private ReservationEntity toEntity(Reservation reservation) {
        var entity = new ReservationEntity();
        entity.setId(reservation.id());
        entity.setEventId(reservation.eventId());
        entity.setSeatId(reservation.seatId());
        entity.setUserId(reservation.userId());
        entity.setStatus(reservation.status());
        entity.setCreatedAt(reservation.createdAt());
        entity.setConfirmedAt(reservation.confirmedAt());
        entity.setExpiresAt(reservation.expiresAt());
        entity.setVersion(reservation.version());
        return entity;
    }
}
