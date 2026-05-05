# Forms And Validation Rules

## Form Design

- Keep form state manageable and intention-revealing.
- Reuse the project’s existing form library or pattern.
- Group related fields logically and keep labels, helper text, and errors close to the input.

## Validation

- Client-side validation improves UX, but backend validation remains authoritative.
- Validate required fields, obvious format issues, and cross-field rules when appropriate.
- Surface errors clearly at both field and form level.
- Do not rely on browser defaults alone if the rest of the app uses a richer validation pattern.

## Submission UX

- Disable or guard duplicate submission when appropriate.
- Show pending state during submit.
- Handle success and failure explicitly.
- Preserve user input on recoverable failure unless the product flow clearly expects reset behavior.

## Accessibility

- Every input needs an accessible label.
- Required fields and validation errors should be communicated accessibly.
- Focus should move sensibly to the first relevant error or confirmation point when appropriate.

## Review Questions

- Are validation messages clear and actionable?
- Can the user recover from failure without losing work?
- Are field, form, and async errors handled separately and clearly?
