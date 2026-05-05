# Prompt Template: Bugfix

Use this workflow when fixing a frontend bug.

## Workflow

1. Reproduce the bug or make the failure concrete from tests, screenshots, logs, or reported behavior.
2. Identify the true failing boundary: rendering logic, state flow, form handling, API contract, routing, accessibility, or async behavior.
3. Load only the relevant rule files for that boundary.
4. Write a failing test first when practical, especially for regression-prone UI logic.
5. Fix the root cause, not just the visible symptom.
6. Check nearby flows for sibling regressions.
7. Verify with the narrowest reliable scope first.

## Questions To Ask

- Is this really a rendering bug, or a state ownership problem?
- Could async races or duplicate actions reproduce it again?
- Is the bug actually an API contract mismatch or nullability assumption?
- Did accessibility or keyboard behavior break even if the mouse path looks fine?

## Deliverable

- Root cause explained clearly
- Fix implemented cleanly
- Regression coverage added where appropriate
- Residual risk called out if the issue was only partially verifiable
