package com.test.devo_carre.application.port.out;

import java.util.Optional;
import java.util.UUID;

public interface TokenProvider {
    TokenPair issueTokens(UUID userId, String email, UUID refreshTokenId);

    Optional<AccessPrincipal> parseAccessToken(String token);

    Optional<RefreshPrincipal> parseRefreshToken(String token);

    long accessExpiresInSeconds();

    long refreshExpiresInSeconds();

    record TokenPair(
            String accessToken,
            String refreshToken,
            long accessExpiresInSeconds,
            long refreshExpiresInSeconds
    ) {
    }

    record AccessPrincipal(UUID userId, String email) {
    }

    record RefreshPrincipal(UUID userId, UUID tokenId) {
    }
}
