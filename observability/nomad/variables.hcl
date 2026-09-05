# Learning-environment defaults. Copy to variables.local.hcl before changing credentials.
observability_ip = "172.26.64.1"

prometheus_image = "prom/prometheus:v3.2.1"
grafana_image    = "grafana/grafana:11.6.0"
loki_image       = "grafana/loki:3.4.2"
tempo_image      = "grafana/tempo:2.7.2"
otel_image       = "otel/opentelemetry-collector-contrib:0.121.0"
alloy_image      = "grafana/alloy:v1.8.3"

grafana_admin_password = "admin"
