package com.test.devo_carre.application.service;

import com.test.devo_carre.application.dto.EventView;
import com.test.devo_carre.application.dto.ReservationView;
import com.test.devo_carre.application.port.in.ListMyBookedEventsUseCase;
import com.test.devo_carre.application.port.in.ListMyReservationsUseCase;
import com.test.devo_carre.application.port.out.ClockPort;
import com.test.devo_carre.domain.model.ReservationStatus;
import com.test.devo_carre.domain.repository.EventRepository;
import com.test.devo_carre.domain.repository.ReservationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Profile("!cli")
public class ReservationQueryService implements ListMyReservationsUseCase, ListMyBookedEventsUseCase {

    private static final Logger log = LoggerFactory.getLogger(ReservationQueryService.class);

    private final ReservationRepository reservationRepository;
    private final EventRepository eventRepository;
    private final ClockPort clockPort;

    public ReservationQueryService(ReservationRepository reservationRepository,
                                   EventRepository eventRepository,
                                   ClockPort clockPort) {
        this.reservationRepository = reservationRepository;
        this.eventRepository = eventRepository;
        this.clockPort = clockPort;
    }

    @Override
    public List<ReservationView> listMine(UUID userId) {
        var reservations = reservationRepository.findByUserId(userId).stream()
                .map(reservation -> new ReservationView(
                        reservation.id(),
                        reservation.eventId(),
                        reservation.seatId(),
                        reservation.userId(),
                        reservation.status(),
                        reservation.createdAt(),
                        reservation.confirmedAt(),
                        reservation.expiresAt()
                ))
                .toList();
        log.debug("Fetched reservations for userId={} count={}", userId, reservations.size());
        return reservations;
    }

    @Override
    public List<EventView> listMyBookedEvents(UUID userId) {
        var now = clockPort.now();
        var eventIds = reservationRepository.findByUserId(userId).stream()
                .filter(reservation -> reservation.status() == ReservationStatus.CONFIRMED
                        || (reservation.status() == ReservationStatus.PENDING
                        && reservation.expiresAt() != null
                        && reservation.expiresAt().isAfter(now)))
                .map(reservation -> reservation.eventId())
                .distinct()
                .toList();
        log.debug("Resolved booked events for userId={} eventCount={}", userId, eventIds.size());

        var events = eventIds.stream()
                .map(eventRepository::findById)
                .flatMap(java.util.Optional::stream)
                .map(event -> new EventView(
                        event.id(),
                        event.name(),
                        event.banner(),
                        event.startsAt(),
                        event.roomId()
                ))
                .toList();
        log.debug("Fetched booked event views for userId={} count={}", userId, events.size());
        return events;
    }
}
