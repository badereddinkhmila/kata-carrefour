# Prompt Template: Performance Investigation

Use this workflow when analyzing a slow screen, heavy interaction, or render performance issue.

## Workflow

1. Define the symptom precisely: slow initial load, rerender thrash, long input latency, large bundle impact, or sluggish list rendering.
2. Identify the main boundary involved: route, component tree, data loading, form behavior, list rendering, or asset weight.
3. Gather the narrowest useful evidence first: profiler output, network waterfalls, bundle signals, payload size, or simple reproduction steps.
4. Check render frequency, state duplication, list size, and request shape before introducing new complexity.
5. Prefer fixing data size, rendering boundaries, and loading behavior before adding caches or memoization everywhere.
6. Verify the improvement with a measurable before-and-after comparison when possible.

## Common Causes To Check

- Oversized component rerenders
- Large lists without pagination or virtualization
- Waterfall data loading
- Weak state boundaries causing tree-wide rerenders
- Heavy new dependencies
- Excessive effect-driven work
- Expensive transforms repeated every render

## Deliverable

- Most likely bottleneck identified
- Evidence supporting the conclusion
- Recommended fix or implemented fix
- Tradeoffs and validation steps clearly stated
