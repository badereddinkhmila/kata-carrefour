# Production Checklist

Use this checklist before considering a backend change production-trustworthy.

## Reliability

- Timeouts are explicit for external calls.
- Retries are intentional and safe.
- Idempotency is considered for write operations that may be retried.
- Failure paths are handled predictably.
- Startup and shutdown behavior remain healthy.

## Observability

- Logs are structured or at least consistent with project conventions.
- Important events and failures are logged at the right level.
- Sensitive data is not logged.
- Metrics or tracing hooks are preserved where relevant.
- New flows are diagnosable in production.

## Performance

- Query count is reasonable.
- Expensive endpoints are paginated, filtered, or bounded.
- Serialization cost is understood for large responses.
- Large transactions are avoided unless required.
- Caching is considered only when it truly helps and invalidation is understood.

## Data Safety

- Schema changes are backward-compatible or clearly called out.
- Migrations are deterministic and safe.
- Nullability and defaults are handled intentionally.
- Data cleanup or backfill needs are identified when relevant.

## API Stability

- Error response behavior is consistent.
- Contract changes are documented and surfaced.
- Pagination and filtering behavior is explicit.
- Versioning impact is considered if public APIs are affected.

## Security

- Authorization was reviewed.
- Input validation was added where needed.
- Secrets and internal details stay protected.
- Operational endpoints are not accidentally exposed.

## Testing

- Unit tests cover core business logic.
- Integration tests cover important boundaries.
- Edge cases and known troublesome scenarios are exercised.
- The narrowest useful test scope was chosen first.

## Final Review

Ask before finishing:

- Would I trust this under production load?
- Would I understand failures from logs and metrics?
- Would this behave safely with malformed input or partial outages?
- Does the change still make sense six months from now?
