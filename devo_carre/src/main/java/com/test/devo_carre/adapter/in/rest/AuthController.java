package com.test.devo_carre.adapter.in.rest;

import com.test.devo_carre.application.dto.AuthResponse;
import com.test.devo_carre.application.dto.LoginCommand;
import com.test.devo_carre.application.dto.RefreshTokenCommand;
import com.test.devo_carre.application.dto.RegisterCommand;
import com.test.devo_carre.application.port.in.LoginUseCase;
import com.test.devo_carre.application.port.in.RefreshTokenUseCase;
import com.test.devo_carre.application.port.in.RegisterUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication")
@Profile("!cli")
public class AuthController {

    private final RegisterUseCase registerUseCase;
    private final LoginUseCase loginUseCase;
    private final RefreshTokenUseCase refreshTokenUseCase;

    public AuthController(RegisterUseCase registerUseCase,
                          LoginUseCase loginUseCase,
                          RefreshTokenUseCase refreshTokenUseCase) {
        this.registerUseCase = registerUseCase;
        this.loginUseCase = loginUseCase;
        this.refreshTokenUseCase = refreshTokenUseCase;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public AuthResponse register(@Valid @RequestBody RegisterCommand command) {
        return registerUseCase.register(command);
    }

    @PostMapping("/login")
    @Operation(summary = "Login and receive access/refresh tokens")
    public AuthResponse login(@Valid @RequestBody LoginCommand command) {
        return loginUseCase.login(command);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token using refresh token")
    public AuthResponse refresh(@Valid @RequestBody RefreshTokenCommand command) {
        return refreshTokenUseCase.refresh(command);
    }
}
