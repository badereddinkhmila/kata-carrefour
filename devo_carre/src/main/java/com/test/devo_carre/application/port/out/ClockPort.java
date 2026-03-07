package com.test.devo_carre.application.port.out;

import java.time.Instant;

public interface ClockPort {
    Instant now();
}
