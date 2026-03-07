package com.test.devo_carre.adapter.out.sse;

import com.test.devo_carre.application.dto.RoomUpdateView;
import com.test.devo_carre.application.port.out.RoomUpdatePublisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
@Profile("!cli")
public class InMemoryRoomUpdatePublisher implements RoomUpdatePublisher {

    private static final Logger log = LoggerFactory.getLogger(InMemoryRoomUpdatePublisher.class);
    private final Map<UUID, List<SseEmitter>> subscribers = new ConcurrentHashMap<>();

    @Override
    public void publish(RoomUpdateView update) {
        var emitters = subscribers.getOrDefault(update.eventId(), List.of());
        log.debug("Publishing room-update eventId={} seatId={} status={} subscriberCount={}",
                update.eventId(), update.seatId(), update.status(), emitters.size());
        for (var emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("room-update").data(update));
            } catch (IOException | IllegalStateException ex) {
                log.debug("Dropping disconnected SSE emitter eventId={} reason={}", update.eventId(), ex.getMessage());
                removeSubscriber(update.eventId(), emitter);
                try {
                    emitter.complete();
                } catch (RuntimeException ignored) {}
            }
        }
    }

    @Override
    public SseEmitter subscribe(UUID eventId) {
        var emitter = new SseEmitter(0L);
        var emitters = subscribers.computeIfAbsent(eventId, ignored -> new CopyOnWriteArrayList<>());
        emitters.add(emitter);
        log.info("SSE subscriber added eventId={} subscriberCount={}", eventId, emitters.size());

        emitter.onCompletion(() -> {
            removeSubscriber(eventId, emitter);
            log.info("SSE subscriber completed eventId={}", eventId);
        });
        emitter.onTimeout(() -> {
            removeSubscriber(eventId, emitter);
            log.info("SSE subscriber timed out eventId={}", eventId);
        });
        emitter.onError(ex -> {
            removeSubscriber(eventId, emitter);
            log.info("SSE subscriber error eventId={} reason={}", eventId, ex.getMessage());
        });

        return emitter;
    }

    private void removeSubscriber(UUID eventId, SseEmitter emitter) {
        var emitters = subscribers.get(eventId);
        if (emitters != null) {
            emitters.remove(emitter);
            if (emitters.isEmpty()) {
                subscribers.remove(eventId, emitters);
            }
        }
    }
}
