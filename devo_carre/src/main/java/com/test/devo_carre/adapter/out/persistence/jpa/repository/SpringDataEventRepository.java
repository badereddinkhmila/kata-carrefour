package com.test.devo_carre.adapter.out.persistence.jpa.repository;

import com.test.devo_carre.adapter.out.persistence.jpa.entity.EventEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SpringDataEventRepository extends JpaRepository<EventEntity, UUID> {
}
