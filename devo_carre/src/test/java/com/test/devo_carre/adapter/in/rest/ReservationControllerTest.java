package com.test.devo_carre.adapter.in.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.test.devo_carre.application.dto.ReservationBatchItemCommand;
import com.test.devo_carre.application.dto.ReservationView;
import com.test.devo_carre.application.port.in.CancelReservationUseCase;
import com.test.devo_carre.application.port.in.ConfirmReservationUseCase;
import com.test.devo_carre.application.port.in.ListMyBookedEventsUseCase;
import com.test.devo_carre.application.port.in.ListMyReservationsUseCase;
import com.test.devo_carre.application.port.in.ReserveSeatUseCase;
import com.test.devo_carre.config.ControllerTestConfig;
import com.test.devo_carre.domain.model.ReservationStatus;
import com.test.devo_carre.security.AuthUserPrincipal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.aot.DisabledInAotMode;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = ReservationController.class,
        excludeAutoConfiguration = {
                org.springdoc.core.configuration.SpringDocConfiguration.class,
                org.springdoc.webmvc.core.configuration.SpringDocWebMvcConfiguration.class
        }
)
@AutoConfigureMockMvc(addFilters = false)
@Import(ControllerTestConfig.class)
@DisabledInAotMode
class ReservationControllerTest {

    @Autowired
    MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    ReserveSeatUseCase reserveSeatUseCase;

    @MockitoBean
    ConfirmReservationUseCase confirmReservationUseCase;

    @MockitoBean
    CancelReservationUseCase cancelReservationUseCase;

    @MockitoBean
    ListMyReservationsUseCase listMyReservationsUseCase;

    @MockitoBean
    ListMyBookedEventsUseCase listMyBookedEventsUseCase;

    @Test
    void myReservations_withAuth_returns200() throws Exception {
        var userId = UUID.randomUUID();
        var principal = new AuthUserPrincipal(userId, "test@example.com");
        when(listMyReservationsUseCase.listMine(eq(userId))).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/me/reservations")
                        .with(csrf())
                        .with(request -> {
                            request.setUserPrincipal(new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                                    principal, null, List.of()));
                            return request;
                        }))
                .andExpect(status().isOk());
    }

    @Test
    void confirmReservations_withAuthAndValidBody_returns200() throws Exception {
        var userId = UUID.randomUUID();
        var eventId = UUID.randomUUID();
        var seatId = UUID.randomUUID();
        var principal = new AuthUserPrincipal(userId, "test@example.com");
        var requestBody = List.of(new ReservationBatchItemCommand(eventId, List.of(seatId)));
        var now = Instant.now();
        var view = new ReservationView(
                UUID.randomUUID(), eventId, seatId, userId,
                ReservationStatus.CONFIRMED, now, now, now.plusSeconds(900));
        when(confirmReservationUseCase.confirmByEventAndSeats(eq(eventId), eq(List.of(seatId)), eq(userId)))
                .thenReturn(List.of(view));

        mockMvc.perform(post("/api/v1/reservations/confirm")
                        .with(csrf())
                        .with(request -> {
                            request.setUserPrincipal(new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                                    principal, null, List.of()));
                            return request;
                        })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].status").value("CONFIRMED"));
    }
}
