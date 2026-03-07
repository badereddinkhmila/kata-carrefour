package com.test.devo_carre.adapter.out.persistence.jpa.repository;

import com.test.devo_carre.adapter.out.persistence.jpa.entity.RefreshTokenSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SpringDataRefreshTokenSessionRepository extends JpaRepository<RefreshTokenSessionEntity, UUID> {
    Optional<RefreshTokenSessionEntity> findByIdAndUserId(UUID id, UUID userId);
}
