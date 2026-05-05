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
  default = "10.10.0.0/16"
}

variable "public_subnet_cidrs" {
  type    = list(string)
  default = ["10.10.1.0/24", "10.10.2.0/24"]
}

variable "private_subnet_cidrs" {
  type    = list(string)
  default = ["10.10.11.0/24", "10.10.12.0/24"]
}

variable "ec2_ami_id" {
  type        = string
  description = "Amazon Linux 2023 AMI ID for your region"
}

variable "ec2_instance_type" {
  type    = string
  default = "t3.medium"
}

variable "ec2_key_name" {
  type    = string
  default = null
}

variable "app_image" {
  type        = string
  description = "Backend container image to run on EC2"
}

variable "app_port" {
  type    = number
  default = 8080
}

variable "app_ingress_cidrs" {
  type    = list(string)
  default = ["0.0.0.0/0"]
}

variable "ssh_ingress_cidrs" {
  type    = list(string)
  default = ["0.0.0.0/0"]
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
