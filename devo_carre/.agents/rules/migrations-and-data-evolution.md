# Migrations And Data Evolution Rules

Schema and data changes must be safe for real deployments, not just local development.

## General Principles

- Prefer backward-compatible changes first.
- Treat migrations as production code.
- Assume deployments can be rolled forward gradually, not all at once.
- Avoid destructive one-step schema changes unless downtime is explicitly planned.

## Expand-Contract Mindset

Prefer this shape for risky changes:

1. Add new schema elements in a backward-compatible way.
2. Write application code that can handle old and new structures.
3. Backfill data separately if needed.
4. Switch reads and writes intentionally.
5. Remove old schema only after it is proven unused.

## Safe Migration Habits

- Add sensible defaults deliberately rather than accidentally masking data quality issues.
- Be explicit about nullability changes.
- Think about lock duration and table size before altering large tables.
- Add indexes intentionally and note rollout risk if they are expensive.
- Do not combine unrelated schema changes in one migration.

## Data Backfills

- Large backfills should usually be decoupled from startup-time migrations.
- Make backfills resumable where practical.
- Record assumptions about partial completion and reruns.
- Be careful with derived values that may drift if backfill timing matters.

## Compatibility Checks

Before finalizing, ask:

- Can the previous app version coexist safely with this schema?
- Can the next app version read old rows and new rows?
- Will rolling deploys or staggered environments break?
- Does this change require data cleanup or manual ops steps?

## Testing Expectations

- Verify migrations against representative schema state when possible.
- Add tests for repository behavior that depends on new constraints or columns.
- Call out operational steps explicitly if full automation is not realistic.
