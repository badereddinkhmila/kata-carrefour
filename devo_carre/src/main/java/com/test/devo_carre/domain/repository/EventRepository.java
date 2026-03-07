package com.test.devo_carre.domain.repository;

import com.test.devo_carre.domain.model.Event;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventRepository {
    List<Event> findAll();

    PageResult<Event> findPage(int page, int size);

    Optional<Event> findById(UUID id);

    Event save(Event event);

    void deleteAll();
}
