package com.test.devo_carre.support.fake;

import com.test.devo_carre.domain.model.Seat;
import com.test.devo_carre.domain.repository.SeatRepository;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public class FakeSeatRepository implements SeatRepository {
    private final Map<UUID, Seat> seats = new LinkedHashMap<>();

    @Override
    public List<Seat> findByRoomId(UUID roomId) {
        var result = new ArrayList<Seat>();
        for (var seat : seats.values()) {
            if (seat.roomId().equals(roomId)) {
                result.add(seat);
            }
        }
        return result;
    }

    @Override
    public Optional<Seat> findById(UUID seatId) {
        return Optional.ofNullable(seats.get(seatId));
    }

    @Override
    public Seat save(Seat seat) {
        seats.put(seat.id(), seat);
        return seat;
    }

    @Override
    public void deleteAll() {
        seats.clear();
    }
}
