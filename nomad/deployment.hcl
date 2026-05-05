########################################
# 🔧 VARIABLES
########################################

variable "postgres_image" {
  type    = string
  default = "postgres:18.1-bookworm"
}

variable "backend_image" {
  type    = string
}

variable "client_image" {
  type    = string
}

variable "db_name" {
  type    = string
}

variable "db_user" {
  type    = string
}

variable "db_password" {
  type    = string
}

variable "spring_profile" {
  type    = string
  default = "dev"
}

# Host the backend uses to reach Postgres. Docker Desktop exposes published ports
# on host.docker.internal. Do not use Docker network_mode = "group": Docker treats
# "group" as a network name and errors with "network group not found". For Linux
# + Nomad bridge (CNI) with a shared alloc namespace, set this to 127.0.0.1 and
# use network { mode = "bridge" } with no per-task network_mode.
variable "db_connect_host" {
  type    = string
  default = "host.docker.internal"
}

########################################
# 🚀 JOB
########################################

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

    network {
      port "db" {
        static = 5432
      }
      port "backend" {
        static = 8080
      }
      port "http" {
        static = 4200
      }
    }

    volume "pgdata" {
      type      = "host"
      read_only = false
      source    = "pgdata"
    }

    task "postgres" {
      driver = "docker"

      volume_mount {
        volume      = "pgdata"
        destination = "/var/lib/postgresql/data"
        read_only   = false
      }

      config {
        image                = var.postgres_image
        ports                = ["db"]
        force_pull           = false
        image_pull_timeout   = "0s"
      }

      env {
        POSTGRES_DB       = var.db_name
        POSTGRES_USER     = var.db_user
        POSTGRES_PASSWORD = var.db_password
      }

      resources {
        cpu    = 500
        memory = 512
      }

      service {
        name = "postgres"
        port = "db"
        provider = "nomad"

        check {
          name     = "postgres-alive"
          type     = "tcp"
          interval = "10s"
          timeout  = "2s"
        }
      }
    }

    task "backend" {
      driver = "docker"

      config {
        image                = var.backend_image
        ports                = ["backend"]
        force_pull           = false
        image_pull_timeout   = "0s"
      }

      env {
        DB_URL                 = "jdbc:postgresql://${var.db_connect_host}:5432/${var.db_name}"
        DB_USERNAME            = var.db_user
        DB_PASSWORD            = var.db_password
        SPRING_PROFILES_ACTIVE = var.spring_profile
      }

      resources {
        cpu    = 500
        memory = 512
      }

      service {
        name = "backend"
        port = "backend"
        provider = "nomad"

        check {
          type     = "http"
          path     = "/actuator/health"
          interval = "10s"
          timeout  = "2s"
        }
      }
    }

    task "client" {
      driver = "docker"

      config {
        image                = var.client_image
        ports                = ["http"]
        force_pull           = false
        image_pull_timeout   = "0s"
        port_map {
          http = 80
        }
      }

      env {
        API_URL = "http://127.0.0.1:8080"
      }

      resources {
        cpu    = 200
        memory = 128
      }

      service {
        name = "client"
        port = "http"
        provider = "nomad"

        check {
          type     = "http"
          path     = "/"
          interval = "10s"
          timeout  = "2s"
        }
      }
    }
  }
}