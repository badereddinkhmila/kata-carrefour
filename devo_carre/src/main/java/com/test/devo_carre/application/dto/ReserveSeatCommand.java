package com.test.devo_carre.application.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ReserveSeatCommand(@NotNull UUID seatId) {
}
