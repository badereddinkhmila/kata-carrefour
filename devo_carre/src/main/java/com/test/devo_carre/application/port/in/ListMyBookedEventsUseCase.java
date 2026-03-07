package com.test.devo_carre.application.port.in;

import com.test.devo_carre.application.dto.EventView;

import java.util.List;
import java.util.UUID;

public interface ListMyBookedEventsUseCase {
    List<EventView> listMyBookedEvents(UUID userId);
}
