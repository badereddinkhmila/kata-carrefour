postgres_image = "postgres:18.1-bookworm"

backend_image = "devo-carre-backend:latest"
client_image  = "devo-carre-client:latest"

db_name     = "devoteam"
db_user     = "devoteam"
db_password = "devoteam"

# bridge networking (CNI) with a shared alloc network, set to "127.0.0.1".
db_connect_host = "host.docker.internal"

spring_profile = "dev"
