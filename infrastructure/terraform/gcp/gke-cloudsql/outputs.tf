output "gke_cluster_name" {
  value = module.gke.cluster_name
}

output "gke_endpoint" {
  value = module.gke.endpoint
}

output "cloudsql_private_ip" {
  value = module.cloudsql.private_ip_address
}

output "jdbc_url" {
  value = "jdbc:postgresql://${module.cloudsql.private_ip_address}:5432/${var.db_name}"
}
