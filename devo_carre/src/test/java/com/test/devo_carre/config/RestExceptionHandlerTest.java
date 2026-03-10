package com.test.devo_carre.config;

import com.test.devo_carre.application.dto.RegisterCommand;
import com.test.devo_carre.security.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.core.MethodParameter;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class RestExceptionHandlerTest {

    private final RestExceptionHandler handler = new RestExceptionHandler();

    @Test
    void handleNotFound_returns404WithDetail() {
        var ex = new ResourceNotFoundException("Event not found");

        ProblemDetail detail = handler.handleNotFound(ex);

        assertThat(detail.getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
        assertThat(detail.getDetail()).isEqualTo("Event not found");
    }

    @Test
    void handleValidation_returns400WithErrorsArray() throws NoSuchMethodException {
        var target = new RegisterCommand("invalid-email", "short");
        var bindingResult = new BeanPropertyBindingResult(target, "registerCommand");
        bindingResult.addError(new FieldError("registerCommand", "email", "must be a valid email address"));
        bindingResult.addError(new FieldError("registerCommand", "password", "size must be between 8 and 100"));
        var methodParam = new MethodParameter(
                RestExceptionHandlerTest.class.getDeclaredMethod("dummyMethod", RegisterCommand.class), 0);
        var ex = new MethodArgumentNotValidException(methodParam, bindingResult);

        ProblemDetail detail = handler.handleValidation(ex);

        assertThat(detail.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());
        assertThat(detail.getDetail()).isEqualTo("Validation failed");
        @SuppressWarnings("unchecked")
        List<RestExceptionHandler.FieldError> errors = (List<RestExceptionHandler.FieldError>) detail.getProperties().get("errors");
        assertThat(errors).isNotNull().hasSize(2);
        assertThat(errors).anyMatch(e -> "email".equals(e.field()) && e.message().contains("valid"));
        assertThat(errors).anyMatch(e -> "password".equals(e.field()) && e.message().contains("8"));
    }

    @SuppressWarnings("unused")
    private static void dummyMethod(RegisterCommand cmd) {
    }
}
