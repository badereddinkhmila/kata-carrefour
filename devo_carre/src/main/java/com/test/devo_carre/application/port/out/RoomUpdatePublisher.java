package com.test.devo_carre.application.port.out;

import com.test.devo_carre.application.dto.RoomUpdateView;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.UUID;

public interface RoomUpdatePublisher {
    void publish(RoomUpdateView update);

    SseEmitter subscribe(UUID eventId);
}
