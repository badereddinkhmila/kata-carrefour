package com.test.devo_carre.adapter.out.persistence.jpa.repository;

import com.test.devo_carre.adapter.out.persistence.jpa.entity.SeatEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SpringDataSeatRepository extends JpaRepository<SeatEntity, UUID> {
    List<SeatEntity> findByRoomId(UUID roomId);
}
