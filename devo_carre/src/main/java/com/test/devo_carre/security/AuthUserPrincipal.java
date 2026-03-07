package com.test.devo_carre.security;

import java.util.UUID;

public record AuthUserPrincipal(UUID userId, String email) {
}
