provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

locals {
  name = "${var.project_name}-${var.environment}"

  db_url = "jdbc:postgresql://${module.cloudsql.private_ip_address}:5432/${var.db_name}"
}

resource "google_project_service" "required" {
  for_each = toset([
    "compute.googleapis.com",
    "sqladmin.googleapis.com",
    "servicenetworking.googleapis.com"
  ])

  project = var.gcp_project_id
  service = each.key
}

module "network" {
  source      = "../../modules/gcp-network"
  name        = local.name
  region      = var.gcp_region
  subnet_cidr = var.subnet_cidr

  depends_on = [google_project_service.required]
}

module "cloudsql" {
  source      = "../../modules/gcp-cloudsql-postgres"
  name        = local.name
  region      = var.gcp_region
  network_id  = module.network.network_id
  db_name     = var.db_name
  db_username = var.db_username
  db_password = var.db_password

  depends_on = [google_project_service.required]
}

module "gce_app" {
  source           = "../../modules/gcp-gce-app"
  name             = local.name
  zone             = var.gcp_zone
  machine_type     = var.gce_machine_type
  network_name     = module.network.network_name
  subnet_self_link = module.network.subnet_self_link
  app_port         = var.app_port
  ingress_cidrs    = var.app_ingress_cidrs
  startup_script = templatefile("${path.module}/startup.sh.tftpl", {
    app_image   = var.app_image
    app_port    = var.app_port
    db_url      = local.db_url
    db_username = var.db_username
    db_password = var.db_password
  })

  depends_on = [google_project_service.required]
}
