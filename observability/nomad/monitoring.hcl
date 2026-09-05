variable "observability_ip" {
  type    = string
  default = "172.26.64.1"
}

variable "postgres_exporter_image" { type = string }
variable "node_exporter_image" { type = string }
variable "cadvisor_image" { type = string }
variable "alertmanager_image" { type = string }
variable "db_name" { type = string }
variable "db_user" { type = string }
variable "db_password" { type = string }

job "devo-carre-monitoring" {
  datacenters = ["dc1"]
  type        = "service"

  group "monitoring" {
    count = 1

    network {
      mode = "host"

      port "postgres_exporter" {
        static       = 9187
        to           = 9187
        host_network = "nomad-bridge"
      }

      port "node_exporter" {
        static       = 9100
        to           = 9100
        host_network = "nomad-bridge"
      }

      port "cadvisor" {
        static       = 8080
        to           = 8080
        host_network = "nomad-bridge"
      }

      port "alertmanager" {
        static       = 9093
        to           = 9093
        host_network = "nomad-bridge"
      }
    }

    volume "alertmanager_data" {
      type      = "host"
      source    = "alertmanager-data"
      read_only = false
    }

    volume "host_proc" {
      type      = "host"
      source    = "host-proc"
      read_only = true
    }

    volume "host_run" {
      type      = "host"
      source    = "host-run"
      read_only = true
    }

    volume "host_sys" {
      type      = "host"
      source    = "host-sys"
      read_only = true
    }

    volume "node_exporter_textfile" {
      type      = "host"
      source    = "node-exporter-textfile"
      read_only = true
    }

    task "postgres-exporter" {
      driver = "docker"

      config {
        image        = var.postgres_exporter_image
        network_mode = "host"
        ports        = ["postgres_exporter"]
        force_pull   = false
      }

      env {
        DATA_SOURCE_NAME = "postgresql://${var.db_user}:${var.db_password}@127.0.0.1:5432/${var.db_name}?sslmode=disable"
      }

      resources {
        cpu    = 100
        memory = 64
      }

      service {
        name     = "postgres-exporter"
        port     = "postgres_exporter"
        provider = "nomad"

        check {
          name     = "postgres-exporter-ready"
          type     = "http"
          path     = "/metrics"
          interval = "10s"
          timeout  = "2s"
        }
      }
    }

    task "node-exporter" {
      driver = "docker"

      config {
        image        = var.node_exporter_image
        network_mode = "host"
        ports        = ["node_exporter"]
        force_pull   = false
        args = [
          "--path.procfs=/host/proc",
          "--path.sysfs=/host/sys",
          "--collector.textfile.directory=/textfile",
          "--web.listen-address=${var.observability_ip}:9100",
        ]
      }

      volume_mount {
        volume      = "host_proc"
        destination = "/host/proc"
        read_only   = true
      }

      volume_mount {
        volume      = "host_sys"
        destination = "/host/sys"
        read_only   = true
      }

      volume_mount {
        volume      = "node_exporter_textfile"
        destination = "/textfile"
        read_only   = true
      }

      resources {
        cpu    = 100
        memory = 64
      }

      service {
        name     = "node-exporter"
        port     = "node_exporter"
        provider = "nomad"

        check {
          name     = "node-exporter-ready"
          type     = "http"
          path     = "/metrics"
          interval = "10s"
          timeout  = "2s"
        }
      }
    }

    task "cadvisor" {
      driver = "docker"

      config {
        image        = var.cadvisor_image
        network_mode = "host"
        ports        = ["cadvisor"]
        force_pull   = false
        args = [
          "--listen_ip=${var.observability_ip}",
          "--port=8080",
          "--docker_only=true",
        ]
      }

      volume_mount {
        volume      = "host_run"
        destination = "/var/run"
        read_only   = true
      }

      volume_mount {
        volume      = "host_sys"
        destination = "/sys"
        read_only   = true
      }

      resources {
        cpu    = 200
        memory = 192
      }

      service {
        name     = "cadvisor"
        port     = "cadvisor"
        provider = "nomad"

        check {
          name     = "cadvisor-ready"
          type     = "http"
          path     = "/healthz"
          interval = "10s"
          timeout  = "2s"
        }
      }
    }

    task "alertmanager" {
      driver = "docker"

      config {
        image        = var.alertmanager_image
        network_mode = "host"
        ports        = ["alertmanager"]
        force_pull   = false
        args = [
          "--config.file=/etc/alertmanager/alertmanager.yml",
          "--storage.path=/alertmanager",
          "--web.listen-address=${var.observability_ip}:9093",
        ]
        volumes = [
          "local/alertmanager.yml:/etc/alertmanager/alertmanager.yml:ro",
        ]
      }

      template {
        destination = "local/alertmanager.yml"
        change_mode = "restart"
        data        = <<-YAML
          global:
            resolve_timeout: 5m
          route:
            receiver: discard
            group_by: [alertname, job]
            group_wait: 30s
            group_interval: 5m
            repeat_interval: 4h
          receivers:
            - name: discard
          YAML
      }

      volume_mount {
        volume      = "alertmanager_data"
        destination = "/alertmanager"
        read_only   = false
      }

      resources {
        cpu    = 100
        memory = 64
      }

      service {
        name     = "alertmanager"
        port     = "alertmanager"
        provider = "nomad"

        check {
          name     = "alertmanager-ready"
          type     = "http"
          path     = "/-/ready"
          interval = "10s"
          timeout  = "2s"
        }
      }
    }
  }
}
