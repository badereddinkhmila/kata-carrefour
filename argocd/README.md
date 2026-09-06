# Argo CD Local Kind Lab

This directory is the GitOps control plane for the local kind cluster. Argo CD
reads the `main` branch of `https://github.com/badereddinkhmila/kata-carrefour.git`
and automatically reconciles four applications:

| Argo CD application | Source | Namespace |
| --- | --- | --- |
| `devo-carre-database` | `k8s-local/postgres.yaml` | `devoteam` |
| `devo-carre-backend` | `devo_carre/charts` | `devoteam` |
| `client-application` | `client-application/charts` | `devoteam` |
| `devo-carre-observability` | `observability` | `devo-carre-observability` |

The backend and client applications have automated sync, prune, and self-heal
enabled. They use immutable `sha-<commit>` GHCR tags, not `latest`. Main-branch
publishes include both `linux/amd64` and `linux/arm64`, so the images work on
standard cloud nodes and Apple-Silicon Kind nodes.

## One-Time GitHub Setup

The workflows use `GITHUB_TOKEN`; no personal access token is required to
publish to GHCR or update the GitOps revision. In the GitHub repository:

1. Open **Settings > Actions > General**.
2. Set **Workflow permissions** to **Read and write permissions**.
3. If `main` is protected, permit GitHub Actions to push the GitOps image-tag
   commit, or replace that commit step with a pull-request workflow later.
4. Push this branch to the `github` remote so the workflow files exist on
   GitHub:

```bash
git push github main
```

The first successful backend and client workflow publishes these packages:

```text
ghcr.io/badereddinkhmila/kata-carrefour-backend
ghcr.io/badereddinkhmila/kata-carrefour-client
```

For the local kind cluster, open each package's **Package settings** in GitHub
and set its visibility to **Public**. A public package lets Kind pull the
images without storing GitHub credentials in the cluster. For a private
package, create `imagePullSecrets` in both deployment namespaces and add the
secret name as Helm values instead.

## Bootstrap

Use a new kind cluster, or first remove the imperative application and
observability deployments. Do not let `make k8s-deploy` and Argo CD manage the
same resources at the same time.

```bash
make kind-gitops-bootstrap
make k8s-argocd-status
```

The bootstrap command installs the pinned Argo CD version, waits for its server
and application controller, then applies the project and application
definitions in this directory. The initial `sha-bootstrap` image references are
intentionally placeholders. A successful GitHub Actions run replaces each one
with the SHA of the image it published. Until then, the backend and client can
show `ImagePullBackOff`.

Open the UI in a terminal that remains running:

```bash
make k8s-argocd-port-forward
```

Open `https://localhost:8081`, accept the local certificate warning, log in as
`admin`, and retrieve the initial password with:

```bash
make k8s-argocd-initial-password
```

## Delivery Flow

1. A pull request affecting `devo_carre` runs Maven verification and validates
   the backend image build. A pull request affecting `client-application` runs
   Bun install, ESLint, Vitest, production build, and validates the client
   image build.
2. A qualifying push to `main` repeats verification, publishes a GHCR image
   tagged with the full commit SHA and `latest`, then commits the SHA tag to the
   corresponding Argo CD Application manifest.
3. Argo CD detects that Git commit and synchronizes the changed Helm release.
   It is the only component that deploys to Kubernetes.

The two workflows use path filters. Root documentation, Nomad, Terraform,
observability-only, and the other application's changes do not trigger the
unrelated application pipeline. Helm-chart-only changes are picked up directly
by Argo CD and do not cause an unnecessary image build.

## Learning Checks

After the UI is open, edit a managed Deployment field directly with `kubectl`.
Argo CD should mark the application `OutOfSync` and restore the Git-defined
state because self-heal is enabled. Use the application history to inspect the
Git commit and rendered resources behind each sync.

To expose the deployed frontend and API after Argo CD reports them healthy:

```bash
make k8s-port-forward
```

To refresh the observability user interfaces:

```bash
make k8s-observability-port-forward
```
