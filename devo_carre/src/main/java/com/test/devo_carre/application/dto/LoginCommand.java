package com.test.devo_carre.application.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginCommand(@Email @NotBlank String email, @NotBlank String password) {
}
