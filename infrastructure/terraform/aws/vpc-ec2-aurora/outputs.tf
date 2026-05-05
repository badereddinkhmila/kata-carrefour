output "ec2_public_ip" {
  value = module.app.public_ip
}

output "aurora_writer_endpoint" {
  value = module.aurora.cluster_endpoint
}

output "jdbc_url" {
  value = "jdbc:postgresql://${module.aurora.cluster_endpoint}:5432/${var.db_name}"
}
