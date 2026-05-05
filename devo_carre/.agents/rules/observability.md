# Observability Rules

If a change fails in production, the team should be able to understand why without guesswork.

## Logging

- Follow the project's logging conventions.
- Log meaningful events and failures, not noisy implementation trivia.
- Include correlation identifiers, request IDs, or trace context if the project supports them.
- Never log passwords, tokens, secrets, or sensitive personal data.
- Log enough context to diagnose the issue without exposing internals recklessly.

## Metrics

- Preserve existing metrics and instrumentation when touching important flows.
- Consider counters, timers, or gauges for high-value operations when the project already instruments such behavior.
- Measure external call latency, retry counts, failure rates, and queue lag where relevant.

## Tracing

- Do not break trace propagation if the project uses distributed tracing.
- For outbound calls, preserve the existing approach to trace and correlation headers.
- Use tracing to reason about cross-service latency and failure propagation.

## Error Diagnosability

- Error responses to clients should stay safe and consistent.
- Internal logs should retain enough detail to diagnose the failure path.
- Prefer structured or machine-parseable logs when the project supports them.

## Auditing

- For security-sensitive or business-sensitive operations, consider whether audit logging is required.
- Keep audit intent distinct from debugging logs.
- Avoid logging entire payloads for sensitive operations unless the project explicitly allows and protects that data.

## Review Questions

- If this endpoint times out, what log or metric would show it?
- If this integration starts failing, how will we know which dependency is responsible?
- If users report inconsistent state, what evidence would we have?
