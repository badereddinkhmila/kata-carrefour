# Devo Carre Observability

The repository provides the same local LGTM-style observability stack for the
Nomad VM and the kind Kubernetes cluster. Kubernetes manifests are under
`observability/k8s` and are rendered from `observability/kustomization.yaml`.

## Kubernetes (kind)

```text
Spring Boot -- OTLP --> OpenTelemetry Collector --> Tempo
React -- /collect --> client Nginx --> Alloy Faro receiver --> Loki + Tempo
Kubernetes Pods --> Alloy Kubernetes API log tailing --> Loki
TimescaleDB --> postgres_exporter --> Prometheus
Kubernetes node cAdvisor endpoint + node_exporter + kube-state-metrics --> Prometheus
Prometheus rules --> Alertmanager (local discard receiver)
Grafana --> Prometheus + Loki + Tempo
```

The stack is intentionally local and uses `emptyDir` storage, so deleting a
Pod or the kind cluster clears telemetry data. Prometheus receives the minimum
RBAC permissions required for Kubernetes service discovery and kubelet cAdvisor
metrics; Alloy receives only Pod, Namespace, and Pod-log read permissions.

```bash
make k8s-observability-validate
make k8s-observability-deploy
make k8s-observability-status
make k8s-observability-port-forward
```

Grafana credentials are `admin` / `admin`. The Kubernetes-specific platform
dashboard is `http://localhost:3000/d/devo-carre-kubernetes`.

## Nomad VM

This learning stack is deployed as a separate Nomad job in the Linux VM:

```text
Spring Boot -- OTLP --> OpenTelemetry Collector --> Tempo
Spring Boot -- /actuator/prometheus --> Prometheus
Nomad allocation logs --> Alloy --> Loki
React -- /collect --> Nginx --> Alloy Faro receiver --> Loki + Tempo
TimescaleDB --> postgres_exporter --> Prometheus
VM + Docker --> node_exporter + cAdvisor --> Prometheus
Prometheus rules --> Alertmanager (local discard receiver)
Grafana --> Prometheus + Loki + Tempo
```

The observability services bind to the VM's internal Nomad CNI bridge (`172.26.64.1`), not its external interface. The Spring Boot allocation can send OTLP telemetry to the bridge. macOS accesses UIs only through SSH forwarding.

## Deploy

Deploy observability before redeploying the backend image, so its OTLP exporter has a Collector available:

```bash
make vm-observability-deploy
make vm-monitoring-deploy
make vm-nomad-deploy
# Required once when reusing an existing TimescaleDB data directory.
make vm-timescaledb-enable-statements
make vm-observability-status
```

Open a second terminal and keep the observability forwarding process open:

```bash
make vm-observability-port-forward
```

| Service | Address | Credentials |
| --- | --- | --- |
| Grafana | `http://localhost:3000` | `admin` / `admin` |
| Prometheus | `http://localhost:9090` | none |
| Loki API | `http://localhost:3100` | none |
| Tempo API | `http://localhost:3200` | none |

After starting the SSH forwarding process, open the provisioned dashboard at:

```text
http://localhost:3000/d/devo-carre-overview
```

The overview links to the provisioned `Platform Overview`, `Reservation Flow`,
`TimescaleDB`, `Nomad`, and `Frontend UX` dashboards. The reservation and
frontend dashboards fill after real browser and reservation activity.

Create `observability/nomad/variables.local.hcl` before changing the Grafana password or image versions:

```bash
make vm-observability-deploy \
  OBSERVABILITY_NOMAD_VAR_FILE=/workspace/observability/nomad/variables.local.hcl
```

## Signals

- Spring Boot exposes JVM, HTTP server, HikariCP, and custom Micrometer metrics at `/actuator/prometheus`.
- TimescaleDB starts with `pg_stat_statements` preloaded and exposes database connection, transaction, cache, size, and deadlock metrics through `postgres_exporter`. Query text is not exported.
- `node_exporter` reads the VM's `/proc` and `/sys` through read-only host volumes. A root-owned textfile collector publishes root-disk capacity without exposing the VM root filesystem to a container. cAdvisor reads Docker's socket and cgroup data without privileged mode.
- The backend emits structured JSON logs to stdout. Alloy reads Nomad allocation log files through a read-only host volume and writes them to Loki.
- Micrometer Tracing sends OTLP traces to the Collector, which forwards them to Tempo.
- Prometheus evaluates availability, disk, HTTP error-rate, and p95-latency rules. Alertmanager keeps alerts visible locally and intentionally uses a discard receiver until an email or Slack receiver is configured.
- Grafana provisions Prometheus, Loki, and Tempo data sources automatically.
- Grafana also provisions the `Devo Carre / Application Overview` dashboard. It contains the HTTP golden signals, JVM and HikariCP health, service availability, and recent backend logs. Dashboard JSON is version controlled under `observability/grafana`, copied into read-only Nomad host volumes by VM provisioning, and polled every 30 seconds.
- The React application uses Grafana Faro for browser errors, route changes, Web Vitals, navigation, user actions, API-failure events, and browser traces. The production bundle posts to its own `/collect` path; Nginx forwards it to Alloy on the private Nomad bridge, which writes scrubbed JSON logs to Loki and browser traces to Tempo. The `Devo Carre / Frontend UX` dashboard provides receiver health, intake volume, exceptions, payload size, receiver latency, a Loki event stream, and Tempo trace search.
- Frontend payload controls: browser console capture is disabled, route IDs are normalized to `:id`, remote sourcemap downloads are disabled, no request or response body is captured by custom code, and no session replay is enabled. Do not add e-mail addresses, JWTs, user IDs, reservation IDs, or raw request bodies as Faro event attributes.

Data for Prometheus, Loki, Tempo, and Grafana is stored in host volumes under `/opt/nomad/observability` in the VM. `make vm-observability-stop` and `make vm-nomad-stop-all` retain it; destroying the VM removes it.

## Security Boundary

This is a local learning environment. Grafana credentials and image versions in `variables.hcl` are development defaults. The metrics endpoint is unauthenticated because Prometheus scrapes it through private VM networking. For a production topology, use separate credentials, encrypted transport, restricted network policies, and an authenticated metrics path.
