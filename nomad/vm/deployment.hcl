variable "timescaledb_image" {
  type    = string
  default = "timescale/timescaledb:2.24.0-pg17"
}

variable "backend_image" {
  type = string
}

variable "client_image" {
  type = string
}

variable "db_name" {
  type    = string
  default = "devoteam"
}

variable "db_user" {
  type    = string
  default = "devoteam"
}

variable "db_password" {
  type = string
}

variable "spring_profile" {
  type    = string
  default = "dev"
}

variable "deployment_environment" {
  type    = string
  default = "dev"
}

variable "otel_exporter_endpoint" {
  type    = string
  default = "http://172.26.64.1:4318"
}

job "devoteam-carrefour" {
  datacenters = ["dc1"]
  type        = "service"

  group "devoteam-stack" {
    count = 1

    restart {
      attempts = 10
      interval = "30m"
      delay    = "10s"
      mode     = "delay"
    }

    # This runs inside a Linux VM, where Nomad's CNI bridge network is supported.
    # All three tasks share the allocation network namespace.
    network {
      mode = "bridge"

      port "db" {
        static       = 5432
        to           = 5432
        host_network = "loopback"
      }

      port "backend" {
        static       = 8080
        to           = 8080
        host_network = "loopback"
      }

      port "http" {
        static       = 4200
        to           = 80
        host_network = "loopback"
      }
    }

    volume "timescaledb_data" {
      type      = "host"
      source    = "timescaledb-data"
      read_only = false
    }

    task "timescaledb" {
      driver = "docker"

      template {
        destination = "local/001-enable-timescaledb.sql"
        change_mode = "noop"
        data        = <<-SQL
          CREATE EXTENSION IF NOT EXISTS timescaledb;
          CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
          SQL
      }

      config {
        image      = var.timescaledb_image
        ports      = ["db"]
        force_pull = false
        volumes = [
          "local/001-enable-timescaledb.sql:/docker-entrypoint-initdb.d/001-enable-timescaledb.sql:ro",
        ]
        args = [
          "postgres",
          "-c", "shared_preload_libraries=timescaledb,pg_stat_statements",
        ]
      }

      volume_mount {
        volume      = "timescaledb_data"
        destination = "/var/lib/postgresql/data"
        read_only   = false
      }

      env {
        POSTGRES_DB       = var.db_name
        POSTGRES_USER     = var.db_user
        POSTGRES_PASSWORD = var.db_password
      }

      resources {
        cpu    = 500
        memory = 1024
      }

      service {
        name     = "timescaledb"
        port     = "db"
        provider = "nomad"

        check {
          name     = "timescaledb-ready"
          type     = "tcp"
          interval = "10s"
          timeout  = "2s"
        }
      }
    }

    task "backend" {
      driver = "docker"

      config {
        image      = var.backend_image
        ports      = ["backend"]
        force_pull = false
      }

      env {
        DB_URL                      = "jdbc:postgresql://127.0.0.1:5432/${var.db_name}"
        DB_USERNAME                 = var.db_user
        DB_PASSWORD                 = var.db_password
        SPRING_PROFILES_ACTIVE      = var.spring_profile
        DEPLOYMENT_ENVIRONMENT      = var.deployment_environment
        OTEL_SERVICE_NAME           = "devo-carre"
        OTEL_RESOURCE_ATTRIBUTES    = "service.namespace=devoteam,deployment.environment=${var.deployment_environment}"
        OTEL_EXPORTER_OTLP_ENDPOINT = var.otel_exporter_endpoint
        MANAGEMENT_OPENTELEMETRY_TRACING_EXPORT_OTLP_ENDPOINT = "${var.otel_exporter_endpoint}/v1/traces"
      }

      resources {
        cpu    = 500
        memory = 512
      }

      service {
        name     = "devo-carre-backend"
        port     = "backend"
        provider = "nomad"

        check {
          name     = "backend-ready"
          type     = "tcp"
          interval = "10s"
          timeout  = "2s"
        }
      }
    }

    task "client" {
      driver = "docker"

      config {
        image      = var.client_image
        ports      = ["http"]
        force_pull = false
      }

      env {
        FARO_COLLECTOR_UPSTREAM = "172.26.64.1:12347"
        FARO_DNS_RESOLVER       = "127.0.0.11"
      }

      resources {
        cpu    = 200
        memory = 128
      }

      service {
        name     = "devo-carre-client"
        port     = "http"
        provider = "nomad"

        check {
          name     = "client-ready"
          type     = "http"
          path     = "/"
          interval = "10s"
          timeout  = "2s"
        }
      }
    }
  }
}
