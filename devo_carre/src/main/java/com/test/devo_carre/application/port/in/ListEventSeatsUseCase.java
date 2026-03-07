package com.test.devo_carre.application.port.in;

import com.test.devo_carre.application.dto.SeatView;

import java.util.List;
import java.util.UUID;

public interface ListEventSeatsUseCase {
    List<SeatView> listSeats(UUID eventId);
}
