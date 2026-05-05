# Testing Rules

Testing is a core deliverable, not an optional afterthought.

## Testing Priorities

- Test business-critical logic first.
- Cover edge cases and troublesome scenarios, not just the happy path.
- Prefer fast feedback loops.
- Choose the narrowest test scope that meaningfully proves the behavior.

## Test Pyramid Guidance

Prefer:

- Unit tests for business rules and branching logic
- Slice tests for focused framework integration
- Integration tests for important boundaries and cross-layer behavior

Avoid defaulting to full application-context integration tests for every change.

## Spring Test Scope

Choose the smallest useful scope:

- Pure unit tests when no Spring context is needed
- `@WebMvcTest` for controller contract behavior
- `@DataJpaTest` for repository and query behavior
- Focused integration tests only when the interaction between layers matters
- Full `@SpringBootTest` only when a narrower test would miss the important behavior

## Testcontainers

- Prefer Testcontainers for integration tests involving databases, brokers, or other infrastructure dependencies.
- Use the same engine family as production when practical.
- Keep containerized tests targeted; do not spin up heavy infrastructure unless it validates something meaningful.
- Reuse shared setup patterns already present in the project.

## What To Test

Always think about:

- Null or missing values
- Boundary values
- Empty collections and no-result cases
- Duplicate data or uniqueness conflicts
- Invalid state transitions
- Unauthorized or forbidden access
- Partial failures from external systems
- Transaction rollback behavior where relevant
- Pagination and sorting behavior
- N+1-prone query paths if repository behavior changes

## Assertions

- Assert behavior, not incidental implementation details.
- Keep tests readable and intention-revealing.
- Prefer one scenario per test.
- Use expressive test names that describe the rule being verified.

## Integration Test Restraint

- Do not load the whole application context unless it is necessary.
- If a bug can be proven with a repository slice, do not reach for a full boot test.
- If a controller contract can be verified with MVC slice tests, do not force full-stack wiring.

## Minimum Delivery Standard

For meaningful backend changes:

- Add or update tests for the changed behavior.
- Include at least one edge or failure scenario when relevant.
- State clearly what was verified and what remains unverified.
