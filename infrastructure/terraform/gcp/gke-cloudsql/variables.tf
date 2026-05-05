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

variable "subnet_cidr" {
  type    = string
  default = "10.40.0.0/20"
}

variable "pods_secondary_range_name" {
  type    = string
  default = "gke-pods"
}

variable "pods_secondary_cidr" {
  type    = string
  default = "10.41.0.0/16"
}

variable "services_secondary_range_name" {
  type    = string
  default = "gke-services"
}

variable "services_secondary_cidr" {
  type    = string
  default = "10.42.0.0/20"
}

variable "gke_node_count" {
  type    = number
  default = 2
}

variable "gke_node_machine_type" {
  type    = string
  default = "e2-standard-4"
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
