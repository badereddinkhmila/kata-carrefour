variable "name" {
  type = string
}

variable "region" {
  type = string
}

variable "subnet_cidr" {
  type = string
}

variable "secondary_ranges" {
  type    = map(string)
  default = {}
}
