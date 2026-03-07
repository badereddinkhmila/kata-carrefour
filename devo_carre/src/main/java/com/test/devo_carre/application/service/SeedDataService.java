package com.test.devo_carre.application.service;

import com.test.devo_carre.domain.model.Event;
import com.test.devo_carre.domain.model.Room;
import com.test.devo_carre.domain.model.Seat;
import com.test.devo_carre.domain.repository.EventRepository;
import com.test.devo_carre.domain.repository.RoomRepository;
import com.test.devo_carre.domain.repository.SeatRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class SeedDataService {

    private final EventRepository eventRepository;
    private final RoomRepository roomRepository;
    private final SeatRepository seatRepository;

    public SeedDataService(EventRepository eventRepository,
                           RoomRepository roomRepository,
                           SeatRepository seatRepository) {
        this.eventRepository = eventRepository;
        this.roomRepository = roomRepository;
        this.seatRepository = seatRepository;
    }

    @Transactional
    public void seedDemoData(boolean force) {
        if (!force && !eventRepository.findAll().isEmpty()) {
            return;
        }

        var rooms = seedRoomsAndSeats();
        seedEvents(rooms);
    }

    private List<Room> seedRoomsAndSeats() {
        var roomCapacities = new int[]{48, 52, 56, 60, 64, 68, 72, 76, 80, 84};
        var rooms = new ArrayList<Room>(roomCapacities.length);

        for (int i = 0; i < roomCapacities.length; i++) {
            var room = roomRepository.save(new Room(null, "Room " + (i + 1), roomCapacities[i]));
            seedSeats(room.id(), "R" + (i + 1) + "-", room.capacity());
            rooms.add(room);
        }

        return rooms;
    }

    private void seedEvents(List<Room> rooms) {
        var now = Instant.now();
        var eventBanners = new String[]{
                "https://images.unsplash.com/photo-1733222765056-b0790217baa9?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://images.unsplash.com/photo-1747674148491-51f8a5c723db?q=80&w=2332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://images.unsplash.com/photo-1764874299006-bf4266427ec9?q=80&w=1365&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://media.istockphoto.com/id/1488251353/photo/panel-discussion-in-conference-room.jpg?s=2048x2048&w=is&k=20&c=eWLJVBDq1pFVZMnIQzNcNbX7GOHkBiYQ8_bvEDo76SM=",
                "https://media.istockphoto.com/id/1382269860/photo/casually-clothed-presenter-giving-a-presentation-in-a-conference-room-full-of-people.jpg?s=2048x2048&w=is&k=20&c=PTWGr3UgWlh_L_8tZEJ62V4VhM3xvhe6AqGrEs-8GoM=",
                "https://media.istockphoto.com/id/2160107211/photo/asian-and-african-american-business-people-having-speach-on-a-press-conference-in-a.jpg?s=2048x2048&w=is&k=20&c=oEo0zSl4Xq0lBDFB8_7UL8NKdyf0PV5TJGItUq7kmBc=",
                "https://plus.unsplash.com/premium_photo-1705267936187-aceda1a6c1a6?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://plus.unsplash.com/premium_photo-1706546717624-b7b4aa9394c4?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://media.istockphoto.com/id/1857041893/photo/happy-public-speaker-talking-on-a-conference-at-convention-center.jpg?s=2048x2048&w=is&k=20&c=UVZ35hKynW3DUEGb8Hkt1v1QxY4iQryX7h54VaDEkSU=",
                "https://media.istockphoto.com/id/1385168482/photo/female-conference-speaker-giving-presentation-in-a-conference-on-the-topic-women-in-tech.jpg?s=2048x2048&w=is&k=20&c=_OHrQG4KgwzQmEWgo37nNukkT2y6n6V9YjM1Omtnl7o="
        };

        for (int i = 0; i < 30; i++) {
            var room = rooms.get(i % rooms.size());
            eventRepository.save(new Event(
                    null,
                    "Event " + (i + 1),
                    eventBanners[i%10],
                    now.plus(i*3 + 1L, ChronoUnit.DAYS),
                    room.id()
            ));
        }
    }

    private void seedSeats(UUID roomId, String prefix, int capacity) {
        for (int i = 1; i <= capacity; i++) {
            seatRepository.save(new Seat(null, roomId, prefix + i, null));
        }
    }
}
