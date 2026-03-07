package com.test.devo_carre.application.port.in;

import com.test.devo_carre.application.dto.AuthResponse;
import com.test.devo_carre.application.dto.RegisterCommand;

public interface RegisterUseCase {
    AuthResponse register(RegisterCommand command);
}
