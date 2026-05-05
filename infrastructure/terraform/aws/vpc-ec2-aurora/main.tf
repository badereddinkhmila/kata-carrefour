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

  db_url = "jdbc:postgresql://${module.aurora.cluster_endpoint}:5432/${var.db_name}"

  user_data = templatefile("${path.module}/user_data.sh.tftpl", {
    app_image   = var.app_image
    app_port    = var.app_port
    db_url      = local.db_url
    db_username = var.db_username
    db_password = var.db_password
  })
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

module "app" {
  source            = "../../modules/aws-ec2-app"
  name              = local.name
  vpc_id            = module.network.vpc_id
  subnet_id         = module.network.public_subnet_ids[0]
  ami_id            = var.ec2_ami_id
  instance_type     = var.ec2_instance_type
  key_name          = var.ec2_key_name
  app_port          = var.app_port
  app_ingress_cidrs = var.app_ingress_cidrs
  ssh_ingress_cidrs = var.ssh_ingress_cidrs
  user_data         = local.user_data
  tags              = local.tags
}

module "aurora" {
  source                     = "../../modules/aws-aurora-postgres"
  name                       = local.name
  vpc_id                     = module.network.vpc_id
  subnet_ids                 = module.network.private_subnet_ids
  allowed_security_group_ids = [module.app.security_group_id]
  db_name                    = var.db_name
  db_username                = var.db_username
  db_password                = var.db_password
  instance_class             = var.aurora_instance_class
  instance_count             = var.aurora_instance_count
  deletion_protection        = var.aurora_deletion_protection
  skip_final_snapshot        = var.aurora_skip_final_snapshot
  tags                       = local.tags
}
