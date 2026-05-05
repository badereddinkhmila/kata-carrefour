output "gce_public_ip" {
  value = module.gce_app.public_ip
}

output "cloudsql_private_ip" {
  value = module.cloudsql.private_ip_address
}

output "jdbc_url" {
  value = "jdbc:postgresql://${module.cloudsql.private_ip_address}:5432/${var.db_name}"
}
