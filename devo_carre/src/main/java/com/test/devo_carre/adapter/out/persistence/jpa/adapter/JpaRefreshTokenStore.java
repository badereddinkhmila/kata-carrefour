package com.test.devo_carre.adapter.out.persistence.jpa.adapter;

import com.test.devo_carre.adapter.out.persistence.jpa.entity.RefreshTokenSessionEntity;
import com.test.devo_carre.adapter.out.persistence.jpa.repository.SpringDataRefreshTokenSessionRepository;
import com.test.devo_carre.application.port.out.ClockPort;
import com.test.devo_carre.application.port.out.RefreshTokenStore;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;

@Component
public class JpaRefreshTokenStore implements RefreshTokenStore {

    private final SpringDataRefreshTokenSessionRepository repository;
    private final ClockPort clockPort;

    public JpaRefreshTokenStore(SpringDataRefreshTokenSessionRepository repository, ClockPort clockPort) {
        this.repository = repository;
        this.clockPort = clockPort;
    }

    @Override
    public UUID create(UUID userId, Instant expiresAt) {
        var entity = new RefreshTokenSessionEntity();
        entity.setUserId(userId);
        entity.setExpiresAt(expiresAt);
        entity.setRevoked(false);
        entity.setCreatedAt(clockPort.now());
        return repository.save(entity).getId();
    }

    @Override
    public boolean isActive(UUID tokenId, UUID userId, Instant now) {
        return repository.findByIdAndUserId(tokenId, userId)
                .filter(entity -> !entity.isRevoked())
                .filter(entity -> entity.getExpiresAt().isAfter(now))
                .isPresent();
    }

    @Override
    public void revoke(UUID tokenId) {
        repository.findById(tokenId).ifPresent(entity -> {
            entity.setRevoked(true);
            repository.save(entity);
        });
    }

    @Override
    public void deleteAll() {
        repository.deleteAllInBatch();
    }
}
