# dc-client Helm Chart

Helm chart to deploy the `client-application` frontend (Nginx static build).

## Install

```bash
helm install dc-client ./client-application/charts
```

## Install with custom image

```bash
helm install dc-client ./client-application/charts \
  --set image.repository=your-registry/devo-carre-client \
  --set image.tag=latest
```

## Exposed values

Key values are in `values.yaml`:

- `image.*`
- `service.*`
- `ingress.*`
- `resources`
- `autoscaling.*`
