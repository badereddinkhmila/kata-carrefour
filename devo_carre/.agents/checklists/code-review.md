# Backend Code Review Checklist

Run this checklist mentally before calling a Spring Boot change done.

## Correctness

- The requested behavior is actually implemented.
- Happy path and edge cases were considered.
- Validation rules match the business intent.
- Error handling follows project conventions.

## Architecture

- Constructor injection is used unless there is a compelling reason otherwise.
- The change fits existing layering and boundaries.
- Command and query concerns are separated where that improves clarity and safety.
- Naming reflects domain language rather than implementation details.

## Persistence And Performance

- List endpoints are paginated when datasets can grow.
- Maximum page size is bounded.
- Sorting is deterministic where pagination or correctness depends on it.
- Query count and fetch behavior were reviewed for N+1 risk.
- Transactions are appropriately scoped.

## Security

- Authorization impact was checked.
- Input validation was added where needed.
- Sensitive data is not leaked in responses or logs.
- Public versus internal exposure remains intentional.

## Resilience And Operations

- Outbound calls have explicit timeout and retry behavior if applicable.
- Partial failure behavior is acceptable.
- Logs and metrics are sufficient to diagnose failure.
- Migrations or configuration changes are safe for deployment.

## Testing

- Tests were added or updated for the changed behavior.
- At least one edge or failure scenario was considered when relevant.
- The smallest useful test scope was chosen first.
- Verification steps and any gaps are clearly stated.
