resource "google_compute_firewall" "app" {
  name    = "${var.name}-app-fw"
  network = var.network_name

  allow {
    protocol = "tcp"
    ports    = [tostring(var.app_port), "22"]
  }

  source_ranges = var.ingress_cidrs
  target_tags   = ["${var.name}-app"]
}

resource "google_compute_instance" "app" {
  name         = "${var.name}-app"
  machine_type = var.machine_type
  zone         = var.zone

  boot_disk {
    initialize_params {
      image = var.image
    }
  }

  network_interface {
    subnetwork = var.subnet_self_link

    access_config {}
  }

  metadata_startup_script = var.startup_script

  tags = ["${var.name}-app"]
}
