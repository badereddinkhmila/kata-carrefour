# Resilience And Integrations Rules

External systems fail, slow down, retry, and return surprises. Design for that reality.

## Timeouts

- Set explicit timeouts for outbound HTTP, messaging, database, or cache calls according to project conventions.
- Do not rely on library defaults without understanding them.
- Distinguish connect, read, and overall call timeout behavior where the client supports it.

## Retries

- Retry only when the failure is plausibly transient.
- Retry only when the operation is safe to repeat or protected by idempotency.
- Avoid hidden framework retries that can duplicate side effects.
- Bound retry count and backoff deliberately.

## Circuit Breakers And Fallbacks

- Use circuit breakers only if the project already adopts them or there is a real need.
- Fallbacks must be honest; do not silently return incorrect data just to avoid an error.
- Degraded behavior should be explicit and safe.

## Contract Discipline

- Treat third-party responses as untrusted input.
- Validate required fields and handle unknown or missing data safely.
- Isolate third-party DTOs from internal domain models when practical.
- Be careful with external enums and status values that may evolve.

## Partial Failures

- Think through what happens if one dependency succeeds and another fails.
- Define whether the operation should fail fast, retry, compensate, or become eventually consistent.
- Avoid pretending a distributed multi-step workflow is atomic when it is not.

## Client Design

- Reuse existing client wrappers, interceptors, and exception mapping patterns.
- Keep integration-specific concerns out of core domain logic where possible.
- Normalize dependency errors into project-consistent exceptions or error flows.

## Reliability Review

- Are timeouts explicit?
- Are retries safe?
- Is degraded behavior acceptable?
- Are failures diagnosable?
- Is duplicate processing possible?
