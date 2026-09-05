SHELL := /bin/sh
MVNW := ./mvnw
JAR := target/devo_carre-0.0.1-SNAPSHOT.jar
BACKEND_IMAGE ?= devo-carre-backend:latest
CLIENT_IMAGE ?= devo-carre-client:latest
BACKEND_BUILD_IMAGE ?= eclipse-temurin:25-jdk-alpine
BACKEND_RUNTIME_IMAGE ?= eclipse-temurin:25-jre-alpine
HELM_DIST ?= dist/charts
HELM_OCI_REPO ?=
KIND_CLUSTER_NAME ?= devoteam-local
K8S_NAMESPACE ?= devoteam
K8S_OBSERVABILITY_NAMESPACE ?= devo-carre-observability
ARGOCD_NAMESPACE := argocd
ARGOCD_VERSION ?= v3.4.2
ARGOCD_INSTALL_MANIFEST ?= https://raw.githubusercontent.com/argoproj/argo-cd/$(ARGOCD_VERSION)/manifests/install.yaml
POSTGRES_PORT ?= 5432
BACKEND_PORT ?= 8080
CLIENT_PORT ?= 4200
NOMAD_ADDR ?= http://127.0.0.1:4646
NOMAD_VAR_FILE ?= ./nomad/variables.hcl
NOMAD_DOCKER_NETWORK ?= devoteam-nomad
NOMAD_VM_DIR ?= nomad/vm
NOMAD_VM_BOX ?= cloud-image/ubuntu-24.04
NOMAD_VM_PROVIDER ?= qemu
NOMAD_VM_VAR_FILE ?= /workspace/nomad/vm/variables.hcl
NOMAD_VM_CLI_PROFILE ?= dev
NOMAD_VM_CLI_COMMAND ?= --help
NOMAD_VM_PROVIDER_ARG = $(if $(NOMAD_VM_PROVIDER),--provider=$(NOMAD_VM_PROVIDER),)
OBSERVABILITY_NOMAD_DIR ?= observability/nomad
OBSERVABILITY_NOMAD_VAR_FILE ?= /workspace/observability/nomad/variables.hcl
MONITORING_NOMAD_VAR_FILE ?= /workspace/observability/nomad/monitoring.variables.hcl
BACKEND_REPOSITORY := $(firstword $(subst :, ,$(BACKEND_IMAGE)))
BACKEND_TAG := $(word 2,$(subst :, ,$(BACKEND_IMAGE)))
CLIENT_REPOSITORY := $(firstword $(subst :, ,$(CLIENT_IMAGE)))
CLIENT_TAG := $(word 2,$(subst :, ,$(CLIENT_IMAGE)))

PROFILE ?= dev

.PHONY: up wait-db package seed clean run-dev run frontend backend-image client-image bootstrap-images help \
	helm-package helm-push kind-create kind-delete kind-load-images k8s-ensure-schedulable k8s-postgres-apply k8s-postgres-wait \
	k8s-deploy k8s-seed k8s-undeploy kind-bootstrap kind-status k8s-port-forward \
	k8s-observability-validate k8s-observability-deploy k8s-observability-status k8s-observability-port-forward k8s-observability-undeploy \
	k8s-argocd-install k8s-argocd-bootstrap k8s-argocd-status k8s-argocd-port-forward k8s-argocd-initial-password kind-gitops-bootstrap \
	nomad-network nomad-agent nomad-validate nomad-images nomad-deploy nomad-status nomad-stop \
	vm-nomad-up vm-nomad-start vm-nomad-halt vm-nomad-sync vm-nomad-provision vm-nomad-images vm-nomad-deploy vm-nomad-status vm-nomad-cli vm-nomad-port-forward vm-nomad-stop vm-nomad-stop-all vm-nomad-destroy \
	vm-timescaledb-enable-statements \
	vm-observability-validate vm-observability-deploy vm-observability-status vm-observability-port-forward vm-observability-stop \
	vm-monitoring-validate vm-monitoring-deploy vm-monitoring-status vm-monitoring-stop

help:
	@echo "Available targets:"
	@echo "  make up                  - start required docker containers (PostgreSQL)"
	@echo "  make seed PROFILE=dev    - seed database data via CLI"
	@echo "  make clean PROFILE=dev   - clean all database tables data via CLI"
	@echo "  make run-dev PROFILE=dev - start Spring Boot application locally"
	@echo "  make frontend            - start React client locally"
	@echo "  make bootstrap-images    - start postgres, build backend image, clean+seed DB, build client image"
	@echo "  make backend-image BACKEND_BUILD_IMAGE=registry/image BACKEND_RUNTIME_IMAGE=registry/image - build backend with custom base images"
	@echo "  make run PROFILE=dev     - bootstrap and start docker stack (postgres + backend + client)"
	@echo "  make helm-package        - package backend and client Helm charts into $(HELM_DIST)"
	@echo "  make helm-push HELM_OCI_REPO=oci://registry/repo - push packaged charts to OCI registry"
	@echo "  make kind-create         - create local kind cluster ($(KIND_CLUSTER_NAME))"
	@echo "  make kind-delete         - delete local kind cluster ($(KIND_CLUSTER_NAME))"
	@echo "  make kind-load-images    - load backend/client Docker images into kind"
	@echo "  make kind-bootstrap      - create cluster, load images, deploy postgres + backend + client charts"
	@echo "  make k8s-seed            - trigger backend seed job in Kubernetes"
	@echo "  make k8s-port-forward    - expose postgres/backend/client to localhost ($(POSTGRES_PORT)/$(BACKEND_PORT)/$(CLIENT_PORT))"
	@echo "  make k8s-observability-deploy - deploy the local Kubernetes LGTM monitoring stack"
	@echo "  make k8s-observability-port-forward - expose Grafana, Prometheus, Loki, Tempo, and Alertmanager"
	@echo "  make k8s-argocd-install - install Argo CD $(ARGOCD_VERSION) in the kind cluster"
	@echo "  make k8s-argocd-bootstrap - install Argo CD and register the GitOps applications"
	@echo "  make k8s-argocd-status - show Argo CD components and managed applications"
	@echo "  make k8s-argocd-port-forward - expose the Argo CD UI at https://localhost:8081"
	@echo "  make k8s-argocd-initial-password - print the local Argo CD admin password"
	@echo "  make kind-gitops-bootstrap - create kind and bootstrap its Argo CD-managed stack"
	@echo "  make kind-status         - show pods/services in namespace $(K8S_NAMESPACE)"
	@echo "  make nomad-network       - create the Docker network used by the local Nomad job"
	@echo "  make nomad-agent         - start the local Nomad server/client (foreground)"
	@echo "  make nomad-deploy        - build images and deploy TimescaleDB, backend, and frontend to Nomad"
	@echo "  make nomad-status        - show the Nomad job and its allocation"
	@echo "  make nomad-stop          - stop and purge the local Nomad deployment"
	@echo "  make vm-nomad-up         - create/provision the Linux VM Nomad environment"
	@echo "  make vm-nomad-start      - start the existing Linux VM (or create it if absent)"
	@echo "  make vm-nomad-halt       - gracefully stop the Linux VM; retain its disk and data"
	@echo "  make vm-nomad-deploy     - build images and deploy the full stack inside the VM"
	@echo "  make vm-nomad-status     - show the Nomad job status inside the VM"
	@echo "  make vm-nomad-cli NOMAD_VM_CLI_COMMAND='seed-data' - run a Spring CLI command against VM TimescaleDB"
	@echo "  make vm-nomad-port-forward - expose VM frontend, API, database, and Nomad UI to localhost"
	@echo "  make vm-nomad-stop       - stop and purge the VM Nomad job"
	@echo "  make vm-nomad-stop-all   - stop and purge every VM Nomad job; retain the VM and data"
	@echo "  make vm-nomad-destroy    - destroy the Linux VM and its persistent data"
	@echo "  make vm-timescaledb-enable-statements - enable pg_stat_statements for an existing VM database"
	@echo "  make vm-observability-deploy - deploy Grafana, Prometheus, Loki, Tempo, Collector, and Alloy in the VM"
	@echo "  make vm-observability-status - show the VM observability job status"
	@echo "  make vm-observability-port-forward - expose Grafana, Prometheus, Loki, and Tempo to localhost"
	@echo "  make vm-observability-stop - stop and purge the VM observability job"
	@echo "  make vm-monitoring-deploy  - deploy database, VM, container exporters and Alertmanager"
	@echo "  make vm-monitoring-status  - show the VM monitoring job status"
	@echo "  make vm-monitoring-stop    - stop and purge the VM monitoring job"

up:
	docker compose up -d postgres

wait-db:
	@echo "Waiting for postgres to be healthy..."
	@until docker compose exec -T postgres pg_isready -U devoteam -d devoteam >/dev/null 2>&1; do sleep 1; done
	@echo "Postgres is ready."

package:
	cd devo_carre && $(MVNW) -DskipTests package

seed:
	cd devo_carre && java -Dspring.profiles.active=$(PROFILE),cli \
		-Dspring.main.web-application-type=none \
		-jar $(JAR) \
		seed-data

clean:
	cd devo_carre && java -Dspring.profiles.active=$(PROFILE),cli \
		-Dspring.main.web-application-type=none \
		-jar $(JAR) \
		clean-data --confirm

backend-image:
	docker build \
		--build-arg BUILDER_IMAGE=$(BACKEND_BUILD_IMAGE) \
		--build-arg RUNTIME_IMAGE=$(BACKEND_RUNTIME_IMAGE) \
		-t $(BACKEND_IMAGE) ./devo_carre

client-image:
	docker build -t $(CLIENT_IMAGE) ./client-application

bootstrap-images: up wait-db package backend-image clean seed client-image
	@echo "Done: postgres started, backend image built ($(BACKEND_IMAGE)), DB cleaned+seeded, client image built ($(CLIENT_IMAGE))."

run:
	PROFILE=$(PROFILE) BACKEND_IMAGE=$(BACKEND_IMAGE) CLIENT_IMAGE=$(CLIENT_IMAGE) \
	$(MAKE) bootstrap-images
	PROFILE=$(PROFILE) BACKEND_IMAGE=$(BACKEND_IMAGE) CLIENT_IMAGE=$(CLIENT_IMAGE) \
	docker compose up -d postgres backend client

run-dev:
	cd devo_carre && $(MVNW) spring-boot:run -Dspring-boot.run.profiles=$(PROFILE)

frontend:
	cd client-application && bun run dev

helm-package:
	mkdir -p $(HELM_DIST)
	helm package ./devo_carre/charts --destination $(HELM_DIST)
	helm package ./client-application/charts --destination $(HELM_DIST)
	@echo "Packaged charts in $(HELM_DIST)"

helm-push: helm-package
	@if [ -z "$(HELM_OCI_REPO)" ]; then \
		echo "HELM_OCI_REPO is required. Example: make helm-push HELM_OCI_REPO=oci://ghcr.io/acme/charts"; \
		exit 1; \
	fi
	helm push $(HELM_DIST)/dc-backend-0.1.0.tgz $(HELM_OCI_REPO)
	helm push $(HELM_DIST)/dc-client-0.1.0.tgz $(HELM_OCI_REPO)

kind-create:
	@if kind get clusters | grep -q "^$(KIND_CLUSTER_NAME)$$"; then \
		echo "kind cluster '$(KIND_CLUSTER_NAME)' already exists"; \
	else \
		kind create cluster --name $(KIND_CLUSTER_NAME) --config ./k8s-local/kind-config.yaml; \
	fi

kind-delete:
	kind delete cluster --name $(KIND_CLUSTER_NAME)

kind-load-images: backend-image client-image
	kind load docker-image $(BACKEND_IMAGE) --name $(KIND_CLUSTER_NAME)
	kind load docker-image $(CLIENT_IMAGE) --name $(KIND_CLUSTER_NAME)

k8s-postgres-apply:
	kubectl create namespace $(K8S_NAMESPACE) --dry-run=client -o yaml | kubectl apply -f -
	kubectl -n $(K8S_NAMESPACE) apply -f ./k8s-local/postgres.yaml

k8s-ensure-schedulable:
	@echo "Ensuring Kubernetes nodes are schedulable..."
	@for node in $$(kubectl get nodes -o name); do \
		kubectl uncordon "$${node#node/}" >/dev/null 2>&1 || true; \
	done

k8s-postgres-wait: k8s-ensure-schedulable
	@kubectl -n $(K8S_NAMESPACE) wait --for=condition=available deployment/postgres --timeout=180s || { \
		status=$$?; \
		echo "Postgres deployment did not become available. Current cluster status:"; \
		kubectl get nodes; \
		kubectl -n $(K8S_NAMESPACE) get pods,svc; \
		kubectl -n $(K8S_NAMESPACE) describe deployment/postgres; \
		exit $$status; \
	}

k8s-deploy:
	helm upgrade --install dc-backend ./devo_carre/charts \
		--namespace $(K8S_NAMESPACE) \
		--set image.repository=$(BACKEND_REPOSITORY) \
		--set image.tag=$(if $(BACKEND_TAG),$(BACKEND_TAG),latest) \
		--set backend.database.host=postgres \
		--set backend.database.name=devoteam \
		--set backend.database.user=devoteam \
		--set backend.database.password=devoteam \
		--set seed.enabled=false
	helm upgrade --install dc-client ./client-application/charts \
		--namespace $(K8S_NAMESPACE) \
		--set image.repository=$(CLIENT_REPOSITORY) \
		--set image.tag=$(if $(CLIENT_TAG),$(CLIENT_TAG),latest)

k8s-seed:
	helm upgrade --install dc-backend ./devo_carre/charts \
		--namespace $(K8S_NAMESPACE) \
		--set image.repository=$(BACKEND_REPOSITORY) \
		--set image.tag=$(if $(BACKEND_TAG),$(BACKEND_TAG),latest) \
		--set backend.database.host=postgres \
		--set backend.database.name=devoteam \
		--set backend.database.user=devoteam \
		--set backend.database.password=devoteam \
		--set seed.enabled=true \
		--set seed.hook=post-upgrade \
		--set-string seed.runId=$$(date +%s)
	helm upgrade --install dc-backend ./devo_carre/charts \
		--namespace $(K8S_NAMESPACE) \
		--set image.repository=$(BACKEND_REPOSITORY) \
		--set image.tag=$(if $(BACKEND_TAG),$(BACKEND_TAG),latest) \
		--set backend.database.host=postgres \
		--set backend.database.name=devoteam \
		--set backend.database.user=devoteam \
		--set backend.database.password=devoteam \
		--set seed.enabled=false

k8s-undeploy:
	helm uninstall dc-client --namespace $(K8S_NAMESPACE) || true
	helm uninstall dc-backend --namespace $(K8S_NAMESPACE) || true

kind-bootstrap: kind-create kind-load-images k8s-postgres-apply k8s-postgres-wait k8s-deploy k8s-observability-deploy
	@echo "Cluster is ready. Run 'make k8s-port-forward' then open http://localhost:4200"

k8s-port-forward:
	@echo "Opening port-forward for postgres($(POSTGRES_PORT)), backend($(BACKEND_PORT)), and client($(CLIENT_PORT)). Ctrl+C to stop."
	@set -e; \
	pids=""; \
	trap 'for pid in $$pids; do kill $$pid 2>/dev/null || true; done' INT TERM EXIT; \
	kubectl -n $(K8S_NAMESPACE) port-forward svc/postgres $(POSTGRES_PORT):5432 & \
	pids="$$pids $$!"; \
	kubectl -n $(K8S_NAMESPACE) port-forward svc/dc-backend $(BACKEND_PORT):8080 & \
	pids="$$pids $$!"; \
	kubectl -n $(K8S_NAMESPACE) port-forward svc/dc-client $(CLIENT_PORT):80 & \
	pids="$$pids $$!"; \
	wait

k8s-observability-validate:
	kubectl kustomize ./observability >/dev/null

k8s-observability-deploy: k8s-observability-validate k8s-ensure-schedulable
	kubectl apply -k ./observability
	kubectl -n $(K8S_OBSERVABILITY_NAMESPACE) rollout status deployment/prometheus --timeout=180s
	kubectl -n $(K8S_OBSERVABILITY_NAMESPACE) rollout status deployment/grafana --timeout=180s
	kubectl -n $(K8S_OBSERVABILITY_NAMESPACE) rollout status deployment/alloy --timeout=180s

k8s-observability-status:
	kubectl -n $(K8S_OBSERVABILITY_NAMESPACE) get deployments,daemonsets,pods,svc

k8s-observability-port-forward:
	@echo "Opening port-forwards for Grafana(3000), Prometheus(9090), Loki(3100), Tempo(3200), and Alertmanager(9093). Ctrl+C to stop."
	@set -e; \
	pids=""; \
	trap 'for pid in $$pids; do kill $$pid 2>/dev/null || true; done' INT TERM EXIT; \
	kubectl -n $(K8S_OBSERVABILITY_NAMESPACE) port-forward svc/grafana 3000:3000 & \
	pids="$$pids $$!"; \
	kubectl -n $(K8S_OBSERVABILITY_NAMESPACE) port-forward svc/prometheus 9090:9090 & \
	pids="$$pids $$!"; \
	kubectl -n $(K8S_OBSERVABILITY_NAMESPACE) port-forward svc/loki 3100:3100 & \
	pids="$$pids $$!"; \
	kubectl -n $(K8S_OBSERVABILITY_NAMESPACE) port-forward svc/tempo 3200:3200 & \
	pids="$$pids $$!"; \
	kubectl -n $(K8S_OBSERVABILITY_NAMESPACE) port-forward svc/alertmanager 9093:9093 & \
	pids="$$pids $$!"; \
	wait

k8s-observability-undeploy:
	kubectl delete -k ./observability --ignore-not-found

k8s-argocd-install: kind-create
	kubectl create namespace $(ARGOCD_NAMESPACE) --dry-run=client -o yaml | kubectl apply -f -
	kubectl apply --server-side --force-conflicts --namespace $(ARGOCD_NAMESPACE) -f $(ARGOCD_INSTALL_MANIFEST)
	kubectl -n $(ARGOCD_NAMESPACE) rollout status statefulset/argocd-application-controller --timeout=240s
	kubectl -n $(ARGOCD_NAMESPACE) rollout status deployment/argocd-server --timeout=240s

k8s-argocd-bootstrap: k8s-argocd-install
	kubectl apply -k ./argocd
	@echo "Argo CD applications registered. Run 'make k8s-argocd-status' to inspect reconciliation."

k8s-argocd-status:
	kubectl -n $(ARGOCD_NAMESPACE) get deployments,statefulsets,pods,applications.argoproj.io

k8s-argocd-port-forward:
	@echo "Opening Argo CD at https://localhost:8081. Ctrl+C to stop."
	kubectl -n $(ARGOCD_NAMESPACE) port-forward svc/argocd-server 8081:443

k8s-argocd-initial-password:
	@value=$$(kubectl -n $(ARGOCD_NAMESPACE) get secret argocd-initial-admin-secret -o jsonpath='{.data.password}'); \
	if base64 --decode </dev/null >/dev/null 2>&1; then printf '%s' "$$value" | base64 --decode; else printf '%s' "$$value" | base64 -D; fi; \
	echo

kind-gitops-bootstrap: kind-create k8s-argocd-bootstrap
	@echo "Argo CD owns the application and observability deployments. See argocd/README.md before opening the UI."

kind-status:
	kubectl -n $(K8S_NAMESPACE) get pods,svc

nomad-network:
	@docker network inspect $(NOMAD_DOCKER_NETWORK) >/dev/null 2>&1 || docker network create $(NOMAD_DOCKER_NETWORK)

nomad-agent: nomad-network
	mkdir -p /tmp/devo-carre-nomad/timescaledb-data
	nomad agent -config=./nomad/nomad.hcl

nomad-validate:
	NOMAD_ADDR=$(NOMAD_ADDR) nomad job validate -var-file=$(NOMAD_VAR_FILE) ./nomad/deployment.hcl

nomad-images: backend-image client-image

nomad-deploy: nomad-validate nomad-images nomad-network
	@backend_image_id=$$(docker image inspect --format '{{.Id}}' $(BACKEND_IMAGE)); \
	client_image_id=$$(docker image inspect --format '{{.Id}}' $(CLIENT_IMAGE)); \
	NOMAD_ADDR=$(NOMAD_ADDR) nomad job run \
		-var-file=$(NOMAD_VAR_FILE) \
		-var="backend_image=$$backend_image_id" \
		-var="client_image=$$client_image_id" \
		./nomad/deployment.hcl

nomad-status:
	NOMAD_ADDR=$(NOMAD_ADDR) nomad job status devoteam-carrefour

nomad-stop:
	NOMAD_ADDR=$(NOMAD_ADDR) nomad job stop -purge devoteam-carrefour

vm-nomad-up:
	cd $(NOMAD_VM_DIR) && VAGRANT_BOX=$(NOMAD_VM_BOX) vagrant up $(NOMAD_VM_PROVIDER_ARG)

vm-nomad-start: vm-nomad-up

vm-nomad-halt:
	cd $(NOMAD_VM_DIR) && vagrant halt

vm-nomad-sync:
	cd $(NOMAD_VM_DIR) && vagrant rsync

vm-nomad-provision:
	cd $(NOMAD_VM_DIR) && vagrant provision

vm-nomad-images: vm-nomad-sync
	cd $(NOMAD_VM_DIR) && vagrant ssh -c 'set -e; sudo docker buildx build --load -t devo-carre-backend:vm /workspace/devo_carre; sudo docker buildx build --load -t devo-carre-client:vm /workspace/client-application'

vm-nomad-deploy: vm-nomad-images
	cd $(NOMAD_VM_DIR) && vagrant ssh -c 'set -e; backend_image_id=$$(sudo docker image inspect --format "{{.Id}}" devo-carre-backend:vm); client_image_id=$$(sudo docker image inspect --format "{{.Id}}" devo-carre-client:vm); sudo env NOMAD_ADDR=http://127.0.0.1:4646 nomad job run -var-file=$(NOMAD_VM_VAR_FILE) -var="backend_image=$$backend_image_id" -var="client_image=$$client_image_id" /workspace/nomad/vm/deployment.hcl'

vm-nomad-status:
	cd $(NOMAD_VM_DIR) && vagrant ssh -c 'sudo env NOMAD_ADDR=http://127.0.0.1:4646 nomad job status devoteam-carrefour'

vm-nomad-cli:
	cd $(NOMAD_VM_DIR) && vagrant ssh -c "sudo env NOMAD_ADDR=http://127.0.0.1:4646 nomad alloc exec -i=false -t=false -job -task backend devoteam-carrefour /bin/sh -c 'exec /usr/bin/env SPRING_PROFILES_ACTIVE=$(NOMAD_VM_CLI_PROFILE),cli SPRING_MAIN_WEB_APPLICATION_TYPE=none java -jar /app/app.jar $(NOMAD_VM_CLI_COMMAND)'"

vm-nomad-port-forward:
	cd $(NOMAD_VM_DIR) && vagrant ssh -- -N \
		-L 127.0.0.1:4200:127.0.0.1:4200 \
		-L 127.0.0.1:8080:127.0.0.1:8080 \
		-L 127.0.0.1:5432:127.0.0.1:5432 \
		-L 127.0.0.1:4646:127.0.0.1:4646

vm-nomad-stop:
	cd $(NOMAD_VM_DIR) && vagrant ssh -c 'sudo env NOMAD_ADDR=http://127.0.0.1:4646 nomad job stop -purge devoteam-carrefour'

vm-nomad-stop-all:
	cd $(NOMAD_VM_DIR) && vagrant ssh -c 'set -eu; for job in devoteam-carrefour devo-carre-monitoring devo-carre-observability; do if sudo env NOMAD_ADDR=http://127.0.0.1:4646 nomad job status "$$job" >/dev/null 2>&1; then sudo env NOMAD_ADDR=http://127.0.0.1:4646 nomad job stop -purge "$$job"; else echo "Nomad job $$job is not registered; skipping."; fi; done'

vm-timescaledb-enable-statements:
	cd $(NOMAD_VM_DIR) && vagrant ssh -c 'sudo env NOMAD_ADDR=http://127.0.0.1:4646 nomad alloc exec -job -task timescaledb devoteam-carrefour psql -U devoteam -d devoteam -c "CREATE EXTENSION IF NOT EXISTS pg_stat_statements;"'

vm-nomad-destroy:
	cd $(NOMAD_VM_DIR) && vagrant destroy -f

vm-observability-validate:
	nomad job validate -var-file=$(OBSERVABILITY_NOMAD_DIR)/variables.hcl $(OBSERVABILITY_NOMAD_DIR)/observability.hcl

vm-observability-deploy: vm-nomad-provision vm-nomad-sync
	cd $(NOMAD_VM_DIR) && vagrant ssh -c 'set -e; until sudo env NOMAD_ADDR=http://127.0.0.1:4646 nomad node status -self >/dev/null 2>&1; do sleep 1; done; sudo env NOMAD_ADDR=http://127.0.0.1:4646 nomad job run -var-file=$(OBSERVABILITY_NOMAD_VAR_FILE) /workspace/observability/nomad/observability.hcl'

vm-observability-status:
	cd $(NOMAD_VM_DIR) && vagrant ssh -c 'sudo env NOMAD_ADDR=http://127.0.0.1:4646 nomad job status devo-carre-observability'

vm-observability-port-forward:
	cd $(NOMAD_VM_DIR) && vagrant ssh -- -N \
		-L 127.0.0.1:3000:172.26.64.1:3000 \
		-L 127.0.0.1:9090:172.26.64.1:9090 \
		-L 127.0.0.1:3100:172.26.64.1:3100 \
		-L 127.0.0.1:3200:172.26.64.1:3200

vm-observability-stop:
	cd $(NOMAD_VM_DIR) && vagrant ssh -c 'sudo env NOMAD_ADDR=http://127.0.0.1:4646 nomad job stop -purge devo-carre-observability'

vm-monitoring-validate:
	nomad job validate -var-file=$(OBSERVABILITY_NOMAD_DIR)/monitoring.variables.hcl $(OBSERVABILITY_NOMAD_DIR)/monitoring.hcl

vm-monitoring-deploy: vm-observability-deploy vm-nomad-sync
	cd $(NOMAD_VM_DIR) && vagrant ssh -c 'sudo env NOMAD_ADDR=http://127.0.0.1:4646 nomad job run -var-file=$(MONITORING_NOMAD_VAR_FILE) /workspace/observability/nomad/monitoring.hcl'

vm-monitoring-status:
	cd $(NOMAD_VM_DIR) && vagrant ssh -c 'sudo env NOMAD_ADDR=http://127.0.0.1:4646 nomad job status devo-carre-monitoring'

vm-monitoring-stop:
	cd $(NOMAD_VM_DIR) && vagrant ssh -c 'sudo env NOMAD_ADDR=http://127.0.0.1:4646 nomad job stop -purge devo-carre-monitoring'
