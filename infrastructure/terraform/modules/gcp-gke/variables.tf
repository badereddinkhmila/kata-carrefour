variable "cluster_name" {
  type = string
}

variable "region" {
  type = string
}

variable "network_name" {
  type = string
}

variable "subnet_name" {
  type = string
}

variable "pods_secondary_range_name" {
  type = string
}

variable "services_secondary_range_name" {
  type = string
}

variable "node_count" {
  type    = number
  default = 2
}

variable "node_machine_type" {
  type    = string
  default = "e2-standard-4"
}
