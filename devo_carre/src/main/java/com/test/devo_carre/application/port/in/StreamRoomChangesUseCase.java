package com.test.devo_carre.application.port.in;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.UUID;

public interface StreamRoomChangesUseCase {
    SseEmitter stream(UUID eventId);
}
