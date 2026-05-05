# Architecture Context

This document defines the preferred architectural thinking for React frontend work.

## Core Principles

- Organize code so features are easy to find, change, and test.
- Keep UI concerns separate from transport and infrastructure concerns when the project supports that separation.
- Let component boundaries reflect user-facing responsibilities rather than arbitrary file size limits.
- Prefer a structure teammates can navigate quickly over a theoretically perfect one.

## Feature Orientation

When the codebase supports it, prefer grouping by feature or route instead of scattering related behavior across unrelated folders.

Typical concerns to separate cleanly:

- Route or page shell
- Feature-specific components
- Shared UI primitives
- Data hooks or query hooks
- Form logic
- API client or transport glue

## Component Boundaries

- Page or route components should coordinate the screen, not hold every implementation detail.
- Shared UI primitives should be reusable and styling-oriented, not full of page-specific business rules.
- Custom hooks should encapsulate a coherent piece of behavior, not become a hidden second component.
- Utility functions should stay pure where possible.

## State Boundaries

- Local state is the default for local UI behavior.
- URL state is appropriate for shareable filters, search, pagination, tab state, and navigation-driven state.
- Server state should follow the project’s existing query or fetch conventions.
- Global app state should be used intentionally, not as a dumping ground.

## Routing And Navigation

- Follow the framework’s established routing model.
- Keep navigation flows predictable.
- Do not hide important application state in inaccessible component internals when it belongs in route state or URL params.

## Decision Heuristics

When unsure:

- Choose the simpler design that keeps future changes easy.
- Prefer co-location by feature over “shared” abstractions that are only used once.
- Do not invent extra layers unless they improve clarity, testability, or reuse in a real way.
