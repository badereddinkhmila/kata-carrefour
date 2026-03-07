package com.test.devo_carre.application.port.out;

import java.time.Instant;
import java.util.UUID;

public interface RefreshTokenStore {
    UUID create(UUID userId, Instant expiresAt);

    boolean isActive(UUID tokenId, UUID userId, Instant now);

    void revoke(UUID tokenId);

    void deleteAll();
}
