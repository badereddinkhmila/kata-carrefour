# Caching Rules

Caching is optional optimization, not default architecture.

## Default Stance

- Do not add caching unless there is a measured or strongly justified need.
- Correctness comes before speed.
- Prefer fixing query shape, pagination, or payload size before reaching for cache layers.

## When Caching Helps

- Expensive read paths with repeated access patterns
- Stable reference data
- Computed results with clear invalidation rules

## Cache Design

- Define cache keys explicitly.
- Define TTL intentionally.
- Be clear whether entries are per-user, per-tenant, per-locale, or global.
- Avoid caching data whose authorization visibility is user-specific unless the key fully captures that boundary.

## Invalidation

- Never add a cache without a credible invalidation story.
- Be careful with write-after-read inconsistencies.
- Consider whether stale data is acceptable and for how long.
- Remember that cache invalidation complexity can outweigh the benefit.

## Failure Modes

- The system must remain correct if the cache is empty, stale, or unavailable.
- Avoid cache stampede patterns for hot keys when the project already has mitigation tools.
- Do not let cache behavior hide underlying correctness or data freshness bugs.

## Review Questions

- Is caching actually needed?
- Is stale data acceptable?
- How is invalidation handled?
- Does the cache key cross tenant or user boundaries safely?
