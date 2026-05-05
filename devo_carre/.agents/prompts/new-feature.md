# Prompt Template: New Feature

Use this workflow when implementing a new backend feature.

## Workflow

1. Inspect the existing module and identify the architectural style in use.
2. Determine whether the feature is primarily a command, a query, or both.
3. Load the relevant rule files before changing code.
4. Design the smallest API and service surface that solves the request.
5. Decide the right persistence/query approach with N+1 and pagination in mind.
6. Implement validation, authorization, error handling, and observability as part of the feature, not later.
7. Add tests with edge cases.
8. Verify using the narrowest meaningful scope first.

## Reminders

- Prefer constructor injection.
- Keep controllers thin.
- Avoid leaking entities into API contracts unless the codebase explicitly does that.
- Paginate long-list endpoints by default.
- Think about retries, idempotency, and transaction scope.
- If external integrations are involved, define timeout and failure behavior.
