# Testing Rules

Testing is part of frontend delivery, not optional cleanup.

## Testing Priorities

- Test user-visible behavior first.
- Cover edge cases and troublesome async states, not just the happy path.
- Choose the smallest useful test scope that proves the behavior.
- Prefer fast feedback loops.

## Test Scope Guidance

Prefer:

- Unit tests for pure utilities and focused logic
- Component tests for user-facing behavior
- Hook tests when the hook has meaningful standalone behavior
- Integration-style UI tests when multiple pieces must work together
- End-to-end tests for critical journeys when the project already uses them

Avoid defaulting to full end-to-end coverage for every small change.

## Good Frontend Test Habits

- Query the UI the way users experience it when using React Testing Library or similar tools.
- Prefer accessible queries over brittle selectors.
- Assert behavior, not incidental implementation details.
- Avoid snapshot-heavy testing as a substitute for meaningful assertions.

## What To Test

Always think about:

- Loading, empty, error, and success states
- Disabled and pending actions
- Form validation and recovery from failed submission
- Keyboard interaction and focus behavior where relevant
- Permission-based UI branches
- API error handling
- Pagination, filtering, and sorting behavior
- Async races or duplicate user actions where the feature is sensitive to them

## Minimum Delivery Standard

For meaningful frontend changes:

- Add or update tests for the changed behavior.
- Include at least one edge or failure scenario when relevant.
- State clearly what was verified and what remains unverified.
