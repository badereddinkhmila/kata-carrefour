# Performance Context

Performance matters when it affects user experience, not only benchmark numbers.

## Default Mindset

- Prefer fixing the biggest bottleneck first.
- Avoid optimizing blindly; use evidence when possible.
- Performance is often about unnecessary work: extra renders, large payloads, heavy lists, or repeated network calls.

## Render Discipline

- Avoid storing derived values in state when they can be computed cheaply.
- Keep state close to where it is used to reduce unnecessary re-renders.
- Split oversized components when a whole subtree rerenders for tiny local updates.
- Avoid effect-driven recalculation when plain render logic is enough.

## Lists And Large Views

- Be careful with large lists, tables, and nested trees.
- Use pagination, infinite loading, or virtualization when datasets can grow large.
- Avoid fetching or rendering the whole dataset when the UI only needs a slice.
- Keep keys stable and meaningful.

## Network And Data Loading

- Avoid unnecessary waterfalls when the app can load data in parallel.
- Reuse existing caching or query mechanisms.
- Be explicit about loading and refetch behavior.
- Debounce or throttle user-driven requests when appropriate, such as search-as-you-type.

## Bundle And Asset Impact

- Be cautious about introducing heavy dependencies for small UI problems.
- Prefer existing components or utility code over new libraries when practical.
- Use lazy loading or route-based splitting when the framework and app already support it.
- Watch image, icon, and asset weight in user-facing flows.

## UX Performance

- A fast-feeling UI often depends on visible progress, stable layout, and predictable interactions.
- Avoid layout shift when data arrives.
- Keep pending states clear.
- Use optimistic updates only when the project already supports them and rollback behavior is understood.

## Review Questions

- Is this screen doing more work than necessary?
- Is the list size bounded?
- Is a dependency too heavy for the value it adds?
- Is the loading behavior clear and smooth for the user?
