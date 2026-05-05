# Data Fetching And API Contract Rules

## Data Loading Discipline

- Follow the project’s existing query, loader, or fetch patterns.
- Reuse existing API clients, interceptors, auth helpers, and error mapping.
- Do not scatter ad hoc `fetch` calls across random components if the app already has a better abstraction.

## Contract Safety

- Treat backend contracts as explicit interfaces, not guesses.
- Use TypeScript types or schema validation at the boundaries when the project supports them.
- Be careful with nullable fields, partial responses, enum growth, and pagination metadata.
- If the backend contract looks insufficient, call it out rather than inventing fragile client assumptions.

## Loading States

- Represent loading, success, empty, refetching, and error states clearly.
- Avoid hiding failure behind silent fallbacks unless the product explicitly wants degraded behavior.
- Do not let a background refetch wipe out stable UI unnecessarily.

## Lists And Pagination

- For list UIs that can grow, prefer paginated or incremental loading patterns.
- Keep sorting and filtering behavior explicit.
- Do not fetch the full dataset when the UI only needs one page or viewport slice.
- Be careful with infinite scroll when accessibility or navigation predictability matters.

## Caching And Invalidation

- Reuse the project’s existing caching and invalidation rules.
- Be deliberate about when data should refetch.
- Avoid stale UI after mutations; understand how the existing app syncs updated data.

## Review Questions

- Is the request using the app’s established API layer?
- Are response assumptions safe?
- Is loading behavior clear?
- Is the list bounded, paginated, or virtualized where needed?
