# Component Design Rules

## Component Shape

- Prefer small, focused, composable components.
- Each component should have a clear responsibility.
- Split a component when it is handling unrelated concerns, not just because it crossed an arbitrary line count.
- Reuse shared UI primitives before creating near-duplicate components.

## Composition

- Prefer composition over giant prop surfaces.
- Avoid boolean prop combinations that create many hidden modes.
- Keep props intention-revealing.
- Pass data in the shape the child actually needs.

## Responsibility Boundaries

- Page components orchestrate screens.
- Feature components implement a meaningful piece of the user experience.
- Shared components stay generic and reusable.
- Hooks can extract stateful behavior, but should not make the data flow harder to understand.

## UI States

Every meaningful component should consider:

- Loading state
- Empty state
- Error state
- Success state
- Disabled or pending interactions where relevant

## Reuse Discipline

- Do not abstract too early.
- If a component is only used once, co-location may be better than inventing a “shared” abstraction.
- When extracting reusable components, preserve clarity for the current screen.

## Smells To Challenge

- God components with dozens of props
- Prop drilling through many levels when the project already has a better pattern
- Components that combine data fetching, layout, form state, and low-level UI details all in one file
- Hooks that silently trigger side effects without clear ownership
