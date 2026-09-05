# Nomad Local Deployment

This directory deploys the complete application as one Nomad job:

- `timescaledb`: TimescaleDB on PostgreSQL 17, with the `timescaledb` extension enabled during first initialization.
- `backend`: the `devo_carre` Spring Boot API.
- `client`: the `client-application` React build served by Nginx.

The job intentionally uses a Docker network named `devoteam-nomad` instead of Nomad CNI bridge networking, because this local setup runs on macOS. TimescaleDB has the network alias `timescaledb`, so the backend connects directly to `timescaledb:5432`.

| Service | Address |
| --- | --- |
| React frontend | `http://localhost:4200` |
| Spring API | `http://localhost:8080/api/v1` |
| TimescaleDB | `localhost:5432` |

## Prerequisites

- Docker Desktop or Docker Engine is running.
- Nomad is installed and its Docker driver is available.
- The static ports `5432`, `8080`, and `4200` must be available on the host.

## Run

Start a local Nomad agent in one terminal:

```bash
make nomad-agent
```

This command creates the required local TimescaleDB volume directory before Nomad starts.
It defines a loopback host network (`lo0`) so the job can publish services on the `localhost` addresses shown above. Restart the agent after changing this file.

In another terminal, build and deploy the job:

```bash
make nomad-deploy
```

The job binds static local ports, so stop Docker Compose or any port-forward that is already using `5432`, `8080`, or `4200` first.

Inspect its allocations:

```bash
make nomad-status
```

Stop and purge the deployment:

```bash
make nomad-stop
```

## Variables and Data

`variables.hcl` has development-only credentials. Copy it to `variables.local.hcl` for overrides, then deploy with:

```bash
make nomad-deploy NOMAD_VAR_FILE=./nomad/variables.local.hcl
```

The host volume is stored under `/tmp/devo-carre-nomad/timescaledb-data`; deleting that directory removes the local database data.

TimescaleDB's initialization script runs only when this data directory is empty. Existing data remains unchanged on later redeployments.
