package com.test.devo_carre.adapter.out.persistence.jpa.adapter;

import com.test.devo_carre.adapter.out.persistence.jpa.entity.RoomEntity;
import com.test.devo_carre.adapter.out.persistence.jpa.repository.SpringDataRoomRepository;
import com.test.devo_carre.domain.model.Room;
import com.test.devo_carre.domain.repository.RoomRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public class JpaRoomRepositoryAdapter implements RoomRepository {

    private final SpringDataRoomRepository repository;

    public JpaRoomRepositoryAdapter(SpringDataRoomRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<Room> findById(UUID id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public Room save(Room room) {
        return toDomain(repository.save(toEntity(room)));
    }

    @Override
    public void deleteAll() {
        repository.deleteAllInBatch();
    }

    private Room toDomain(RoomEntity entity) {
        return new Room(entity.getId(), entity.getName(), entity.getCapacity());
    }

    private RoomEntity toEntity(Room room) {
        var entity = new RoomEntity();
        entity.setId(room.id());
        entity.setName(room.name());
        entity.setCapacity(room.capacity());
        return entity;
    }
}
