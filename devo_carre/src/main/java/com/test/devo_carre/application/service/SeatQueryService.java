package com.test.devo_carre.application.service;

import com.test.devo_carre.application.dto.SeatView;
import com.test.devo_carre.application.port.in.ListEventSeatsUseCase;
import com.test.devo_carre.application.port.out.ClockPort;
import com.test.devo_carre.domain.model.ReservationStatus;
import com.test.devo_carre.domain.repository.EventRepository;
import com.test.devo_carre.domain.repository.ReservationRepository;
import com.test.devo_carre.domain.repository.SeatRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Profile("!cli")
public class SeatQueryService implements ListEventSeatsUseCase {

    private static final Logger log = LoggerFactory.getLogger(SeatQueryService.class);

    private final EventRepository eventRepository;
    private final SeatRepository seatRepository;
    private final ReservationRepository reservationRepository;
    private final ClockPort clockPort;

    public SeatQueryService(EventRepository eventRepository,
                            SeatRepository seatRepository,
                            ReservationRepository reservationRepository,
                            ClockPort clockPort) {
        this.eventRepository = eventRepository;
        this.seatRepository = seatRepository;
        this.reservationRepository = reservationRepository;
        this.clockPort = clockPort;
    }

    @Override
    public List<SeatView> listSeats(UUID eventId) {
        log.debug("Listing seats for eventId={}", eventId);
        var event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));

        var activeReservationsBySeat = reservationRepository.findActiveByEventId(eventId, clockPort.now()).stream()
                .collect(java.util.stream.Collectors.toMap(r -> r.seatId(), r -> r, (a, b) -> a));

        var seats = seatRepository.findByRoomId(event.roomId()).stream()
                .map(seat -> {
                    var reservation = activeReservationsBySeat.get(seat.id());
                    return new SeatView(
                            seat.id(),
                            seat.roomId(),
                            seat.seatNumber(),
                            reservation != null,
                            reservation != null ? reservation.userId() : null,
                            reservation != null ? reservation.status() : null,
                            reservation != null && reservation.status() == ReservationStatus.PENDING
                                    ? reservation.expiresAt()
                                    : null
                    );
                })
                .toList();
        log.debug("Listed seats for eventId={} seatCount={} activeReservations={}",
                eventId, seats.size(), activeReservationsBySeat.size());
        return seats;
    }
}
