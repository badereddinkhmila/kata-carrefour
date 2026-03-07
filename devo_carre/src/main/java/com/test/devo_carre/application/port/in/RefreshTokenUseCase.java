package com.test.devo_carre.application.port.in;

import com.test.devo_carre.application.dto.AuthResponse;
import com.test.devo_carre.application.dto.RefreshTokenCommand;

public interface RefreshTokenUseCase {
    AuthResponse refresh(RefreshTokenCommand command);
}
