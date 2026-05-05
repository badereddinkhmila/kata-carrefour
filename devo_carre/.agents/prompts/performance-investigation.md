# Prompt Template: Performance Investigation

Use this workflow when analyzing a slow endpoint, heavy query path, or production performance issue.

## Workflow

1. Define the symptom precisely: latency, query count, timeout, memory growth, CPU usage, startup slowness, or lock contention.
2. Identify the main boundary involved: controller, service, repository, serialization, cache, messaging, or external integration.
3. Gather the narrowest useful evidence first: query logs, explain plans, timing, payload size, trace spans, or test reproduction.
4. Check pagination, sorting, fetch strategy, and N+1 before adding complexity.
5. Prefer fixing data access shape or payload design before introducing caches.
6. If the issue is cross-service, inspect timeout, retry, and downstream latency behavior.
7. Verify the improvement with a measurable before-and-after comparison when possible.

## Common Causes To Check

- Unbounded list endpoints
- N+1 queries
- Large serialized payloads
- Remote calls inside transactions
- Missing indexes or inefficient filters
- Retry storms
- Chatty service-to-service calls
- Ineffective caching or stale cache invalidation

## Deliverable

- Most likely bottleneck identified
- Evidence supporting the conclusion
- Recommended fix or implemented fix
- Tradeoffs and validation steps clearly stated
