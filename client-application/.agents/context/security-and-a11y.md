# Security And Accessibility Context

Frontend code participates in both security posture and accessibility quality.

## Security Rules

- Treat server responses, query params, local storage data, and user input as untrusted.
- Avoid raw HTML injection unless content is sanitized through an approved path.
- Reuse the project’s existing auth, permission, and session handling patterns.
- Do not expose tokens, secrets, or sensitive internal data in logs, URLs, or client-visible error messages.
- Be careful with links opened in new tabs; use safe `rel` attributes when needed.
- Do not assume client-side checks replace backend authorization.

## Common Frontend Risks

- XSS through rich text or injected markup
- Leaking sensitive information in error states
- Unsafe handling of auth state or permission-based UI
- Over-trusting browser storage for sensitive behavior
- Exposing internal admin behavior accidentally through UI affordances

## Accessibility Rules

- Prefer semantic HTML first.
- Every interactive element must be keyboard reachable and operable.
- Every form control needs an accessible label.
- Error states should be announced clearly and tied to the relevant inputs.
- Focus should move predictably after navigation, dialog open/close, and significant async transitions.
- Color alone must not carry essential meaning.
- Respect reduced motion preferences when the UI uses animation.

## Screen Reader And Keyboard Expectations

- Use headings in a meaningful hierarchy.
- Provide accessible names for buttons, links, inputs, dialogs, and landmarks.
- Avoid click-only interactions that do not work from keyboard input.
- Be careful with custom composite widgets; prefer native controls when possible.

## Review Questions

- Can this flow be completed with keyboard only?
- Are labels, descriptions, and errors accessible?
- Does any rendered content risk XSS or unsafe HTML injection?
- Are permission-based UI states safe and non-misleading?
