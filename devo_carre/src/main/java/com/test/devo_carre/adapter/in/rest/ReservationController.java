package com.test.devo_carre.adapter.in.rest;

import com.test.devo_carre.application.dto.ReservationBatchItemCommand;
import com.test.devo_carre.application.dto.ReservationView;
import com.test.devo_carre.application.dto.EventView;
import com.test.devo_carre.application.port.in.CancelReservationUseCase;
import com.test.devo_carre.application.port.in.ConfirmReservationUseCase;
import com.test.devo_carre.application.port.in.ListMyBookedEventsUseCase;
import com.test.devo_carre.application.port.in.ListMyReservationsUseCase;
import com.test.devo_carre.application.port.in.ReserveSeatUseCase;
import com.test.devo_carre.security.AuthUserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Reservations")
@Profile("!cli")
public class ReservationController {

    private final ReserveSeatUseCase reserveSeatUseCase;
    private final ConfirmReservationUseCase confirmReservationUseCase;
    private final CancelReservationUseCase cancelReservationUseCase;
    private final ListMyReservationsUseCase listMyReservationsUseCase;
    private final ListMyBookedEventsUseCase listMyBookedEventsUseCase;

    public ReservationController(ReserveSeatUseCase reserveSeatUseCase,
                                 ConfirmReservationUseCase confirmReservationUseCase,
                                 CancelReservationUseCase cancelReservationUseCase,
                                 ListMyReservationsUseCase listMyReservationsUseCase,
                                 ListMyBookedEventsUseCase listMyBookedEventsUseCase) {
        this.reserveSeatUseCase = reserveSeatUseCase;
        this.confirmReservationUseCase = confirmReservationUseCase;
        this.cancelReservationUseCase = cancelReservationUseCase;
        this.listMyReservationsUseCase = listMyReservationsUseCase;
        this.listMyBookedEventsUseCase = listMyBookedEventsUseCase;
    }

    @PostMapping("/reservations/batch")
    @Operation(summary = "Create one or multiple reservations")
    public List<ReservationView> createReservations(
            @Valid @RequestBody List<@Valid ReservationBatchItemCommand> reservations,
            Authentication authentication
    ) {
        var principal = (AuthUserPrincipal) authentication.getPrincipal();
        var created = new ArrayList<ReservationView>();
        for (var reservation : reservations) {
            created.addAll(reserveSeatUseCase.reserveMany(reservation.eventId(), reservation.seats(), principal.userId()));
        }
        return created;
    }

    @PostMapping("/reservations/confirm")
    @Operation(summary = "Confirm one or multiple reservations")
    public List<ReservationView> confirmReservations(
            @Valid @RequestBody List<@Valid ReservationBatchItemCommand> reservations,
            Authentication authentication
    ) {
        var principal = (AuthUserPrincipal) authentication.getPrincipal();
        var confirmed = new ArrayList<ReservationView>();
        for (var reservation : reservations) {
            confirmed.addAll(confirmReservationUseCase.confirmByEventAndSeats(
                    reservation.eventId(), reservation.seats(), principal.userId()
            ));
        }
        return confirmed;
    }

    @PostMapping("/reservations/cancel")
    @Operation(summary = "Cancel one or multiple reservations")
    public List<ReservationView> cancelReservations(
            @Valid @RequestBody List<@Valid ReservationBatchItemCommand> reservations,
            Authentication authentication
    ) {
        var principal = (AuthUserPrincipal) authentication.getPrincipal();
        var cancelled = new ArrayList<ReservationView>();
        for (var reservation : reservations) {
            cancelled.addAll(cancelReservationUseCase.cancelByEventAndSeats(
                    reservation.eventId(), reservation.seats(), principal.userId()
            ));
        }
        return cancelled;
    }

    @GetMapping("/me/reservations")
    @Operation(summary = "List reservations for current user")
    public List<ReservationView> myReservations(Authentication authentication) {
        var principal = (AuthUserPrincipal) authentication.getPrincipal();
        return listMyReservationsUseCase.listMine(principal.userId());
    }

    @GetMapping("/me/events")
    @Operation(summary = "List events booked by current user (pending or confirmed)")
    public List<EventView> myBookedEvents(Authentication authentication) {
        var principal = (AuthUserPrincipal) authentication.getPrincipal();
        return listMyBookedEventsUseCase.listMyBookedEvents(principal.userId());
    }
}
