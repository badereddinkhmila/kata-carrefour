package com.test.devo_carre.adapter.out.persistence.jpa.adapter;

import com.test.devo_carre.adapter.out.persistence.jpa.entity.EventEntity;
import com.test.devo_carre.adapter.out.persistence.jpa.repository.SpringDataEventRepository;
import com.test.devo_carre.domain.model.Event;
import com.test.devo_carre.domain.repository.EventRepository;
import com.test.devo_carre.domain.repository.PageResult;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class JpaEventRepositoryAdapter implements EventRepository {

    private final SpringDataEventRepository repository;

    public JpaEventRepositoryAdapter(SpringDataEventRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Event> findAll() {
        return repository.findAll().stream().map(this::toDomain).toList();
    }

    @Override
    public PageResult<Event> findPage(int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "startsAt"));
        var result = repository.findAll(pageable);
        return new PageResult<>(
                result.getContent().stream().map(this::toDomain).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.hasNext(),
                result.hasPrevious()
        );
    }

    @Override
    public Optional<Event> findById(UUID id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public Event save(Event event) {
        return toDomain(repository.save(toEntity(event)));
    }

    @Override
    public void deleteAll() {
        repository.deleteAllInBatch();
    }

    private Event toDomain(EventEntity entity) {
        return new Event(entity.getId(), entity.getName(), entity.getBanner(), entity.getStartsAt(), entity.getRoomId());
    }

    private EventEntity toEntity(Event event) {
        var entity = new EventEntity();
        entity.setId(event.id());
        entity.setName(event.name());
        entity.setBanner(event.banner());
        entity.setStartsAt(event.startsAt());
        entity.setRoomId(event.roomId());
        return entity;
    }
}
