package com.test.devo_carre.adapter.out.persistence.jpa.repository;

import com.test.devo_carre.adapter.out.persistence.jpa.entity.ReservationEntity;
import com.test.devo_carre.domain.model.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringDataReservationRepository extends JpaRepository<ReservationEntity, UUID> {
    Optional<ReservationEntity> findByEventIdAndSeatId(UUID eventId, UUID seatId);

    List<ReservationEntity> findByUserId(UUID userId);

    @Query("""
            select r from ReservationEntity r
            where r.eventId = :eventId and r.seatId = :seatId and r.userId = :userId
            and (
              r.status = com.test.devo_carre.domain.model.ReservationStatus.CONFIRMED
              or (r.status = com.test.devo_carre.domain.model.ReservationStatus.PENDING and r.expiresAt > :now)
            )
            order by r.createdAt desc
            """)
    List<ReservationEntity> findActiveByEventIdAndSeatIdAndUserId(@Param("eventId") UUID eventId,
                                                                   @Param("seatId") UUID seatId,
                                                                   @Param("userId") UUID userId,
                                                                   @Param("now") Instant now);

    @Query("""
            select r from ReservationEntity r
            where r.eventId = :eventId and r.seatId = :seatId
            and (
              r.status = com.test.devo_carre.domain.model.ReservationStatus.CONFIRMED
              or (r.status = com.test.devo_carre.domain.model.ReservationStatus.PENDING and r.expiresAt > :now)
            )
            """)
    Optional<ReservationEntity> findActiveByEventIdAndSeatId(@Param("eventId") UUID eventId,
                                                              @Param("seatId") UUID seatId,
                                                              @Param("now") Instant now);

    @Query("""
            select r from ReservationEntity r
            where r.eventId = :eventId
            and (
              r.status = com.test.devo_carre.domain.model.ReservationStatus.CONFIRMED
              or (r.status = com.test.devo_carre.domain.model.ReservationStatus.PENDING and r.expiresAt > :now)
            )
            """)
    List<ReservationEntity> findActiveByEventId(@Param("eventId") UUID eventId, @Param("now") Instant now);

    List<ReservationEntity> findByStatusAndExpiresAtBefore(ReservationStatus status, Instant now);
}
