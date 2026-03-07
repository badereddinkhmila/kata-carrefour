package com.test.devo_carre.domain.model;

import java.time.Instant;
import java.util.UUID;

public record Event(UUID id, String name, String banner, Instant startsAt, UUID roomId) {
}
