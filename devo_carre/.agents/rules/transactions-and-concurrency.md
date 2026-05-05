# Transactions And Concurrency Rules

## Transaction Boundaries

- Keep transactions as small as practical.
- Put transaction boundaries around cohesive state changes, not around entire request lifecycles by habit.
- Use read-only transactions for read paths when appropriate and supported by project conventions.
- Do not make network calls, message broker calls, or expensive remote operations inside long-running database transactions unless there is a deliberate design reason.

## Command Safety

- Treat write operations as potentially retried, duplicated, or concurrent.
- Design commands so their behavior under duplicate submission is explicit.
- For externally retried writes, prefer idempotency strategies where the domain requires it.
- Be careful with "check then act" flows that can race under concurrent requests.

## Locking Guidance

- Prefer optimistic locking when contention exists but collisions should be rare.
- Use pessimistic locking only when there is a clear correctness reason and the performance cost is acceptable.
- If locking is introduced, document why and test the contention scenario.

## Lost Updates And Duplicate Effects

Always think about:

- Two users updating the same record
- The same request being submitted twice
- A retry after timeout where the original request may still succeed
- A message or event being delivered more than once

Mitigation patterns may include:

- Version columns
- Idempotency keys
- Unique constraints
- Compare-and-set style updates
- Domain rules that detect duplicates safely

## Transactional Consistency

- Be explicit about what must succeed atomically and what can be eventually consistent.
- When a write must also publish a message or event, consider outbox-style patterns if the project uses messaging.
- Avoid mixing unrelated writes into the same transaction for convenience.

## Isolation And Read Behavior

- Do not assume the default isolation level protects every business rule.
- If a rule depends on absence, uniqueness, counters, or inventory-like guarantees, reason about concurrent readers and writers explicitly.
- Use database constraints as correctness backstops where possible.

## Test Scenarios

Add concurrency-minded tests or at least design review for:

- Duplicate create requests
- Conflicting updates
- Retry after partial failure
- Rollback behavior when one step fails
- State transitions that must happen exactly once
