# State Management Rules

## Core Principles

- Keep the smallest possible amount of state.
- Prefer deriving values over duplicating them in state.
- Keep state close to where it is used unless broader sharing is truly needed.
- Separate local UI state, server state, form state, and URL state conceptually.

## Local State

- Use local state for ephemeral UI behavior such as toggles, dialogs, draft input, and small interaction details.
- Do not lift state higher than necessary.

## Global State

- Use global state intentionally for cross-cutting concerns, not by default.
- Reuse the existing store or context patterns if the project already has them.
- Avoid storing server-derived values globally when the query layer already manages them.

## URL State

- Prefer URL params or search params for shareable filters, tabs, sorting, pagination, and route-relevant state.
- Keep URL state stable and predictable.

## Async And Effect Discipline

- Avoid using `useEffect` to mirror props into state unless there is a real need.
- Be careful with async race conditions, stale closures, and double-submission bugs.
- Cancel, ignore, or sequence stale async results using the project’s existing patterns.
- Keep side effects explicit and easy to trace.

## Optimistic And Pending Behavior

- Use optimistic UI only when the project already supports it or the rollback story is clear.
- Disable or guard duplicate submissions when the action should not run twice.
- Show meaningful pending feedback for user-triggered async work.

## Review Questions

- Is any state duplicated unnecessarily?
- Does state live at the right level?
- Could this be URL state instead of hidden component state?
- Is async behavior protected from races and duplicate submits?
