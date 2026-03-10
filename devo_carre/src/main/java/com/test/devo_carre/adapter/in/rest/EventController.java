package com.test.devo_carre.adapter.in.rest;

import com.test.devo_carre.application.dto.EventReservationDetailView;
import com.test.devo_carre.application.dto.EventView;
import com.test.devo_carre.application.dto.PagedResponse;
import com.test.devo_carre.application.dto.SeatView;
import com.test.devo_carre.application.port.in.GetEventReservationDetailUseCase;
import com.test.devo_carre.application.port.in.ListEventSeatsUseCase;
import com.test.devo_carre.application.port.in.ListEventsUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.context.annotation.Profile;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/events")
@Tag(name = "Events")
@Profile("!cli")
@Validated
public class EventController {

    private final ListEventsUseCase listEventsUseCase;
    private final ListEventSeatsUseCase listEventSeatsUseCase;
    private final GetEventReservationDetailUseCase getEventReservationDetailUseCase;

    public EventController(ListEventsUseCase listEventsUseCase,
                           ListEventSeatsUseCase listEventSeatsUseCase,
                           GetEventReservationDetailUseCase getEventReservationDetailUseCase) {
        this.listEventsUseCase = listEventsUseCase;
        this.listEventSeatsUseCase = listEventSeatsUseCase;
        this.getEventReservationDetailUseCase = getEventReservationDetailUseCase;
    }

    @GetMapping
    @Operation(summary = "List events (paginated)")
    public PagedResponse<EventView> listEvents(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size
    ) {
        return listEventsUseCase.listEvents(page, size);
    }

    @GetMapping("/{eventId}")
    @Operation(summary = "Get event reservation details (event, room, seats)")
    public EventReservationDetailView getEventDetail(@PathVariable UUID eventId) {
        return getEventReservationDetailUseCase.getDetail(eventId);
    }

    @GetMapping("/{eventId}/seats")
    @Operation(summary = "List seats for an event")
    public List<SeatView> listSeats(@PathVariable UUID eventId) {
        return listEventSeatsUseCase.listSeats(eventId);
    }
}
