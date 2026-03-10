package com.test.devo_carre.config;

import com.test.devo_carre.security.AuthUserPrincipal;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.context.annotation.Profile;
import org.springframework.core.Ordered;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
@Profile("!cli")
public class RequestLoggingFilter extends OncePerRequestFilter implements Ordered {

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);
    private static final String REQUEST_ID_HEADER = "X-Request-Id";
    private static final String REQUEST_ID_MDC_KEY = "requestId";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        var requestId = resolveRequestId(request);
        var startedAt = System.nanoTime();
        MDC.put(REQUEST_ID_MDC_KEY, requestId);
        response.setHeader(REQUEST_ID_HEADER, requestId);

        try {
            filterChain.doFilter(request, response);
        } finally {
            var durationMs = (System.nanoTime() - startedAt) / 1_000_000;
            var auth = SecurityContextHolder.getContext().getAuthentication();
            var userId = "anonymous";
            if (auth != null && auth.getPrincipal() instanceof AuthUserPrincipal principal) {
                userId = principal.userId().toString();
            }

            if (request.getRequestURI().contains("/stream")) {
                log.debug("Request completed requestId={} method={} path={} status={} durationMs={} userId={}",
                        requestId, request.getMethod(), request.getRequestURI(), response.getStatus(), durationMs, userId);
            } else {
                log.info("Request completed requestId={} method={} path={} status={} durationMs={} userId={}",
                        requestId, request.getMethod(), request.getRequestURI(), response.getStatus(), durationMs, userId);
            }
            MDC.remove(REQUEST_ID_MDC_KEY);
        }
    }

    private String resolveRequestId(HttpServletRequest request) {
        var incoming = request.getHeader(REQUEST_ID_HEADER);
        if (incoming != null && !incoming.isBlank()) {
            return incoming;
        }
        return UUID.randomUUID().toString();
    }
}
