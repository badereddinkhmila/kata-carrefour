package com.test.devo_carre.application.port.in;

import com.test.devo_carre.application.dto.EventReservationDetailView;

import java.util.UUID;

public interface GetEventReservationDetailUseCase {
    EventReservationDetailView getDetail(UUID eventId);
}
