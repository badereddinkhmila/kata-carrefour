package com.test.devo_carre.adapter.in.scheduler;

import com.test.devo_carre.application.service.ReservationCommandService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Profile("!cli")
public class ReservationCleanupJob {

    private static final Logger log = LoggerFactory.getLogger(ReservationCleanupJob.class);

    private final ReservationCommandService reservationCommandService;

    public ReservationCleanupJob(ReservationCommandService reservationCommandService) {
        this.reservationCommandService = reservationCommandService;
    }

    @Scheduled(cron = "${app.reservation.cleanup-cron:0 */5 * * * *}")
    public void cleanupExpiredReservations() {
        log.debug("Starting reservation cleanup job");
        var expired = reservationCommandService.expirePendingReservations();
        if (expired > 0) {
            log.info("Expired {} reservations", expired);
            return;
        }
        log.debug("Reservation cleanup completed with no expired reservations");
    }
}
