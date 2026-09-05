package com.test.devo_carre.security;

import com.test.devo_carre.config.RequestLoggingFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/** Logs after JWT authentication while authentication and tracing contexts are still active. */
public class SecurityRequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(SecurityRequestLoggingFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            filterChain.doFilter(request, response);
        } finally {
            var authentication = SecurityContextHolder.getContext().getAuthentication();
            var userId = "anonymous";
            if (authentication != null && authentication.getPrincipal() instanceof AuthUserPrincipal principal) {
                userId = principal.userId().toString();
            }

            MDC.put("userId", userId);
            try {
                var startedAt = request.getAttribute(RequestLoggingFilter.REQUEST_STARTED_AT_ATTRIBUTE);
                var durationMs = startedAt instanceof Long start ? (System.nanoTime() - start) / 1_000_000 : -1;
                var requestId = request.getAttribute(RequestLoggingFilter.REQUEST_ID_ATTRIBUTE);
                if (request.getRequestURI().contains("/stream")) {
                    log.debug("Request completed requestId={} method={} path={} status={} durationMs={}",
                            requestId, request.getMethod(), request.getRequestURI(), response.getStatus(), durationMs);
                } else {
                    log.info("Request completed requestId={} method={} path={} status={} durationMs={}",
                            requestId, request.getMethod(), request.getRequestURI(), response.getStatus(), durationMs);
                }
            } finally {
                MDC.remove("userId");
            }
        }
    }
}
