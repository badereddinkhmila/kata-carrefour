package com.test.devo_carre.application.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record CreateReservationsCommand(
        @NotEmpty List<@NotNull UUID> seatIds
) {
}
