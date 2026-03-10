package com.test.devo_carre.support.fake;

import com.test.devo_carre.application.dto.RoomUpdateView;
import com.test.devo_carre.application.port.out.RoomUpdatePublisher;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class FakeRoomUpdatePublisher implements RoomUpdatePublisher {
    private final List<RoomUpdateView> published = new ArrayList<>();

    @Override
    public void publish(RoomUpdateView update) {
        published.add(update);
    }

    @Override
    public SseEmitter subscribe(UUID eventId) {
        return new SseEmitter(0L);
    }

    public List<RoomUpdateView> publishedUpdates() {
        return List.copyOf(published);
    }
}
