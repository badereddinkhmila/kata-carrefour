package com.test.devo_carre.application.service;

import com.test.devo_carre.domain.model.Event;
import com.test.devo_carre.domain.model.Reservation;
import com.test.devo_carre.domain.model.ReservationStatus;
import com.test.devo_carre.domain.model.Seat;
import com.test.devo_carre.security.ResourceNotFoundException;
import com.test.devo_carre.support.fake.FakeClockPort;
import com.test.devo_carre.support.fake.FakeEventRepository;
import com.test.devo_carre.support.fake.FakeReservationRepository;
import com.test.devo_carre.support.fake.FakeRoomUpdatePublisher;
import com.test.devo_carre.support.fake.FakeSeatRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ReservationCommandServiceTest {

    private FakeEventRepository eventRepository;
    private FakeSeatRepository seatRepository;
    private FakeReservationRepository reservationRepository;
    private FakeRoomUpdatePublisher roomUpdatePublisher;
    private FakeClockPort clockPort;
    private ReservationCommandService reservationCommandService;

    @BeforeEach
    void setUp() {
        eventRepository = new FakeEventRepository();
        seatRepository = new FakeSeatRepository();
        reservationRepository = new FakeReservationRepository();
        roomUpdatePublisher = new FakeRoomUpdatePublisher();
        clockPort = new FakeClockPort(Instant.parse("2026-03-10T00:00:00Z"));
        reservationCommandService = new ReservationCommandService(
                eventRepository,
                seatRepository,
                reservationRepository,
                roomUpdatePublisher,
                clockPort
        );
    }

    @Test
    void confirm_whenReservationNotFound_throwsResourceNotFoundException() {
        var reservationId = UUID.randomUUID();
        var userId = UUID.randomUUID();

        assertThatThrownBy(() -> reservationCommandService.confirm(reservationId, userId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Reservation not found");
    }

    @Test
    void confirm_whenReservationExists_returnsView() {
        var reservationId = UUID.randomUUID();
        var userId = UUID.randomUUID();
        var eventId = UUID.randomUUID();
        var seatId = UUID.randomUUID();
        var now = clockPort.now();
        var reservation = new Reservation(reservationId, eventId, seatId, userId, ReservationStatus.PENDING,
                now, null, now.plusSeconds(900), null);
        reservationRepository.save(reservation);

        var view = reservationCommandService.confirm(reservationId, userId);

        assertThat(view.id()).isEqualTo(reservationId);
        assertThat(view.status()).isEqualTo(ReservationStatus.CONFIRMED);
    }

    @Test
    void reserve_whenSeatAlreadyReserved_throwsIllegalStateException() {
        var eventId = UUID.randomUUID();
        var seatId = UUID.randomUUID();
        var userId = UUID.randomUUID();
        var roomId = UUID.randomUUID();
        var now = clockPort.now();
        var event = new Event(eventId, "Event", "banner", now.plusSeconds(3600), roomId);
        var seat = new Seat(seatId, roomId, "A1", 1L);

        eventRepository.save(event);
        seatRepository.save(seat);
        reservationRepository.save(new Reservation(UUID.randomUUID(), eventId, seatId, UUID.randomUUID(),
                ReservationStatus.PENDING, now.minusSeconds(30), null, now.plusSeconds(900), null));

        assertThatThrownBy(() -> reservationCommandService.reserve(eventId, seatId, userId))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Seat is already reserved");
    }

    @Test
    void reserve_whenEventInPast_throwsIllegalStateException() {
        var eventId = UUID.randomUUID();
        var seatId = UUID.randomUUID();
        var userId = UUID.randomUUID();
        var roomId = UUID.randomUUID();
        var now = clockPort.now();
        var event = new Event(eventId, "Past Event", "banner", now.minusSeconds(60), roomId);

        eventRepository.save(event);

        assertThatThrownBy(() -> reservationCommandService.reserve(eventId, seatId, userId))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Event has already started");
    }

    @Test
    void reserve_setsExpiresAtWithTtl() {
        var eventId = UUID.randomUUID();
        var seatId = UUID.randomUUID();
        var userId = UUID.randomUUID();
        var roomId = UUID.randomUUID();
        var now = clockPort.now();
        var event = new Event(eventId, "Event", "banner", now.plusSeconds(3600), roomId);
        var seat = new Seat(seatId, roomId, "A1", 1L);

        eventRepository.save(event);
        seatRepository.save(seat);

        var view = reservationCommandService.reserve(eventId, seatId, userId);

        assertThat(view.expiresAt()).isEqualTo(now.plusSeconds(900));
        var saved = reservationRepository.findAll().getFirst();
        assertThat(saved.expiresAt()).isEqualTo(now.plusSeconds(900));
        assertThat(saved.status()).isEqualTo(ReservationStatus.PENDING);
    }

    @Test
    void reserve_twoUsersCompeteForSameSeat_secondFails() {
        var eventId = UUID.randomUUID();
        var seatId = UUID.randomUUID();
        var userId1 = UUID.randomUUID();
        var userId2 = UUID.randomUUID();
        var roomId = UUID.randomUUID();
        var now = clockPort.now();
        var event = new Event(eventId, "Event", "banner", now.plusSeconds(3600), roomId);
        var seat = new Seat(seatId, roomId, "A1", 1L);

        eventRepository.save(event);
        seatRepository.save(seat);

        reservationCommandService.reserve(eventId, seatId, userId1);

        assertThatThrownBy(() -> reservationCommandService.reserve(eventId, seatId, userId2))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Seat is already reserved");
    }

    @Test
    void confirmByEventAndSeats_whenReservationNotPending_throwsIllegalStateException() {
        var eventId = UUID.randomUUID();
        var seatId = UUID.randomUUID();
        var userId = UUID.randomUUID();
        var now = clockPort.now();
        var reservation = new Reservation(UUID.randomUUID(), eventId, seatId, userId,
                ReservationStatus.CONFIRMED, now.minusSeconds(60), now.minusSeconds(30), now.plusSeconds(900), null);

        reservationRepository.save(reservation);

        assertThatThrownBy(() -> reservationCommandService.confirmByEventAndSeats(eventId, List.of(seatId), userId))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Reservation is not pending for seat " + seatId);
    }

    @Test
    void cancelByEventAndSeats_whenReservationAlreadyCancelled_returnsNotFound() {
        var eventId = UUID.randomUUID();
        var seatId = UUID.randomUUID();
        var userId = UUID.randomUUID();
        var now = clockPort.now();
        var reservation = new Reservation(UUID.randomUUID(), eventId, seatId, userId,
                ReservationStatus.CANCELLED, now.minusSeconds(60), null, now.plusSeconds(900), null);

        reservationRepository.save(reservation);

        assertThatThrownBy(() -> reservationCommandService.cancelByEventAndSeats(eventId, List.of(seatId), userId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Reservation not found for seat " + seatId);
    }

    @Test
    void expirePendingReservations_marksExpiredAndReturnsCount() {
        var now = clockPort.now();
        reservationRepository.save(new Reservation(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                ReservationStatus.PENDING, now.minusSeconds(600), null, now.minusSeconds(1), null));
        reservationRepository.save(new Reservation(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                ReservationStatus.PENDING, now.minusSeconds(1200), null, now.minusSeconds(5), null));

        var expiredCount = reservationCommandService.expirePendingReservations();

        assertThat(expiredCount).isEqualTo(2);
        assertThat(reservationRepository.findAll())
                .allMatch(reservation -> reservation.status() == ReservationStatus.EXPIRED);
    }
}
