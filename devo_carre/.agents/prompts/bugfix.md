# Prompt Template: Bugfix

Use this workflow when fixing a backend bug.

## Workflow

1. Reproduce the bug or make the failure concrete from logs, tests, or reported behavior.
2. Identify the real failing boundary: API contract, validation, service logic, transaction handling, repository query, integration, serialization, or concurrency.
3. Load only the relevant rule files for that boundary.
4. Write a failing test first when practical, especially for business logic or regression-prone behavior.
5. Fix the root cause, not just the symptom.
6. Check for sibling regressions in nearby code paths.
7. Verify the fix with the narrowest reliable test scope first.

## Questions To Ask

- Is this really a logic bug, or a contract mismatch?
- Could concurrency, retries, or stale reads reproduce it again?
- Could a similar path elsewhere fail for the same reason?
- Is there missing validation, missing pagination, or N+1 hiding behind the bug report?

## Deliverable

- Root cause explained clearly
- Fix implemented cleanly
- Regression coverage added where appropriate
- Residual risk called out if the issue was only partially verifiable
