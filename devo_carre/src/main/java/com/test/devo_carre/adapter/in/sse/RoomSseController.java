package com.test.devo_carre.adapter.in.sse;

import com.test.devo_carre.application.port.in.StreamRoomChangesUseCase;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/events")
@Profile("!cli")
public class RoomSseController {

    private final StreamRoomChangesUseCase streamRoomChangesUseCase;

    public RoomSseController(StreamRoomChangesUseCase streamRoomChangesUseCase) {
        this.streamRoomChangesUseCase = streamRoomChangesUseCase;
    }

    @GetMapping("/{eventId}/stream")
    public SseEmitter stream(@PathVariable UUID eventId) {
        return streamRoomChangesUseCase.stream(eventId);
    }
}
