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
POSTGRES_PORT ?= 5432
BACKEND_PORT ?= 8080
CLIENT_PORT ?= 4200
BACKEND_REPOSITORY := $(firstword $(subst :, ,$(BACKEND_IMAGE)))
BACKEND_TAG := $(word 2,$(subst :, ,$(BACKEND_IMAGE)))
CLIENT_REPOSITORY := $(firstword $(subst :, ,$(CLIENT_IMAGE)))
CLIENT_TAG := $(word 2,$(subst :, ,$(CLIENT_IMAGE)))

PROFILE ?= dev

.PHONY: up wait-db package seed clean run-dev run frontend backend-image client-image bootstrap-images help \
	helm-package helm-push kind-create kind-delete kind-load-images k8s-ensure-schedulable k8s-postgres-apply k8s-postgres-wait \
	k8s-deploy k8s-seed k8s-undeploy kind-bootstrap kind-status k8s-port-forward

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
	@echo "  make kind-status         - show pods/services in namespace $(K8S_NAMESPACE)"

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

kind-bootstrap: kind-create kind-load-images k8s-postgres-apply k8s-postgres-wait k8s-deploy
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

kind-status:
	kubectl -n $(K8S_NAMESPACE) get pods,svc
