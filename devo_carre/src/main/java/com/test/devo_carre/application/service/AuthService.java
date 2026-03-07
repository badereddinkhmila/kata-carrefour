package com.test.devo_carre.application.service;

import com.test.devo_carre.application.dto.AuthResponse;
import com.test.devo_carre.application.dto.LoginCommand;
import com.test.devo_carre.application.dto.RefreshTokenCommand;
import com.test.devo_carre.application.dto.RegisterCommand;
import com.test.devo_carre.application.port.in.LoginUseCase;
import com.test.devo_carre.application.port.in.RefreshTokenUseCase;
import com.test.devo_carre.application.port.in.RegisterUseCase;
import com.test.devo_carre.application.port.out.ClockPort;
import com.test.devo_carre.application.port.out.PasswordHasher;
import com.test.devo_carre.application.port.out.RefreshTokenStore;
import com.test.devo_carre.application.port.out.TokenProvider;
import com.test.devo_carre.domain.model.User;
import com.test.devo_carre.domain.repository.UserRepository;
import com.test.devo_carre.security.UnauthorizedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Profile("!cli")
public class AuthService implements RegisterUseCase, LoginUseCase, RefreshTokenUseCase {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordHasher passwordHasher;
    private final TokenProvider tokenProvider;
    private final RefreshTokenStore refreshTokenStore;
    private final ClockPort clockPort;

    public AuthService(UserRepository userRepository,
                       PasswordHasher passwordHasher,
                       TokenProvider tokenProvider,
                       RefreshTokenStore refreshTokenStore,
                       ClockPort clockPort) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
        this.tokenProvider = tokenProvider;
        this.refreshTokenStore = refreshTokenStore;
        this.clockPort = clockPort;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterCommand command) {
        log.info("Register request received for email={}", maskEmail(command.email()));
        if (userRepository.existsByEmail(command.email())) {
            log.warn("Register rejected, email already exists email={}", maskEmail(command.email()));
            throw new IllegalArgumentException("Email already registered");
        }

        var user = new User(null, command.email(), passwordHasher.hash(command.password()), clockPort.now());
        var saved = userRepository.save(user);
        log.info("User registered userId={} email={}", saved.id(), maskEmail(saved.email()));
        return issueAndStore(saved.id(), saved.email());
    }

    @Override
    @Transactional
    public AuthResponse login(LoginCommand command) {
        log.info("Login attempt email={}", maskEmail(command.email()));
        var user = userRepository.findByEmail(command.email())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!passwordHasher.matches(command.password(), user.passwordHash())) {
            log.warn("Login rejected due to invalid credentials email={}", maskEmail(command.email()));
            throw new UnauthorizedException("Invalid credentials");
        }

        log.info("Login success userId={} email={}", user.id(), maskEmail(user.email()));
        return issueAndStore(user.id(), user.email());
    }

    @Override
    @Transactional
    public AuthResponse refresh(RefreshTokenCommand command) {
        var parsed = tokenProvider.parseRefreshToken(command.refreshToken())
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));
        log.info("Refresh token request userId={} tokenId={}", parsed.userId(), parsed.tokenId());

        var now = clockPort.now();
        if (!refreshTokenStore.isActive(parsed.tokenId(), parsed.userId(), now)) {
            log.warn("Refresh token rejected userId={} tokenId={} reason=expired_or_revoked",
                    parsed.userId(), parsed.tokenId());
            throw new UnauthorizedException("Refresh token expired or revoked");
        }

        var user = userRepository.findById(parsed.userId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        refreshTokenStore.revoke(parsed.tokenId());
        log.info("Refresh token rotated userId={} oldTokenId={}", user.id(), parsed.tokenId());
        return issueAndStore(user.id(), user.email());
    }

    private AuthResponse issueAndStore(java.util.UUID userId, String email) {
        var now = clockPort.now();
        var refreshExpiry = now.plusSeconds(tokenProvider.refreshExpiresInSeconds());
        var refreshTokenId = refreshTokenStore.create(userId, refreshExpiry);
        var tokenPair = tokenProvider.issueTokens(userId, email, refreshTokenId);

        return new AuthResponse(
                tokenPair.accessToken(),
                tokenPair.refreshToken(),
                "Bearer",
                tokenPair.accessExpiresInSeconds(),
                tokenPair.refreshExpiresInSeconds()
        );
    }

    private String maskEmail(String email) {
        var atIndex = email.indexOf('@');
        if (atIndex <= 1) {
            return "***";
        }
        return email.charAt(0) + "***" + email.substring(atIndex);
    }
}
