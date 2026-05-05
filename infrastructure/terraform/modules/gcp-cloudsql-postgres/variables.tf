variable "name" {
  type = string
}

variable "region" {
  type = string
}

variable "network_id" {
  type = string
}

variable "db_name" {
  type = string
}

variable "db_username" {
  type = string
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "tier" {
  type    = string
  default = "db-custom-2-4096"
}

variable "deletion_protection" {
  type    = bool
  default = false
}
