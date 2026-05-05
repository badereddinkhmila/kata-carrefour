# Dependency Injection And Clean Code Rules

## Dependency Injection

- Prefer constructor injection by default.
- Avoid field injection.
- Avoid setter injection except for rare framework-driven optional wiring cases.
- Prefer immutable dependencies with `final` fields.
- Keep constructor parameter counts reasonable; a very long constructor often signals a class doing too much.

## Clean Code

- Use intention-revealing names.
- Keep methods short enough to read in one pass.
- Separate orchestration from detailed logic when that improves clarity.
- Prefer explicit code over magic.
- Remove dead code and avoid speculative abstractions.
- Centralize duplicated business rules only when the duplication is real and stable.

## SOLID

- Single Responsibility: classes and methods should have one clear reason to change.
- Open/Closed: extend behavior carefully without forcing fragile conditionals everywhere.
- Liskov: subtype behavior must preserve contract expectations.
- Interface Segregation: keep ports and service interfaces focused.
- Dependency Inversion: depend on abstractions at boundaries where it helps decouple the domain from infrastructure.

Apply SOLID with judgment; do not create interface noise with zero benefit.

## YAGNI

- Do not build future features no one requested.
- Avoid configurable complexity until there is a real use case.
- Prefer the smallest design that solves the current problem cleanly.

## KISS

- Favor straightforward control flow.
- Avoid overly clever generics, reflection, or indirection.
- Prefer a simple design that teammates can debug quickly.

## Code Smells To Challenge

- Fat controllers
- God services
- Repository methods encoding too much business logic
- Utility classes that accumulate unrelated behavior
- Boolean flags that make methods behave in multiple modes
- Massive DTO mappers that hide unclear domain boundaries

## Refactoring Triggers

Consider refactoring when you see:

- A class with too many collaborators
- Repeated validation logic
- Transaction rules scattered across layers
- Mixed command and query concerns in one workflow
- Naming that reflects implementation details instead of business meaning
