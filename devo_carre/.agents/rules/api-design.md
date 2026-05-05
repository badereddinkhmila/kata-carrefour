# API Design Rules

## General API Shape

- Follow the project's established API style first.
- Keep routes resource-oriented unless the existing API uses another clear convention.
- Use nouns for resources and avoid action-heavy endpoint naming unless the operation is explicitly command-like.

## Commands Versus Queries

- Query endpoints should read cleanly and avoid side effects.
- Command endpoints should make state changes explicit.
- Consider separate request and response models when write and read concerns differ.

## List Endpoints

- Pagination should be the default for endpoints that can grow large.
- Support filtering and sorting only when there is a real use case.
- Define stable sort behavior.
- Be explicit about defaults and maximum page size.
- Avoid returning huge nested payloads from list endpoints.

## Validation

- Validate request bodies, path variables, and query params.
- Return consistent client-facing validation errors.
- Do not rely only on database errors for user input validation.

## Status Codes

- Use the correct HTTP status for the outcome.
- Be consistent with how the project expresses creation, deletion, validation errors, conflicts, and missing resources.
- Do not overload `200 OK` for every scenario.

## Versioning And Compatibility

- Prefer backward-compatible changes when possible.
- Call out breaking contract changes explicitly.
- If the project versions APIs, follow the established approach rather than inventing a new one.

## Response Design

- Avoid leaking internal entity shape.
- Use DTOs when the project separates transport from persistence.
- Keep error responses consistent.
- Return only the fields needed by clients.

## Operational Concerns

- Consider idempotency for retried create or mutate operations.
- Consider rate or abuse implications for expensive endpoints.
- Be careful with endpoints that trigger long-running work; async patterns may be preferable.
