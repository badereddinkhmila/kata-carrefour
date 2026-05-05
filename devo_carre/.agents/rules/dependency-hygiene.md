# Dependency Hygiene Rules

## Selection Principles

- Prefer existing project dependencies and framework-native capabilities before adding new libraries.
- Add a dependency only when it materially improves correctness, maintainability, or delivery speed.
- Avoid overlapping libraries that solve the same problem in different ways.

## Spring Boot-Specific Guidance

- Prefer Spring Boot starters only when their transitive footprint is appropriate.
- Reuse the project's BOM and dependency management approach.
- Align versions with the existing platform rather than pinning ad hoc versions casually.

## Risk Review

- Consider security posture and known CVE exposure of new dependencies.
- Avoid libraries with weak maintenance or unclear licensing.
- Be cautious with dependencies that use deep reflection, bytecode tricks, or heavy transitive trees without strong payoff.

## Scope Discipline

- Keep test-only libraries out of runtime scope.
- Remove no-longer-needed dependencies when refactors make them obsolete.
- Avoid helper libraries that hide simple logic the team can express clearly itself.

## Operational Impact

- Be aware that new dependencies can affect startup time, memory usage, classpath conflicts, and native-image compatibility if relevant.
- Call out noteworthy operational tradeoffs when adding non-trivial libraries.

## Review Questions

- Can the platform already do this?
- Is this dependency truly necessary?
- What transitive baggage does it bring?
- Who will maintain and upgrade it?
