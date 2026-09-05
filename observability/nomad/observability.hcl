variable "observability_ip" {
  type    = string
  default = "172.26.64.1"
}

variable "prometheus_image" {
  type = string
}

variable "grafana_image" {
  type = string
}

variable "loki_image" {
  type = string
}

variable "tempo_image" {
  type = string
}

variable "otel_image" {
  type = string
}

variable "alloy_image" {
  type = string
}

variable "grafana_admin_password" {
  type = string
}

job "devo-carre-observability" {
  datacenters = ["dc1"]
  type        = "service"

  group "observability" {
    count = 1

    # The host-network group binds only to the CNI bridge. Application tasks
    # reach the Collector through this gateway; macOS reaches UIs via SSH.
    network {
      mode = "host"

      port "grafana" {
        static       = 3000
        to           = 3000
        host_network = "nomad-bridge"
      }

      port "prometheus" {
        static       = 9090
        to           = 9090
        host_network = "nomad-bridge"
      }

      port "loki" {
        static       = 3100
        to           = 3100
        host_network = "nomad-bridge"
      }

      port "tempo" {
        static       = 3200
        to           = 3200
        host_network = "nomad-bridge"
      }

      port "otlp_grpc" {
        static       = 4317
        to           = 4317
        host_network = "nomad-bridge"
      }

      port "otlp_http" {
        static       = 4318
        to           = 4318
        host_network = "nomad-bridge"
      }

      port "tempo_otlp_grpc" {
        static       = 4319
        to           = 4319
        host_network = "nomad-bridge"
      }

      port "alloy" {
        static       = 12345
        to           = 12345
        host_network = "nomad-bridge"
      }

      port "faro" {
        static       = 12347
        to           = 12347
        host_network = "nomad-bridge"
      }
    }

    volume "nomad_allocation_logs" {
      type      = "host"
      source    = "nomad-allocation-logs"
      read_only = true
    }

    volume "prometheus_data" {
      type      = "host"
      source    = "prometheus-data"
      read_only = false
    }

    volume "loki_data" {
      type      = "host"
      source    = "loki-data"
      read_only = false
    }

    volume "tempo_data" {
      type      = "host"
      source    = "tempo-data"
      read_only = false
    }

    volume "grafana_data" {
      type      = "host"
      source    = "grafana-data"
      read_only = false
    }

    volume "grafana_provisioning" {
      type      = "host"
      source    = "grafana-provisioning"
      read_only = true
    }

    volume "grafana_dashboards" {
      type      = "host"
      source    = "grafana-dashboards"
      read_only = true
    }

    task "prometheus" {
      driver = "docker"

      config {
        image        = var.prometheus_image
        network_mode = "host"
        ports        = ["prometheus"]
        force_pull   = false
        args = [
          "--config.file=/etc/prometheus/prometheus.yml",
          "--storage.tsdb.path=/prometheus",
          "--storage.tsdb.retention.time=7d",
          "--web.listen-address=${var.observability_ip}:9090",
        ]
        volumes = [
          "local/prometheus.yml:/etc/prometheus/prometheus.yml:ro",
          "local/alerts.yml:/etc/prometheus/alerts.yml:ro",
        ]
      }

      template {
        destination = "local/prometheus.yml"
        change_mode = "restart"
        data        = <<-YAML
          global:
            scrape_interval: 15s
            evaluation_interval: 15s

          rule_files:
            - /etc/prometheus/alerts.yml

          alerting:
            alertmanagers:
              - static_configs:
                  - targets: ["${var.observability_ip}:9093"]

          scrape_configs:
            - job_name: prometheus
              static_configs:
                - targets: ["${var.observability_ip}:9090"]

            - job_name: devo-carre-backend
              metrics_path: /actuator/prometheus
              static_configs:
                - targets: ["127.0.0.1:8080"]

            - job_name: nomad
              metrics_path: /v1/metrics
              params:
                format: [prometheus]
              static_configs:
                - targets: ["127.0.0.1:4646"]

            - job_name: loki
              static_configs:
                - targets: ["${var.observability_ip}:3100"]

            - job_name: tempo
              static_configs:
                - targets: ["${var.observability_ip}:3200"]

            - job_name: postgres-exporter
              static_configs:
                - targets: ["${var.observability_ip}:9187"]

            - job_name: node-exporter
              static_configs:
                - targets: ["${var.observability_ip}:9100"]

            - job_name: cadvisor
              static_configs:
                - targets: ["${var.observability_ip}:8080"]

            - job_name: alloy
              static_configs:
                - targets: ["${var.observability_ip}:12345"]
          YAML
      }

      template {
        destination = "local/alerts.yml"
        change_mode = "restart"
        data        = <<-YAML
          groups:
            - name: devo-carre-platform
              rules:
                - alert: DevoCarreBackendDown
                  expr: up{job="devo-carre-backend"} == 0
                  for: 2m
                  labels:
                    severity: critical
                  annotations:
                    summary: Devo Carre backend is unavailable

                - alert: DevoCarreDatabaseExporterDown
                  expr: up{job="postgres-exporter"} == 0
                  for: 2m
                  labels:
                    severity: critical
                  annotations:
                    summary: PostgreSQL exporter is unavailable

                - alert: DevoCarreHostDiskFilling
                  expr: 100 * devo_carre_vm_root_filesystem_avail_bytes / devo_carre_vm_root_filesystem_size_bytes < 15
                  for: 5m
                  labels:
                    severity: warning
                  annotations:
                    summary: Nomad VM root disk has less than 15 percent free

                - alert: DevoCarreHighHttpErrorRate
                  expr: 100 * sum(rate(http_server_requests_seconds_count{job="devo-carre-backend",uri!~"/actuator.*",status=~"5.."}[5m])) / clamp_min(sum(rate(http_server_requests_seconds_count{job="devo-carre-backend",uri!~"/actuator.*"}[5m])), 0.001) > 5
                  for: 5m
                  labels:
                    severity: warning
                  annotations:
                    summary: Backend 5xx rate exceeds 5 percent

                - alert: DevoCarreHighP95Latency
                  expr: histogram_quantile(0.95, sum by (le) (rate(http_server_requests_seconds_bucket{job="devo-carre-backend",uri!~"/actuator.*"}[5m]))) > 1
                  for: 10m
                  labels:
                    severity: warning
                  annotations:
                    summary: Backend p95 latency exceeds one second
          YAML
      }

      volume_mount {
        volume      = "prometheus_data"
        destination = "/prometheus"
        read_only   = false
      }

      resources {
        cpu    = 300
        memory = 256
      }

      service {
        name     = "prometheus"
        port     = "prometheus"
        provider = "nomad"

        check {
          name     = "prometheus-ready"
          type     = "http"
          path     = "/-/ready"
          interval = "10s"
          timeout  = "2s"
        }
      }
    }

    task "loki" {
      driver = "docker"

      config {
        image        = var.loki_image
        network_mode = "host"
        ports        = ["loki"]
        force_pull   = false
        args         = ["-config.file=/etc/loki/config.yml"]
        volumes = [
          "local/loki.yml:/etc/loki/config.yml:ro",
        ]
      }

      template {
        destination = "local/loki.yml"
        change_mode = "restart"
        data        = <<-YAML
          auth_enabled: false

          server:
            http_listen_address: ${var.observability_ip}
            http_listen_port: 3100

          common:
            path_prefix: /loki
            replication_factor: 1
            ring:
              kvstore:
                store: inmemory
            storage:
              filesystem:
                chunks_directory: /loki/chunks
                rules_directory: /loki/rules

          schema_config:
            configs:
              - from: 2024-01-01
                store: tsdb
                object_store: filesystem
                schema: v13
                index:
                  prefix: index_
                  period: 24h

          limits_config:
            allow_structured_metadata: true
          YAML
      }

      volume_mount {
        volume      = "loki_data"
        destination = "/loki"
        read_only   = false
      }

      resources {
        cpu    = 200
        memory = 192
      }

      service {
        name     = "loki"
        port     = "loki"
        provider = "nomad"

        check {
          name     = "loki-ready"
          type     = "http"
          path     = "/ready"
          interval = "10s"
          timeout  = "2s"
        }
      }
    }

    task "tempo" {
      driver = "docker"

      config {
        image        = var.tempo_image
        network_mode = "host"
        ports        = ["tempo", "tempo_otlp_grpc"]
        force_pull   = false
        args         = ["-config.file=/etc/tempo/config.yml"]
        volumes = [
          "local/tempo.yml:/etc/tempo/config.yml:ro",
        ]
      }

      template {
        destination = "local/tempo.yml"
        change_mode = "restart"
        data        = <<-YAML
          server:
            http_listen_address: ${var.observability_ip}
            http_listen_port: 3200
            # Tempo's internal frontend uses loopback gRPC; avoid Loki's default 9095.
            grpc_listen_address: 127.0.0.1
            grpc_listen_port: 9096

          distributor:
            receivers:
              otlp:
                protocols:
                  grpc:
                    endpoint: ${var.observability_ip}:4319
                  http:

          ingester:
            max_block_duration: 5m

          compactor:
            compaction:
              block_retention: 24h

          storage:
            trace:
              backend: local
              wal:
                path: /var/tempo/wal
              local:
                path: /var/tempo/blocks
          YAML
      }

      volume_mount {
        volume      = "tempo_data"
        destination = "/var/tempo"
        read_only   = false
      }

      resources {
        cpu    = 300
        memory = 256
      }

      service {
        name     = "tempo"
        port     = "tempo"
        provider = "nomad"

        check {
          name     = "tempo-ready"
          type     = "http"
          path     = "/ready"
          interval = "10s"
          timeout  = "2s"
        }
      }
    }

    task "otel-collector" {
      driver = "docker"

      config {
        image        = var.otel_image
        network_mode = "host"
        ports        = ["otlp_grpc", "otlp_http"]
        force_pull   = false
        args         = ["--config=/etc/otelcol-contrib/config.yml"]
        volumes = [
          "local/otel-collector.yml:/etc/otelcol-contrib/config.yml:ro",
        ]
      }

      template {
        destination = "local/otel-collector.yml"
        change_mode = "restart"
        data        = <<-YAML
          receivers:
            otlp:
              protocols:
                grpc:
                  endpoint: ${var.observability_ip}:4317
                http:
                  endpoint: ${var.observability_ip}:4318

          processors:
            memory_limiter:
              check_interval: 1s
              limit_mib: 256
            batch:

          exporters:
            otlp/tempo:
              endpoint: ${var.observability_ip}:4319
              tls:
                insecure: true

          service:
            pipelines:
              traces:
                receivers: [otlp]
                processors: [memory_limiter, batch]
                exporters: [otlp/tempo]
          YAML
      }

      resources {
        cpu    = 200
        memory = 256
      }

      service {
        name     = "otel-collector"
        port     = "otlp_http"
        provider = "nomad"

        check {
          name     = "otlp-http-listener"
          type     = "tcp"
          interval = "10s"
          timeout  = "2s"
        }
      }
    }

    task "alloy" {
      driver = "docker"

      config {
        image        = var.alloy_image
        network_mode = "host"
        ports        = ["alloy", "faro"]
        force_pull   = false
        args = [
          "run",
          "/etc/alloy/config.alloy",
          "--server.http.listen-addr=${var.observability_ip}:12345",
        ]
        volumes = [
          "local/alloy.alloy:/etc/alloy/config.alloy:ro",
        ]
      }

      template {
        destination = "local/alloy.alloy"
        change_mode = "restart"
        data        = <<-RIVER
          local.file_match "nomad_allocation_logs" {
            path_targets = [
              {
                __path__ = "/var/log/nomad/alloc/*/alloc/logs/*.stdout.*",
                job      = "nomad-allocation",
              },
              {
                __path__ = "/var/log/nomad/alloc/*/alloc/logs/*.stderr.*",
                job      = "nomad-allocation",
              },
            ]
            sync_period = "5s"
          }

          loki.source.file "nomad_allocation_logs" {
            targets    = local.file_match.nomad_allocation_logs.targets
            forward_to = [loki.write.local.receiver]
          }

          loki.write "local" {
            endpoint {
              url = "http://${var.observability_ip}:3100/loki/api/v1/push"
            }
            external_labels = {
              environment = "dev",
              node        = "devo-carre-nomad",
            }
          }

          faro.receiver "frontend" {
            log_format = "json"
            extra_log_labels = {
              application = "client-application",
              environment = "dev",
              source      = "faro",
            }

            server {
              listen_address = "${var.observability_ip}"
              listen_port    = 12347
            }

            // Vite production builds do not publish source maps in this learning stack.
            // Disable remote retrieval so browser-provided telemetry cannot trigger fetches.
            sourcemaps {
              download = false
            }

            output {
              logs   = [loki.write.local.receiver]
              traces = [otelcol.exporter.otlphttp.tempo.input]
            }
          }

          otelcol.exporter.otlphttp "tempo" {
            client {
              endpoint = "http://${var.observability_ip}:4318"
            }
          }
          RIVER
      }

      volume_mount {
        volume      = "nomad_allocation_logs"
        destination = "/var/log/nomad/alloc"
        read_only   = true
      }

      resources {
        cpu    = 100
        memory = 64
      }

      service {
        name     = "alloy"
        port     = "alloy"
        provider = "nomad"

        check {
          name     = "alloy-ready"
          type     = "http"
          path     = "/-/ready"
          interval = "10s"
          timeout  = "2s"
        }
      }
    }

    task "grafana" {
      driver = "docker"

      config {
        image        = var.grafana_image
        network_mode = "host"
        ports        = ["grafana"]
        force_pull   = false
        volumes = [
          "local/datasources.yml:/etc/grafana/provisioning/datasources/datasources.yml:ro",
        ]
      }

      env {
        GF_SERVER_HTTP_ADDR        = var.observability_ip
        GF_SERVER_HTTP_PORT        = "3000"
        GF_SECURITY_ADMIN_USER     = "admin"
        GF_SECURITY_ADMIN_PASSWORD = var.grafana_admin_password
        GF_USERS_ALLOW_SIGN_UP     = "false"
      }

      template {
        destination = "local/datasources.yml"
        change_mode = "restart"
        data        = <<-YAML
          apiVersion: 1

          datasources:
            - name: Prometheus
              type: prometheus
              uid: prometheus
              access: proxy
              url: http://${var.observability_ip}:9090
              isDefault: true
              editable: false
            - name: Loki
              type: loki
              uid: loki
              access: proxy
              url: http://${var.observability_ip}:3100
              editable: false
            - name: Tempo
              type: tempo
              uid: tempo
              access: proxy
              url: http://${var.observability_ip}:3200
              editable: false
          YAML
      }

      volume_mount {
        volume      = "grafana_data"
        destination = "/var/lib/grafana"
        read_only   = false
      }

      volume_mount {
        volume      = "grafana_provisioning"
        destination = "/etc/grafana/provisioning/dashboards"
        read_only   = true
      }

      volume_mount {
        volume      = "grafana_dashboards"
        destination = "/opt/grafana-dashboards"
        read_only   = true
      }

      resources {
        cpu    = 200
        memory = 192
      }

      service {
        name     = "grafana"
        port     = "grafana"
        provider = "nomad"

        check {
          name     = "grafana-ready"
          type     = "http"
          path     = "/api/health"
          interval = "10s"
          timeout  = "2s"
        }
      }
    }
  }
}
