package com.test.devo_carre.domain.repository;

import com.test.devo_carre.domain.model.Room;

import java.util.Optional;
import java.util.UUID;

public interface RoomRepository {
    Optional<Room> findById(UUID id);

    Room save(Room room);

    void deleteAll();
}
