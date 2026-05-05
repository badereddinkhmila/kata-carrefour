# Architecture Context

This document defines the preferred architectural thinking for Spring Boot backend work.

## Core Principles

- Favor domain clarity over framework convenience.
- Keep business logic isolated from transport and persistence concerns.
- Let code structure communicate intent.
- Prefer modular boundaries that make testing easy and side effects explicit.

## Hexagonal Architecture

When the codebase supports it, align work around:

- Domain: business rules and use cases
- Ports: interfaces that define what the domain needs from external systems
- Adapters: implementations for HTTP, persistence, messaging, files, or third-party services

Guidance:

- Keep framework annotations from leaking deep into pure domain logic when avoidable.
- Controllers, database repositories, messaging listeners, and remote clients are adapter concerns.
- Use application services or use-case handlers to coordinate workflows.
- Domain objects should represent business concepts, not HTTP or database implementation details.

## DDD Guidance

Use Domain-Driven Design when the project already follows it or the domain is complex enough to justify it.

Prefer:

- Ubiquitous language in type and method names
- Aggregates with clear invariants
- Value objects for validated concepts
- Domain services only when behavior does not belong naturally to an entity or value object
- Explicit boundaries between bounded contexts when present

Avoid:

- Anemic models when the domain truly contains business rules
- Giant service classes that centralize unrelated behavior
- Leaking persistence structure directly into domain contracts

## Commands And Queries

Use command and query separation as a design tool, not a ritual.

Commands should:

- Change state
- Be explicit about side effects
- Validate invariants
- Usually return minimal data, identifiers, or status-oriented results

Queries should:

- Not mutate state
- Be optimized for reading needs
- Return read-focused DTOs when useful
- Be allowed to use different query paths or projections from write operations

Use stronger CQRS separation when:

- Read and write models differ significantly
- Read performance requirements are high
- Projections or denormalized views are helpful

Avoid introducing full CQRS complexity unless it solves a real problem.

## Layering Expectations

- Controller or listener layer handles protocol concerns only.
- Application or service layer coordinates the use case.
- Domain layer owns business decisions and invariants.
- Persistence layer handles storage concerns and mapping.
- Infrastructure adapters integrate with external systems.

## Decision Heuristics

When unsure:

- Choose the simpler design that keeps future change easy.
- Do not invent extra layers unless they reduce coupling or improve clarity.
- Prefer a cohesive use-case oriented structure over sprawling utility-driven code.
