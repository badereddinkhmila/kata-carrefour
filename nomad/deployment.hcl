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

    # Docker Desktop on macOS does not provide Nomad's Linux CNI bridge mode.
    # Tasks join the devoteam-nomad Docker network, where TimescaleDB is
    # discoverable through its network alias, "timescaledb".
    network {
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

      # Docker runs this script only on first database initialization.
      template {
        destination = "local/001-enable-timescaledb.sql"
        change_mode = "noop"
        data        = <<-SQL
          CREATE EXTENSION IF NOT EXISTS timescaledb;
          SQL
      }

      config {
        image              = var.timescaledb_image
        ports              = ["db"]
        force_pull         = false
        image_pull_timeout = "0s"
        network_mode       = "devoteam-nomad"
        network_aliases    = ["timescaledb"]
        volumes = [
          "local/001-enable-timescaledb.sql:/docker-entrypoint-initdb.d/001-enable-timescaledb.sql:ro",
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
        image              = var.backend_image
        ports              = ["backend"]
        force_pull         = false
        image_pull_timeout = "0s"
        network_mode       = "devoteam-nomad"
      }

      env {
        DB_URL                 = "jdbc:postgresql://timescaledb:5432/${var.db_name}"
        DB_USERNAME            = var.db_user
        DB_PASSWORD            = var.db_password
        SPRING_PROFILES_ACTIVE = var.spring_profile
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
        image              = var.client_image
        ports              = ["http"]
        force_pull         = false
        image_pull_timeout = "0s"
        network_mode       = "devoteam-nomad"
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
