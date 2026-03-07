package com.test.devo_carre.adapter.out.persistence.jpa.adapter;

import com.test.devo_carre.adapter.out.persistence.jpa.entity.SeatEntity;
import com.test.devo_carre.adapter.out.persistence.jpa.repository.SpringDataSeatRepository;
import com.test.devo_carre.domain.model.Seat;
import com.test.devo_carre.domain.repository.SeatRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class JpaSeatRepositoryAdapter implements SeatRepository {

    private final SpringDataSeatRepository repository;

    public JpaSeatRepositoryAdapter(SpringDataSeatRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Seat> findByRoomId(UUID roomId) {
        return repository.findByRoomId(roomId).stream().map(this::toDomain).toList();
    }

    @Override
    public Optional<Seat> findById(UUID seatId) {
        return repository.findById(seatId).map(this::toDomain);
    }

    @Override
    public Seat save(Seat seat) {
        return toDomain(repository.saveAndFlush(toEntity(seat)));
    }

    @Override
    public void deleteAll() {
        repository.deleteAllInBatch();
    }

    private Seat toDomain(SeatEntity entity) {
        return new Seat(entity.getId(), entity.getRoomId(), entity.getSeatNumber(), entity.getVersion());
    }

    private SeatEntity toEntity(Seat seat) {
        var entity = new SeatEntity();
        entity.setId(seat.id());
        entity.setRoomId(seat.roomId());
        entity.setSeatNumber(seat.seatNumber());
        entity.setVersion(seat.version());
        return entity;
    }
}
