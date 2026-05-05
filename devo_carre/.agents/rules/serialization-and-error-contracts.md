# Serialization And Error Contract Rules

## DTO Discipline

- Prefer explicit request and response DTOs over exposing entities directly.
- Keep transport contracts stable and intentional.
- Return only the fields clients need.
- Do not let persistence shape accidentally define public API shape.

## Time Handling

- Prefer UTC internally.
- Be explicit about timezone assumptions at API boundaries and integrations.
- Use well-defined temporal types according to project conventions.
- Avoid ambiguous local date-time semantics for cross-system data unless the domain explicitly requires them.

## Enum And Schema Evolution

- Do not serialize JPA ordinal enums.
- Be careful when adding enum values that older clients or consumers may not understand.
- Consider unknown-field tolerance and backward compatibility when changing contracts.

## Jackson And Mapping Safety

- Reuse project-wide object mapper configuration rather than ad hoc serializers unless necessary.
- Be careful with bidirectional relationships and lazy-loaded properties in serialization.
- Do not expose internal stack traces, class names, or persistence details in API payloads.

## Error Contracts

- Keep error payloads consistent across endpoints.
- Distinguish validation failures, business conflicts, missing resources, unauthorized access, and server errors.
- Provide client-useful messages without leaking sensitive implementation details.
- Include machine-readable fields when the project standard supports them.

## Pagination And Sorting Contracts

- Be explicit about pagination fields and defaults.
- Enforce a maximum page size.
- Ensure paginated results use deterministic sorting when correctness matters.

## Compatibility Questions

- Will old clients still parse this response?
- Will unknown fields or new enum values break consumers?
- Are nullability changes or renamed fields being introduced silently?
