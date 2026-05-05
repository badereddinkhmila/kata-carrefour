# Frontend Code Review Checklist

Run this checklist mentally before calling a React change done.

## Correctness

- The requested behavior is implemented.
- Loading, empty, error, success, and disabled states were considered.
- The UI matches existing product expectations and patterns.

## Architecture

- The change fits existing component, feature, and state patterns.
- New abstractions are justified.
- State ownership is clear and not duplicated unnecessarily.

## UX And Accessibility

- Keyboard interaction works where relevant.
- Focus behavior is sensible.
- Form controls are labeled and errors are accessible.
- The UI behaves well on relevant screen sizes.

## Data And Performance

- API assumptions are safe.
- Queries, caching, and invalidation behavior make sense.
- Large lists are paginated, incrementally loaded, or virtualized when needed.
- No obvious unnecessary rerender or dependency bloat was introduced.

## Quality

- Tests were added or updated for the changed behavior.
- At least one edge or failure path was considered when relevant.
- Verification steps and any gaps are clearly stated.
