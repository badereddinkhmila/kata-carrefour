# Development-only defaults. Create variables.local.hcl for non-default credentials.
timescaledb_image = "timescale/timescaledb:2.24.0-pg17"
backend_image     = "devo-carre-backend:vm"
client_image      = "devo-carre-client:vm"

db_name     = "devoteam"
db_user     = "devoteam"
db_password = "devoteam"

spring_profile = "dev"
