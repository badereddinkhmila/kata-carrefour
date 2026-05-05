provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

locals {
  name = "${var.project_name}-${var.environment}"
}

resource "google_project_service" "required" {
  for_each = toset([
    "compute.googleapis.com",
    "container.googleapis.com",
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
  secondary_ranges = {
    (var.pods_secondary_range_name)     = var.pods_secondary_cidr
    (var.services_secondary_range_name) = var.services_secondary_cidr
  }

  depends_on = [google_project_service.required]
}

module "gke" {
  source                        = "../../modules/gcp-gke"
  cluster_name                  = "${local.name}-gke"
  region                        = var.gcp_region
  network_name                  = module.network.network_name
  subnet_name                   = module.network.subnet_name
  pods_secondary_range_name     = var.pods_secondary_range_name
  services_secondary_range_name = var.services_secondary_range_name
  node_count                    = var.gke_node_count
  node_machine_type             = var.gke_node_machine_type

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
