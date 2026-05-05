output "eks_cluster_name" {
  value = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "aurora_writer_endpoint" {
  value = module.aurora.cluster_endpoint
}

output "jdbc_url" {
  value = "jdbc:postgresql://${module.aurora.cluster_endpoint}:5432/${var.db_name}"
}
