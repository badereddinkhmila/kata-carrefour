# Prompt Template: Refactor

Use this workflow when refactoring React frontend code.

## Workflow

1. Understand the current behavior before moving code.
2. Identify whether the problem is architectural, readability-related, state-related, performance-related, or testability-related.
3. Preserve behavior unless the task explicitly includes a functional change.
4. Favor small safe moves with tests protecting the outcome.
5. If the refactor changes data flow, hooks, or rendering boundaries, review async and rerender implications.
6. If the refactor changes form or accessibility behavior, review keyboard and focus impact.

## Common Refactor Goals

- Split oversized components into cohesive pieces
- Extract a hook with a clear responsibility
- Replace duplicated UI-state logic with a cleaner shared abstraction
- Strengthen weak TypeScript boundaries
- Remove unnecessary effect-driven state synchronization
- Reduce prop drilling using existing project patterns

## Safety Checks

- Existing behavior still works
- Tests cover the moved or simplified logic
- Accessibility did not regress
- Performance did not regress
