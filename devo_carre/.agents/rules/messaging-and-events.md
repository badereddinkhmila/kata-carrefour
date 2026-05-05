# Messaging And Events Rules

Use this file when the backend publishes or consumes messages, events, or asynchronous work.

## Event Design

- Name events after business facts, not technical actions.
- Keep event payloads stable and versionable.
- Include enough identifiers and timestamps to make events useful for debugging and downstream consumers.
- Do not leak internal persistence details unnecessarily.

## Publishing Discipline

- Be explicit about when an event is emitted relative to the transaction.
- If exactly-once semantics matter, do not rely on hope; use patterns such as outbox when the project supports them.
- Avoid publishing events for changes that may roll back unless the architecture handles it safely.

## Consumer Safety

- Assume messages can be delivered more than once.
- Make consumers idempotent where practical.
- Treat message payloads as untrusted input.
- Handle poison messages with a deliberate retry and dead-letter strategy.

## Ordering And Replay

- Do not assume perfect ordering unless the platform and topology truly guarantee it for that stream.
- Think about replay behavior before making handlers non-repeatable.
- Be explicit about whether handlers are safe for out-of-order arrival.

## Testing

- Test duplicate delivery behavior when important.
- Test malformed payload handling.
- Test what happens when downstream side effects fail after message receipt.
- Keep messaging tests focused on the critical contract and failure modes.

## When Not To Use Messaging

- Do not add async messaging purely to look architectural.
- Prefer simpler synchronous flows when the domain does not need decoupling, buffering, or eventual consistency.
