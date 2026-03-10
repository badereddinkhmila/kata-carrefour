package com.test.devo_carre.adapter.in.rest;

import com.test.devo_carre.application.dto.EventReservationDetailView;
import com.test.devo_carre.application.dto.EventView;
import com.test.devo_carre.application.dto.PagedResponse;
import com.test.devo_carre.application.dto.RoomView;
import com.test.devo_carre.application.port.in.GetEventReservationDetailUseCase;
import com.test.devo_carre.application.port.in.ListEventSeatsUseCase;
import com.test.devo_carre.application.port.in.ListEventsUseCase;
import com.test.devo_carre.config.ControllerTestConfig;
import com.test.devo_carre.security.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.aot.DisabledInAotMode;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = EventController.class,
        excludeAutoConfiguration = {
                org.springdoc.core.configuration.SpringDocConfiguration.class,
                org.springdoc.webmvc.core.configuration.SpringDocWebMvcConfiguration.class
        }
)
@AutoConfigureMockMvc(addFilters = false)
@Import(ControllerTestConfig.class)
@DisabledInAotMode
class EventControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockitoBean
    ListEventsUseCase listEventsUseCase;

    @MockitoBean
    ListEventSeatsUseCase listEventSeatsUseCase;

    @MockitoBean
    GetEventReservationDetailUseCase getEventReservationDetailUseCase;

    @Test
    void listEvents_returns200() throws Exception {
        var eventId = UUID.randomUUID();
        var roomId = UUID.randomUUID();
        var paged = new PagedResponse<>(
                List.of(new EventView(eventId, "Event", "banner", Instant.now(), roomId)),
                0, 10, 1, 1, false, false
        );
        when(listEventsUseCase.listEvents(anyInt(), anyInt())).thenReturn(paged);

        mockMvc.perform(get("/api/v1/events").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].name").value("Event"));
    }

    @Test
    void getEventDetail_returns200() throws Exception {
        var eventId = UUID.randomUUID();
        var detail = new EventReservationDetailView(eventId, "Event", "banner", Instant.now(),
                new RoomView(UUID.randomUUID(), "Room", 10),
                List.of());
        when(getEventReservationDetailUseCase.getDetail(eq(eventId))).thenReturn(detail);

        mockMvc.perform(get("/api/v1/events/{eventId}", eventId).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.eventName").value("Event"));
    }

    @Test
    void getEventDetail_whenNotFound_returns404() throws Exception {
        var eventId = UUID.randomUUID();
        when(getEventReservationDetailUseCase.getDetail(eq(eventId)))
                .thenThrow(new ResourceNotFoundException("Event not found"));

        mockMvc.perform(get("/api/v1/events/{eventId}", eventId).with(csrf()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Event not found"));
    }

    @Test
    void listEvents_withInvalidSize_returns400() throws Exception {
        mockMvc.perform(get("/api/v1/events").param("size", "101").with(csrf()))
                .andExpect(status().isBadRequest());
    }
}
