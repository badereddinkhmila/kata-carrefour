variable "name" {
  type = string
}

variable "zone" {
  type = string
}

variable "machine_type" {
  type    = string
  default = "e2-medium"
}

variable "image" {
  type    = string
  default = "debian-cloud/debian-12"
}

variable "network_name" {
  type = string
}

variable "subnet_self_link" {
  type = string
}

variable "app_port" {
  type    = number
  default = 8080
}

variable "ingress_cidrs" {
  type    = list(string)
  default = ["0.0.0.0/0"]
}

variable "startup_script" {
  type    = string
  default = null
}
