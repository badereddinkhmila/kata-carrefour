package com.test.devo_carre.application.service;

import com.test.devo_carre.application.port.in.StreamRoomChangesUseCase;
import com.test.devo_carre.application.port.out.RoomUpdatePublisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.UUID;

@Service
@Profile("!cli")
public class RoomStreamService implements StreamRoomChangesUseCase {

    private static final Logger log = LoggerFactory.getLogger(RoomStreamService.class);
    private final RoomUpdatePublisher roomUpdatePublisher;

    public RoomStreamService(RoomUpdatePublisher roomUpdatePublisher) {
        this.roomUpdatePublisher = roomUpdatePublisher;
    }

    @Override
    public SseEmitter stream(UUID eventId) {
        log.info("SSE subscribe eventId={}", eventId);
        return roomUpdatePublisher.subscribe(eventId);
    }
}
