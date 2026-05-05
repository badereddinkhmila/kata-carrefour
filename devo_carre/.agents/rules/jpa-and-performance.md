# JPA And Performance Rules

## Query Discipline

- Always think about what SQL will actually run.
- Do not trust ORM defaults blindly.
- Review fetching behavior when returning collections or traversing relationships.

## N+1 Prevention

Always inspect for N+1 risk when:

- Mapping entities to DTOs
- Iterating relationships in service code
- Returning nested data from controllers
- Accessing lazy associations outside carefully designed query flows

Common mitigation options:

- Fetch joins where appropriate
- Entity graphs
- Batch fetching if already configured
- Projection queries
- Dedicated read models or DTO queries

Do not over-fetch entire object graphs just to suppress N+1.

## Pagination

- For endpoints that can return long lists of records, pagination is the default.
- Use explicit page, size, and sort behavior according to project conventions.
- Enforce sensible upper bounds on page size.
- Do not expose unbounded queries for administrative convenience unless the dataset is known to be tiny and stable.
- If the API must support export behavior, make it explicit and separate from normal list endpoints.

## Transactions

- Keep transactions as small as practical.
- Use read-only transactions for read paths when appropriate and consistent with the project.
- Do not perform remote calls inside long-running database transactions unless absolutely required.
- Be mindful of lazy loading after transaction boundaries.

## Entity Design

- Avoid exposing JPA entities directly as API payloads when DTOs are the project norm.
- Be careful with `equals`, `hashCode`, and bidirectional associations.
- Keep entity behavior coherent with the domain model.
- Avoid stuffing unrelated business logic into entities just because they are available.

## Repository Guidance

- Reuse existing repository patterns.
- Prefer focused query methods over giant generic repository helpers.
- Use specifications or criteria APIs only when complexity genuinely demands them.
- For complex reads, consider dedicated query repositories or projections.

## Performance Review Checklist

Before finalizing:

- Are list endpoints paginated?
- Is query count acceptable?
- Is there any accidental eager loading?
- Is response size reasonable?
- Is sorting deterministic where it matters?
- Are indexes or migration implications worth flagging?
