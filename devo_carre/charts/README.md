# dc-backend Helm Chart

Helm chart to deploy the `devo_carre` Spring Boot backend.

## Install

```bash
helm install dc-backend ./devo_carre/charts
```

## Install with custom image

```bash
helm install dc-backend ./devo_carre/charts \
  --set image.repository=your-registry/devo-carre-backend \
  --set image.tag=latest
```

## Configure DB credentials from an existing Secret

```bash
helm install dc-backend ./devo_carre/charts \
  --set backend.database.existingSecret=backend-db-secret \
  --set backend.database.existingSecretKey=password
```

## Exposed values

Key values are in `values.yaml`:

- `image.*`
- `service.*`
- `ingress.*`
- `backend.springProfile`
- `backend.database.*`
- `seed.*` (one-shot DB seed Helm hook job)
- `resources`
- `autoscaling.*`

## Seeding

Run the one-shot seed job on install/upgrade:

```bash
helm upgrade --install dc-backend ./devo_carre/charts \
  --set seed.enabled=true \
  --set seed.hook=post-upgrade \
  --set-string seed.runId=$(date +%s)
```
