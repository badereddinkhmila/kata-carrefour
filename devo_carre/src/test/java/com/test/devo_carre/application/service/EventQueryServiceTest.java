package com.test.devo_carre.application.service;

import com.test.devo_carre.application.port.out.ClockPort;
import com.test.devo_carre.domain.repository.EventRepository;
import com.test.devo_carre.domain.repository.ReservationRepository;
import com.test.devo_carre.domain.repository.RoomRepository;
import com.test.devo_carre.domain.repository.SeatRepository;
import com.test.devo_carre.security.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EventQueryServiceTest {

    @Mock
    EventRepository eventRepository;

    @Mock
    RoomRepository roomRepository;

    @Mock
    SeatRepository seatRepository;

    @Mock
    ReservationRepository reservationRepository;

    @Mock
    ClockPort clockPort;

    @InjectMocks
    EventQueryService eventQueryService;

    @Test
    void getDetail_whenEventNotFound_throwsResourceNotFoundException() {
        var eventId = UUID.randomUUID();
        when(eventRepository.findById(eventId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> eventQueryService.getDetail(eventId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Event not found");
    }
}
