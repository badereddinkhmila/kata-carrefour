SHELL := /bin/sh
MVNW := ./mvnw
JAR := target/devo_carre-0.0.1-SNAPSHOT.jar
BACKEND_IMAGE ?= devo-carre-backend:latest
CLIENT_IMAGE ?= devo-carre-client:latest

PROFILE ?= dev

.PHONY: up wait-db package seed clean run-dev run frontend backend-image client-image bootstrap-images help

help:
	@echo "Available targets:"
	@echo "  make up                  - start required docker containers (PostgreSQL)"
	@echo "  make seed PROFILE=dev    - seed database data via CLI"
	@echo "  make clean PROFILE=dev   - clean all database tables data via CLI"
	@echo "  make run-dev PROFILE=dev - start Spring Boot application locally"
	@echo "  make frontend            - start React client locally"
	@echo "  make bootstrap-images    - start postgres, build backend image, clean+seed DB, build client image"
	@echo "  make run PROFILE=dev     - bootstrap and start docker stack (postgres + backend + client)"

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
	docker build -t $(BACKEND_IMAGE) ./devo_carre

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
