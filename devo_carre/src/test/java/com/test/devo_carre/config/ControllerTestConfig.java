package com.test.devo_carre.config;

import com.test.devo_carre.application.port.out.TokenProvider;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;

import static org.mockito.Mockito.mock;

/**
 * Provides beans required by the web layer in controller slice tests
 * (e.g. TokenProvider for JwtAuthFilter when security is active).
 */
@TestConfiguration
@Import(RestExceptionHandler.class)
public class ControllerTestConfig {

    @Bean
    TokenProvider tokenProvider() {
        return mock(TokenProvider.class);
    }
}
