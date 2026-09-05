package com.test.devo_carre.application.service;

import com.test.devo_carre.security.ResourceNotFoundException;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Component;

/**
 * Records reservation lifecycle counters using bounded tag values only.
 */
@Component
public class ReservationMetrics {

    private final MeterRegistry meterRegistry;

    public ReservationMetrics(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    public void recordAttempt(String operation) {
        counter("devo_carre_reservation_attempts", operation, "attempt").increment();
    }

    public void recordSuccess(String operation) {
        counter("devo_carre_reservation_transitions", operation, "success").increment();
    }

    public void recordFailure(String operation, RuntimeException exception) {
        String reason = switch (exception) {
            case ResourceNotFoundException ignored -> "not_found";
            case IllegalArgumentException ignored -> "invalid_request";
            case IllegalStateException ignored -> "invalid_state";
            default -> "error";
        };
        counter("devo_carre_reservation_failures", operation, reason).increment();
    }

    private Counter counter(String name, String operation, String outcome) {
        return Counter.builder(name)
                .description("Reservation lifecycle operations")
                .tag("operation", operation)
                .tag("outcome", outcome)
                .register(meterRegistry);
    }
}
