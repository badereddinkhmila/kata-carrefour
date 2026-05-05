data_dir = "/tmp/nomad"

bind_addr = "127.0.0.1"

advertise {
  http = "127.0.0.1"
  rpc  = "127.0.0.1"
  serf = "127.0.0.1"
}

server {
  enabled          = true
  bootstrap_expect = 1
}

client {
  enabled = true

  host_volume "pgdata" {
    path = "/tmp/nomad/pgdata"
  }
}

# consul {
#   address = "127.0.0.1:8500"

#   auto_advertise = true
#   client_auto_join = true
#   server_service_name = "nomad"
#   client_service_name = "nomad-client"
# }