# Learning-environment defaults. Copy to monitoring.variables.local.hcl before changing credentials.
observability_ip = "172.26.64.1"

postgres_exporter_image = "quay.io/prometheuscommunity/postgres-exporter:v0.16.0"
node_exporter_image     = "quay.io/prometheus/node-exporter:v1.9.1"
cadvisor_image          = "gcr.io/cadvisor/cadvisor:v0.52.1"
alertmanager_image      = "prom/alertmanager:v0.28.1"

db_name     = "devoteam"
db_user     = "devoteam"
db_password = "devoteam"
