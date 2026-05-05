# TypeScript And Clean Code Rules

## TypeScript Discipline

- Prefer explicit, accurate types at boundaries.
- Avoid casual `any`, broad casts, and non-null assertions that hide real uncertainty.
- Use unions, discriminated states, and narrow types when they clarify UI behavior.
- Keep request, response, and form models distinct when they differ meaningfully.

## Naming And Readability

- Use names that describe user-facing intent, not incidental implementation details.
- Keep functions short enough to read in one pass.
- Separate orchestration from detailed logic when it improves clarity.
- Prefer straightforward code over “smart” code.

## Clean Code Principles

- Apply SOLID with judgment.
- Use YAGNI aggressively; do not create abstractions for imagined reuse.
- Keep KISS in mind for rendering logic, hooks, and state flow.
- Remove dead code and outdated branches when the task makes them obsolete.

## Frontend-Specific Smells

- Boolean-flag prop soup
- Giant hooks that mix data loading, form logic, navigation, and side effects
- Components with hidden global assumptions
- Utility files that become vague dumping grounds
- Type definitions that are so generic they stop protecting anything

## Refactoring Triggers

Consider refactoring when you see:

- Repeated loading or error handling patterns that should share a clear abstraction
- Duplicated transformation logic across multiple components
- A component that is hard to test because too many concerns are mixed together
- Weak types at API boundaries causing repeated defensive code
