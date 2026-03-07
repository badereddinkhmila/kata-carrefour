package com.test.devo_carre.application.port.out;

public interface PasswordHasher {
    String hash(String rawPassword);

    boolean matches(String rawPassword, String encodedPassword);
}
