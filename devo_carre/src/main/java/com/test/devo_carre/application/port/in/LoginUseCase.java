package com.test.devo_carre.application.port.in;

import com.test.devo_carre.application.dto.AuthResponse;
import com.test.devo_carre.application.dto.LoginCommand;

public interface LoginUseCase {
    AuthResponse login(LoginCommand command);
}
