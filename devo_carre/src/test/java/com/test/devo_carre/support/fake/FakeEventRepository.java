package com.test.devo_carre.support.fake;

import com.test.devo_carre.domain.model.Event;
import com.test.devo_carre.domain.repository.EventRepository;
import com.test.devo_carre.domain.repository.PageResult;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public class FakeEventRepository implements EventRepository {
    private final Map<UUID, Event> events = new LinkedHashMap<>();

    @Override
    public List<Event> findAll() {
        return new ArrayList<>(events.values());
    }

    @Override
    public PageResult<Event> findPage(int page, int size) {
        var all = findAll();
        var from = Math.min(page * size, all.size());
        var to = Math.min(from + size, all.size());
        var content = all.subList(from, to);
        var totalElements = all.size();
        var totalPages = size == 0 ? 0 : (int) Math.ceil((double) totalElements / size);
        var hasNext = page + 1 < totalPages;
        var hasPrevious = page > 0;
        return new PageResult<>(content, page, size, totalElements, totalPages, hasNext, hasPrevious);
    }

    @Override
    public Optional<Event> findById(UUID id) {
        return Optional.ofNullable(events.get(id));
    }

    @Override
    public Event save(Event event) {
        events.put(event.id(), event);
        return event;
    }

    @Override
    public void deleteAll() {
        events.clear();
    }
}
