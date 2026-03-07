package com.test.devo_carre.application.dto;

import jakarta.validation.constraints.NotBlank;

public record RefreshTokenCommand(@NotBlank String refreshToken) {
}
