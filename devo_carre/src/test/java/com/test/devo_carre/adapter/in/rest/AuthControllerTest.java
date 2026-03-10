package com.test.devo_carre.adapter.in.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.test.devo_carre.application.dto.AuthResponse;
import com.test.devo_carre.application.dto.LoginCommand;
import com.test.devo_carre.application.dto.RegisterCommand;
import com.test.devo_carre.application.port.in.LoginUseCase;
import com.test.devo_carre.application.port.in.RefreshTokenUseCase;
import com.test.devo_carre.application.port.in.RegisterUseCase;
import com.test.devo_carre.config.ControllerTestConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.aot.DisabledInAotMode;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = AuthController.class,
        excludeAutoConfiguration = {
                org.springdoc.core.configuration.SpringDocConfiguration.class,
                org.springdoc.webmvc.core.configuration.SpringDocWebMvcConfiguration.class
        }
)
@AutoConfigureMockMvc(addFilters = false)
@Import(ControllerTestConfig.class)
@DisabledInAotMode
class AuthControllerTest {

    @Autowired
    MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    RegisterUseCase registerUseCase;

    @MockitoBean
    LoginUseCase loginUseCase;

    @MockitoBean
    RefreshTokenUseCase refreshTokenUseCase;

    @Test
    void register_returns200() throws Exception {
        var command = new RegisterCommand("user@example.com", "password12");
        var response = new AuthResponse("access", "refresh", "Bearer", 900L, 1209600L);
        when(registerUseCase.register(any(RegisterCommand.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(command)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access"))
                .andExpect(jsonPath("$.tokenType").value("Bearer"));
    }

    @Test
    void login_returns200() throws Exception {
        var command = new LoginCommand("user@example.com", "password");
        var response = new AuthResponse("access", "refresh", "Bearer", 900L, 1209600L);
        when(loginUseCase.login(any(LoginCommand.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(command)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access"));
    }

    @Test
    void register_withInvalidEmail_returns400() throws Exception {
        var command = new RegisterCommand("not-an-email", "password12");

        mockMvc.perform(post("/api/v1/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(command)))
                .andExpect(status().isBadRequest());
    }
}
