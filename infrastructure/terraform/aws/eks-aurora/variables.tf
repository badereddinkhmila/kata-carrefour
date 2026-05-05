variable "project_name" {
  type    = string
  default = "devo-carre"
}

variable "environment" {
  type    = string
  default = "learn"
}

variable "aws_region" {
  type = string
}

variable "vpc_cidr" {
  type    = string
  default = "10.20.0.0/16"
}

variable "public_subnet_cidrs" {
  type    = list(string)
  default = ["10.20.1.0/24", "10.20.2.0/24"]
}

variable "private_subnet_cidrs" {
  type    = list(string)
  default = ["10.20.11.0/24", "10.20.12.0/24"]
}

variable "eks_cluster_version" {
  type    = string
  default = "1.30"
}

variable "eks_node_min_size" {
  type    = number
  default = 1
}

variable "eks_node_max_size" {
  type    = number
  default = 3
}

variable "eks_node_desired_size" {
  type    = number
  default = 2
}

variable "eks_node_instance_types" {
  type    = list(string)
  default = ["t3.medium"]
}

variable "db_name" {
  type    = string
  default = "devoteam"
}

variable "db_username" {
  type    = string
  default = "devoteam"
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "aurora_instance_class" {
  type    = string
  default = "db.t4g.medium"
}

variable "aurora_instance_count" {
  type    = number
  default = 1
}

variable "aurora_deletion_protection" {
  type    = bool
  default = false
}

variable "aurora_skip_final_snapshot" {
  type    = bool
  default = true
}
