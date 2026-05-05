# Domain Glossary

Use this document to keep the agent aligned with the business language of the project.

## Purpose

- Prefer domain language over generic technical naming.
- Reduce accidental ambiguity in classes, methods, DTOs, and events.
- Make DDD guidance concrete instead of theoretical.

## How To Use

- When the project already has strong domain terminology, mirror it exactly.
- When terms are ambiguous, prefer the names used in business rules, tickets, and existing code over improvised developer shorthand.
- If the task introduces a new concept, add a concise definition here in the real project.

## What To Capture

- Core entities and aggregates
- Value objects and identifiers
- State names and allowed transitions
- Domain events and commands
- Forbidden synonyms that blur important distinctions

## Naming Guidance

Prefer:

- `OrderCancellationRequested` over `CancelThing`
- `SettlementWindow` over `TimeConfig`
- `CustomerId` over raw `String`

Avoid:

- Vague names like `Manager`, `Processor`, `Data`, or `Helper`
- Reusing one word for multiple concepts
- Leaking table names or API parameter names into the domain when they do not reflect the business model

## Suggested Real-Project Sections

- Terms
- Invariants
- Lifecycle states
- Cross-context translations
- Ambiguous words to avoid
