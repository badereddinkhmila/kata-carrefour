package com.test.devo_carre.adapter.out.persistence.jpa.repository;

import com.test.devo_carre.adapter.out.persistence.jpa.entity.RoomEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SpringDataRoomRepository extends JpaRepository<RoomEntity, UUID> {
}
