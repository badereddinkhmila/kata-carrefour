package com.test.devo_carre.support.fake;

import com.test.devo_carre.application.port.out.ClockPort;

import java.time.Instant;

public class FakeClockPort implements ClockPort {
    private Instant now;

    public FakeClockPort(Instant now) {
        this.now = now;
    }

    public void setNow(Instant now) {
        this.now = now;
    }

    @Override
    public Instant now() {
        return now;
    }
}
