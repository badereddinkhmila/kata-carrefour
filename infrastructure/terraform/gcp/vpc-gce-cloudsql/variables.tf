variable "project_name" {
  type    = string
  default = "devo-carre"
}

variable "environment" {
  type    = string
  default = "learn"
}

variable "gcp_project_id" {
  type = string
}

variable "gcp_region" {
  type = string
}

variable "gcp_zone" {
  type = string
}

variable "subnet_cidr" {
  type    = string
  default = "10.30.0.0/20"
}

variable "gce_machine_type" {
  type    = string
  default = "e2-medium"
}

variable "app_image" {
  type = string
}

variable "app_port" {
  type    = number
  default = 8080
}

variable "app_ingress_cidrs" {
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
