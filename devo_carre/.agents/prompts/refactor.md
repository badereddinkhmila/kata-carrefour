# Prompt Template: Refactor

Use this workflow when refactoring Spring Boot backend code.

## Workflow

1. Understand the current behavior before moving code.
2. Identify whether the problem is architectural, readability-related, performance-related, or testability-related.
3. Preserve behavior unless the task explicitly includes a functional change.
4. Favor small safe moves with tests protecting the outcome.
5. If the refactor touches persistence or transactions, review SQL behavior and side effects.
6. If the refactor touches security or API shape, review compatibility risks.

## Common Refactor Goals

- Replace field injection with constructor injection
- Split fat services into cohesive use cases
- Separate command and query behavior
- Extract domain concepts from generic utility logic
- Replace broad integration tests with narrower focused tests where safe
- Fix N+1 issues with explicit query design

## Safety Checks

- Existing behavior still works
- Tests cover the moved or simplified logic
- Public contracts remain stable unless intentionally changed
- Performance did not regress
