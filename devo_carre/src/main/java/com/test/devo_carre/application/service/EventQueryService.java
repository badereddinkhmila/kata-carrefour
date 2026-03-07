package com.test.devo_carre.application.service;

import com.test.devo_carre.application.dto.EventReservationDetailView;
import com.test.devo_carre.application.dto.EventView;
import com.test.devo_carre.application.dto.PagedResponse;
import com.test.devo_carre.application.dto.RoomView;
import com.test.devo_carre.application.dto.SeatView;
import com.test.devo_carre.application.port.in.GetEventReservationDetailUseCase;
import com.test.devo_carre.application.port.in.ListEventsUseCase;
import com.test.devo_carre.application.port.out.ClockPort;
import com.test.devo_carre.domain.model.ReservationStatus;
import com.test.devo_carre.domain.repository.EventRepository;
import com.test.devo_carre.domain.repository.ReservationRepository;
import com.test.devo_carre.domain.repository.RoomRepository;
import com.test.devo_carre.domain.repository.SeatRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Profile("!cli")
public class EventQueryService implements ListEventsUseCase, GetEventReservationDetailUseCase {

    private static final Logger log = LoggerFactory.getLogger(EventQueryService.class);

    private final EventRepository eventRepository;
    private final RoomRepository roomRepository;
    private final SeatRepository seatRepository;
    private final ReservationRepository reservationRepository;
    private final ClockPort clockPort;

    public EventQueryService(EventRepository eventRepository,
                             RoomRepository roomRepository,
                             SeatRepository seatRepository,
                             ReservationRepository reservationRepository,
                             ClockPort clockPort) {
        this.eventRepository = eventRepository;
        this.roomRepository = roomRepository;
        this.seatRepository = seatRepository;
        this.reservationRepository = reservationRepository;
        this.clockPort = clockPort;
    }

    @Override
    public PagedResponse<EventView> listEvents(int page, int size) {
        var safePage = Math.max(page, 0);
        var safeSize = Math.min(Math.max(size, 1), 100);

        var result = eventRepository.findPage(safePage, safeSize);
        var content = result.content().stream()
                .map(event -> new EventView(event.id(), event.name(), event.banner(), event.startsAt(), event.roomId()))
                .toList();

        var response = new PagedResponse<>(
                content,
                result.page(),
                result.size(),
                result.totalElements(),
                result.totalPages(),
                result.hasNext(),
                result.hasPrevious()
        );
        log.debug("Listed events page={} size={} totalElements={} returned={}",
                response.page(), response.size(), response.totalElements(), response.content().size());
        return response;
    }

    @Override
    public EventReservationDetailView getDetail(UUID eventId) {
        log.debug("Fetching reservation detail for eventId={}", eventId);
        var event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));

        var room = roomRepository.findById(event.roomId())
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

        var activeReservationsBySeat = reservationRepository.findActiveByEventId(eventId, clockPort.now()).stream()
                .collect(java.util.stream.Collectors.toMap(r -> r.seatId(), r -> r, (a, b) -> a));

        var seats = seatRepository.findByRoomId(room.id()).stream()
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

        var detail = new EventReservationDetailView(
                event.id(),
                event.name(),
                event.banner(),
                event.startsAt(),
                new RoomView(room.id(), room.name(), room.capacity()),
                seats
        );
        log.debug("Event reservation detail ready eventId={} seats={} activeReservations={}",
                eventId, seats.size(), activeReservationsBySeat.size());
        return detail;
    }
}
