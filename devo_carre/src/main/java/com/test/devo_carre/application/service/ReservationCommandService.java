package com.test.devo_carre.application.service;

import com.test.devo_carre.application.dto.ReservationView;
import com.test.devo_carre.application.dto.RoomUpdateView;
import com.test.devo_carre.application.port.in.CancelReservationUseCase;
import com.test.devo_carre.application.port.in.ConfirmReservationUseCase;
import com.test.devo_carre.application.port.in.ReserveSeatUseCase;
import com.test.devo_carre.application.port.out.ClockPort;
import com.test.devo_carre.application.port.out.RoomUpdatePublisher;
import com.test.devo_carre.domain.event.RoomChangeEvent;
import com.test.devo_carre.domain.model.Reservation;
import com.test.devo_carre.domain.model.ReservationStatus;
import com.test.devo_carre.domain.repository.EventRepository;
import com.test.devo_carre.domain.repository.ReservationRepository;
import com.test.devo_carre.domain.repository.SeatRepository;
import com.test.devo_carre.domain.service.ReservationPolicy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Profile("!cli")
public class ReservationCommandService implements ReserveSeatUseCase, ConfirmReservationUseCase, CancelReservationUseCase {

    private static final Logger log = LoggerFactory.getLogger(ReservationCommandService.class);
    private static final Duration RESERVATION_TTL = Duration.ofMinutes(15);

    private final EventRepository eventRepository;
    private final SeatRepository seatRepository;
    private final ReservationRepository reservationRepository;
    private final RoomUpdatePublisher roomUpdatePublisher;
    private final ClockPort clockPort;
    private final ReservationPolicy reservationPolicy = new ReservationPolicy();

    public ReservationCommandService(EventRepository eventRepository,
                                     SeatRepository seatRepository,
                                     ReservationRepository reservationRepository,
                                     RoomUpdatePublisher roomUpdatePublisher,
                                     ClockPort clockPort) {
        this.eventRepository = eventRepository;
        this.seatRepository = seatRepository;
        this.reservationRepository = reservationRepository;
        this.roomUpdatePublisher = roomUpdatePublisher;
        this.clockPort = clockPort;
    }

    @Override
    @Transactional
    public ReservationView reserve(UUID eventId, UUID seatId, UUID userId) {
        log.info("Reserve request eventId={} seatId={} userId={}", eventId, seatId, userId);
        var event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));

        var seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new IllegalArgumentException("Seat not found"));

        if (!seat.roomId().equals(event.roomId())) {
            throw new IllegalArgumentException("Seat does not belong to event room");
        }

        reservationPolicy.ensureSeatExists(seat);

        var now = clockPort.now();
        if (reservationRepository.findActiveByEventIdAndSeatId(eventId, seatId, now).isPresent()) {
            log.warn("Reserve rejected seat already reserved eventId={} seatId={} userId={}", eventId, seatId, userId);
            throw new IllegalStateException("Seat is already reserved");
        }

        var reservation = new Reservation(
                null,
                eventId,
                seatId,
                userId,
                ReservationStatus.PENDING,
                now,
                null,
                now.plus(RESERVATION_TTL),
                null
        );

        var saved = reservationRepository.save(reservation);
        log.info("Seat reserved reservationId={} eventId={} seatId={} userId={} expiresAt={}",
                saved.id(), saved.eventId(), saved.seatId(), saved.userId(), saved.expiresAt());
        publishAfterCommit(toRoomUpdate(new RoomChangeEvent.SeatReservedEvent(eventId, seatId, saved.id(), now), saved.expiresAt()));
        return toView(saved);
    }

    @Override
    @Transactional
    public List<ReservationView> reserveMany(UUID eventId, List<UUID> seatIds, UUID userId) {
        log.info("Batch reserve request eventId={} seats={} userId={}", eventId, seatIds.size(), userId);
        var created = new ArrayList<ReservationView>(seatIds.size());
        for (var seatId : seatIds) {
            created.add(reserve(eventId, seatId, userId));
        }
        return created;
    }

    @Override
    @Transactional
    public ReservationView confirm(UUID reservationId, UUID userId) {
        log.info("Confirm request reservationId={} userId={}", reservationId, userId);
        var reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));

        if (!reservation.userId().equals(userId)) {
            log.warn("Confirm rejected ownership mismatch reservationId={} ownerUserId={} requestUserId={}",
                    reservationId, reservation.userId(), userId);
            throw new IllegalArgumentException("Reservation does not belong to user");
        }

        var confirmed = reservation.confirm(clockPort.now());
        var saved = reservationRepository.save(confirmed);
        log.info("Reservation confirmed reservationId={} eventId={} seatId={} userId={}",
                saved.id(), saved.eventId(), saved.seatId(), saved.userId());
        publishAfterCommit(toRoomUpdate(new RoomChangeEvent.ReservationConfirmedEvent(
                saved.eventId(), saved.seatId(), saved.id(), clockPort.now()
        ), null));
        return toView(saved);
    }

    @Override
    @Transactional
    public List<ReservationView> confirmByEventAndSeats(UUID eventId, List<UUID> seatIds, UUID userId) {
        log.info("Batch confirm request eventId={} seats={} userId={}", eventId, seatIds.size(), userId);
        var confirmed = new ArrayList<ReservationView>(seatIds.size());
        var now = clockPort.now();

        for (var seatId : seatIds) {
            var reservation = reservationRepository.findActiveByEventIdAndSeatIdAndUserId(eventId, seatId, userId, now)
                    .orElseThrow(() -> new IllegalArgumentException("Reservation not found for seat " + seatId));
            if (reservation.status() != ReservationStatus.PENDING) {
                log.warn("Confirm rejected status={} eventId={} seatId={} userId={}",
                        reservation.status(), eventId, seatId, userId);
                throw new IllegalStateException("Reservation is not pending for seat " + seatId);
            }

            var updated = confirm(reservation.id(), userId);
            confirmed.add(updated);
        }

        return confirmed;
    }

    @Override
    @Transactional
    public List<ReservationView> cancelByEventAndSeats(UUID eventId, List<UUID> seatIds, UUID userId) {
        log.info("Batch cancel request eventId={} seats={} userId={}", eventId, seatIds.size(), userId);
        var cancelled = new ArrayList<ReservationView>(seatIds.size());
        var now = clockPort.now();

        for (var seatId : seatIds) {
            var reservation = reservationRepository.findActiveByEventIdAndSeatIdAndUserId(eventId, seatId, userId, now)
                    .orElseThrow(() -> new IllegalArgumentException("Reservation not found for seat " + seatId));

            var updatedReservation = reservation.cancel();
            var saved = reservationRepository.save(updatedReservation);
            log.info("Reservation cancelled reservationId={} eventId={} seatId={} userId={}",
                    saved.id(), saved.eventId(), saved.seatId(), saved.userId());
            publishAfterCommit(toRoomUpdate(new RoomChangeEvent.ReservationCancelledEvent(
                    saved.eventId(), saved.seatId(), saved.id(), clockPort.now()
            ), null));
            cancelled.add(toView(saved));
        }

        return cancelled;
    }

    @Transactional
    public int expirePendingReservations() {
        var now = clockPort.now();
        var expiredCount = 0;

        for (var reservation : reservationRepository.findPendingExpired(now)) {
            var expired = reservation.expire();
            reservationRepository.save(expired);
            log.info("Reservation expired reservationId={} eventId={} seatId={} userId={}",
                    expired.id(), expired.eventId(), expired.seatId(), expired.userId());

            publishAfterCommit(toRoomUpdate(new RoomChangeEvent.ReservationExpiredEvent(
                    expired.eventId(), expired.seatId(), expired.id(), now
            ), null));
            expiredCount++;
        }

        return expiredCount;
    }

    private RoomUpdateView toRoomUpdate(RoomChangeEvent event, java.time.Instant expiresAt) {
        return switch (event) {
            case RoomChangeEvent.SeatReservedEvent e ->
                    new RoomUpdateView(e.eventId(), e.seatId(), e.reservationId(), e.status(), expiresAt, e.occurredAt());
            case RoomChangeEvent.ReservationConfirmedEvent e ->
                    new RoomUpdateView(e.eventId(), e.seatId(), e.reservationId(), e.status(), expiresAt, e.occurredAt());
            case RoomChangeEvent.ReservationCancelledEvent e ->
                    new RoomUpdateView(e.eventId(), e.seatId(), e.reservationId(), e.status(), expiresAt, e.occurredAt());
            case RoomChangeEvent.ReservationExpiredEvent e ->
                    new RoomUpdateView(e.eventId(), e.seatId(), e.reservationId(), e.status(), expiresAt, e.occurredAt());
        };
    }

    private void publishAfterCommit(RoomUpdateView update) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    log.debug("Publishing room update after commit eventId={} seatId={} status={}",
                            update.eventId(), update.seatId(), update.status());
                    roomUpdatePublisher.publish(update);
                }
            });
            return;
        }

        log.debug("Publishing room update immediately eventId={} seatId={} status={}",
                update.eventId(), update.seatId(), update.status());
        roomUpdatePublisher.publish(update);
    }

    private ReservationView toView(Reservation reservation) {
        return new ReservationView(
                reservation.id(),
                reservation.eventId(),
                reservation.seatId(),
                reservation.userId(),
                reservation.status(),
                reservation.createdAt(),
                reservation.confirmedAt(),
                reservation.expiresAt()
        );
    }
}
