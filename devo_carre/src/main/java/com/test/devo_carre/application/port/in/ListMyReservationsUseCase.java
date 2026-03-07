package com.test.devo_carre.application.port.in;

import com.test.devo_carre.application.dto.ReservationView;

import java.util.List;
import java.util.UUID;

public interface ListMyReservationsUseCase {
    List<ReservationView> listMine(UUID userId);
}
