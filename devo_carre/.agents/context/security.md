# Security Context

Every backend change should be reviewed through a security lens.

## Baseline Rules

- Deny by default; do not assume an endpoint should be public.
- Validate all external input.
- Sanitize error exposure.
- Keep secrets out of code, logs, and responses.
- Prefer secure framework defaults over custom security code.

## Spring Security Guidance

- Reuse the project's established authentication and authorization model.
- Check method-level and endpoint-level access control when adding or changing functionality.
- Protect sensitive actions with least privilege.
- Be explicit about anonymous access.
- If security configuration changes, review downstream effects carefully.

## Input And Data Handling

- Validate request payloads with bean validation or the project standard.
- Treat query parameters, headers, uploaded files, and path variables as untrusted.
- Enforce size limits where relevant.
- Be careful with deserialization of polymorphic or complex objects.

## Common Risks To Check

- Broken access control
- Insecure direct object references
- Mass assignment or unsafe entity binding
- Sensitive information in logs
- Missing validation
- Unsafe file handling
- Injection risks in custom queries or dynamic filtering
- Insecure defaults in actuator, CORS, or error pages

## Passwords, Secrets, Tokens

- Never hardcode secrets.
- Never log tokens or credentials.
- Prefer secret managers or environment-backed configuration.
- Ensure token or session handling matches the project's security model.

## Error Handling

- Return consistent error responses without leaking implementation details.
- Avoid exposing stack traces in production responses.
- Distinguish client input errors from server failures.

## Operational Security

- Review actuator exposure.
- Check headers, CORS, CSRF expectations, and TLS assumptions according to the app type.
- If a new integration is added, review timeout, retry, and credential behavior.
