# Nomad Linux VM

This is the primary Nomad learning environment for this project. Vagrant creates a Linux VM; Ansible installs Docker, Nomad, and the CNI plugins; Nomad then deploys the complete application stack in the VM.

```text
macOS browser -> SSH tunnel -> Linux VM -> Nomad -> frontend + backend + TimescaleDB
```

The macOS host does not run the deployed containers. It only runs Vagrant and accesses the VM through SSH port forwarding.

## Prerequisites

- Vagrant 2.4 or newer.
- An installed Vagrant provider that supports your CPU architecture and the selected Ubuntu box.
- Enough VM capacity for Docker, Nomad, and three containers. Allocate at least 4 GB RAM and 2 CPUs in your provider settings.
- The QEMU disk defaults to 32 GiB, sufficient for the application and local monitoring images. Set `NOMAD_VM_DISK_SIZE=48G` before the first boot if you expect to retain more images or telemetry data.
- Ensure host ports `4200`, `8080`, `5432`, and `4646` are not used by Docker Compose, kind port-forwards, or a native Nomad agent.

The default box is `cloud-image/ubuntu-24.04`, which works with the installed QEMU provider on Apple Silicon. Override it if your provider needs a different box:

```bash
make vm-nomad-up NOMAD_VM_PROVIDER=<provider> NOMAD_VM_BOX=<box>
```

## Deploy

```bash
make vm-nomad-up
make vm-nomad-deploy
make vm-nomad-status
```

`vm-nomad-deploy` synchronizes source files into the VM, builds backend and frontend images inside the VM, then submits the Nomad job with their local image IDs. This avoids relying on host Docker images or a container registry.

Expose the VM services on macOS in a terminal that remains open:

```bash
make vm-nomad-port-forward
```

Open:

| Service | Host address |
| --- | --- |
| Frontend | `http://localhost:4200` |
| Backend API | `http://localhost:8080` |
| TimescaleDB | `localhost:5432` |
| Nomad UI | `http://localhost:4646` |

## Spring CLI

Run a one-shot CLI process inside the running backend allocation. It inherits the deployment database configuration, so it operates on the VM's TimescaleDB without exposing credentials or rebuilding the image:

```bash
# List available Picocli commands.
make vm-nomad-cli

# Seed only when there are no events; use --force to add another demo dataset.
make vm-nomad-cli NOMAD_VM_CLI_COMMAND='seed-data'
make vm-nomad-cli NOMAD_VM_CLI_COMMAND='seed-data --force'

# Destructive: requires the command's explicit safety flag.
make vm-nomad-cli NOMAD_VM_CLI_COMMAND='clean-data --confirm'
```

Set `NOMAD_VM_CLI_PROFILE` if the deployment uses a Spring profile other than `dev`. This is a development and learning workflow. In production, represent repeatable operational actions as separately versioned Nomad batch jobs with least-privilege credentials.

## Operations

```bash
make vm-nomad-sync
make vm-nomad-provision
make vm-nomad-port-forward
make vm-nomad-start
make vm-nomad-halt
make vm-nomad-stop
make vm-nomad-stop-all
make vm-nomad-destroy
```

`vm-nomad-up` creates and provisions the VM when needed. `vm-nomad-start` starts an existing VM, and `vm-nomad-halt` gracefully stops it without deleting its disk or data. Nomad service jobs remain registered across a halt and resume when the VM starts. `vm-nomad-stop` removes only the application job. `vm-nomad-stop-all` removes the application, monitoring, and observability jobs, while retaining the VM and its persistent data. The TimescaleDB data directory is `/opt/nomad/volumes/timescaledb-data` inside the VM. `vm-nomad-destroy` removes the VM and its data.

For local credential overrides, copy `variables.hcl` to `variables.local.hcl`, then run:

```bash
make vm-nomad-deploy NOMAD_VM_VAR_FILE=/workspace/nomad/vm/variables.local.hcl
```
# VM Runtime

The QEMU provider expands the primary disk to `32G` by default. Override it before booting when needed:

```bash
NOMAD_VM_DISK_SIZE=48G make vm-nomad-up
```

The Ansible playbook grows `/dev/vda1` and its ext4 filesystem after the VM starts. This preserves the existing Nomad data and Docker images.
