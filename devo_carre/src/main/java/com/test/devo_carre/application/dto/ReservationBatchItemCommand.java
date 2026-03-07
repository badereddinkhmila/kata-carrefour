package com.test.devo_carre.application.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record ReservationBatchItemCommand(
        @NotNull UUID eventId,
        @NotEmpty List<@NotNull UUID> seats
) {
}
