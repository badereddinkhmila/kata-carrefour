# Single-node Nomad agent configuration for local development.
data_dir  = "/tmp/devo-carre-nomad"
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

  host_network "loopback" {
    interface = "lo0"
  }

  host_volume "timescaledb-data" {
    path      = "/tmp/devo-carre-nomad/timescaledb-data"
    read_only = false
  }
}
