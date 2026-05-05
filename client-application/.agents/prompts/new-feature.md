# Prompt Template: New Feature

Use this workflow when implementing a new frontend feature.

## Workflow

1. Inspect the route, feature, and shared patterns already used by the app.
2. Identify the relevant UI states, data dependencies, permissions, and responsive requirements.
3. Load only the relevant rule files before changing code.
4. Implement the smallest correct UI and state flow that fits the app.
5. Handle loading, empty, error, pending, and success behavior explicitly.
6. Add or update tests with at least one edge or failure scenario when relevant.
7. Verify with the narrowest meaningful scope first, then broader checks if needed.

## Reminders

- Reuse existing UI primitives and hooks.
- Keep state ownership clear.
- Avoid unnecessary effects.
- Respect accessibility and keyboard behavior.
- Be honest about backend contract limitations.
