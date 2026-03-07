package com.test.devo_carre.adapter.out.security;

import com.test.devo_carre.application.port.out.TokenProvider;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

@Component
@Profile("!cli")
public class JwtTokenProvider implements TokenProvider {

    private final SecretKey key;
    private final long accessTokenTtlSeconds;
    private final long refreshTokenTtlSeconds;

    public JwtTokenProvider(
            @Value("${app.security.jwt-secret:change-me-change-me-change-me-change-me}") String secret,
            @Value("${app.security.access-token-ttl-seconds:900}") long accessTokenTtlSeconds,
            @Value("${app.security.refresh-token-ttl-seconds:1209600}") long refreshTokenTtlSeconds
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenTtlSeconds = accessTokenTtlSeconds;
        this.refreshTokenTtlSeconds = refreshTokenTtlSeconds;
    }

    @Override
    public TokenPair issueTokens(UUID userId, String email, UUID refreshTokenId) {
        var now = Instant.now();

        var accessToken = Jwts.builder()
                .subject(userId.toString())
                .claim("email", email)
                .claim("typ", "access")
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(accessTokenTtlSeconds)))
                .signWith(key)
                .compact();

        var refreshToken = Jwts.builder()
                .subject(userId.toString())
                .claim("tid", refreshTokenId.toString())
                .claim("typ", "refresh")
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(refreshTokenTtlSeconds)))
                .signWith(key)
                .compact();

        return new TokenPair(accessToken, refreshToken, accessTokenTtlSeconds, refreshTokenTtlSeconds);
    }

    @Override
    public Optional<AccessPrincipal> parseAccessToken(String token) {
        return parseClaims(token)
                .filter(claims -> "access".equals(claims.get("typ", String.class)))
                .map(claims -> new AccessPrincipal(
                        UUID.fromString(claims.getSubject()),
                        claims.get("email", String.class)
                ));
    }

    @Override
    public Optional<RefreshPrincipal> parseRefreshToken(String token) {
        return parseClaims(token)
                .filter(claims -> "refresh".equals(claims.get("typ", String.class)))
                .map(claims -> new RefreshPrincipal(
                        UUID.fromString(claims.getSubject()),
                        UUID.fromString(claims.get("tid", String.class))
                ));
    }

    @Override
    public long accessExpiresInSeconds() {
        return accessTokenTtlSeconds;
    }

    @Override
    public long refreshExpiresInSeconds() {
        return refreshTokenTtlSeconds;
    }

    private Optional<Claims> parseClaims(String token) {
        try {
            var payload = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return Optional.of(payload);
        } catch (Exception ex) {
            return Optional.empty();
        }
    }
}
