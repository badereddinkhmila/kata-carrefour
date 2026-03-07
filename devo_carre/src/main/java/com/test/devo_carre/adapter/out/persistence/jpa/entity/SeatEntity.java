package com.test.devo_carre.adapter.out.persistence.jpa.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.UUID;

@Entity
@Table(name = "seats", uniqueConstraints = @UniqueConstraint(name = "uk_room_seat_number", columnNames = {"room_id", "seat_number"}))
@Data
public class SeatEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "seat_number", nullable = false)
    private String seatNumber;

    @Column(name = "room_id", nullable = false)
    private UUID roomId;

    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false, insertable = false, updatable = false)
    private RoomEntity room;

    @Version
    private Long version;
}
