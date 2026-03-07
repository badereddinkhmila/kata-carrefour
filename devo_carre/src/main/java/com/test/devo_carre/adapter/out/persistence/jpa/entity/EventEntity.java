package com.test.devo_carre.adapter.out.persistence.jpa.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "events")
@Data
public class EventEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(length = 1024)
    private String banner;

    @Column(nullable = false)
    private Instant startsAt;

    @Column(name = "room_id", nullable = false)
    private UUID roomId;
}
