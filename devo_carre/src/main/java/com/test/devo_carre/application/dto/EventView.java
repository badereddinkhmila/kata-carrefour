package com.test.devo_carre.application.dto;

import java.time.Instant;
import java.util.UUID;

public record EventView(UUID id, String name, String banner, Instant startsAt, UUID roomId) {
}
