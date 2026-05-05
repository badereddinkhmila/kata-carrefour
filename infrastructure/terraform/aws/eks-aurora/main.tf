provider "aws" {
  region = var.aws_region
}

data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  name = "${var.project_name}-${var.environment}"
  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

module "network" {
  source               = "../../modules/aws-vpc"
  name                 = local.name
  vpc_cidr             = var.vpc_cidr
  azs                  = slice(data.aws_availability_zones.available.names, 0, 2)
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  tags                 = local.tags
}

module "eks" {
  source                    = "../../modules/aws-eks"
  cluster_name              = "${local.name}-eks"
  cluster_version           = var.eks_cluster_version
  vpc_id                    = module.network.vpc_id
  private_subnet_ids        = module.network.private_subnet_ids
  node_group_min_size       = var.eks_node_min_size
  node_group_max_size       = var.eks_node_max_size
  node_group_desired_size   = var.eks_node_desired_size
  node_group_instance_types = var.eks_node_instance_types
  tags                      = local.tags
}

module "aurora" {
  source                     = "../../modules/aws-aurora-postgres"
  name                       = local.name
  vpc_id                     = module.network.vpc_id
  subnet_ids                 = module.network.private_subnet_ids
  allowed_security_group_ids = [module.eks.node_security_group_id]
  db_name                    = var.db_name
  db_username                = var.db_username
  db_password                = var.db_password
  instance_class             = var.aurora_instance_class
  instance_count             = var.aurora_instance_count
  deletion_protection        = var.aurora_deletion_protection
  skip_final_snapshot        = var.aurora_skip_final_snapshot
  tags                       = local.tags
}
