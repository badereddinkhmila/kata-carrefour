package com.test.devo_carre.application.service;

import com.test.devo_carre.application.port.out.RefreshTokenStore;
import com.test.devo_carre.domain.repository.EventRepository;
import com.test.devo_carre.domain.repository.ReservationRepository;
import com.test.devo_carre.domain.repository.RoomRepository;
import com.test.devo_carre.domain.repository.SeatRepository;
import com.test.devo_carre.domain.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CleanDataService {

    private final ReservationRepository reservationRepository;
    private final SeatRepository seatRepository;
    private final EventRepository eventRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final RefreshTokenStore refreshTokenStore;

    public CleanDataService(ReservationRepository reservationRepository,
                            SeatRepository seatRepository,
                            EventRepository eventRepository,
                            RoomRepository roomRepository,
                            UserRepository userRepository,
                            RefreshTokenStore refreshTokenStore) {
        this.reservationRepository = reservationRepository;
        this.seatRepository = seatRepository;
        this.eventRepository = eventRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.refreshTokenStore = refreshTokenStore;
    }

    @Transactional
    public void cleanAllData() {
        reservationRepository.deleteAll();
        seatRepository.deleteAll();
        eventRepository.deleteAll();
        roomRepository.deleteAll();
        refreshTokenStore.deleteAll();
        userRepository.deleteAll();
    }
}
