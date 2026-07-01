variable "aws_region" {
  type        = string
  description = "The AWS region to deploy the resources in."
  default     = "us-east-1"
}

variable "instance_type" {
  type        = string
  description = "The EC2 instance type to use. t3.medium is recommended."
  default     = "t3.medium"
}

variable "key_name" {
  type        = string
  description = "The name of an existing AWS Key Pair to allow SSH access to the EC2 instance."
  default     = ""
}

variable "repo_url" {
  type        = string
  description = "The Git repository URL of the QuantumShop application."
  default     = "https://github.com/preethamvs6/e-commerce-.git"
}

variable "dockerhub_username" {
  type        = string
  description = "The Docker Hub username under which QuantumShop images are hosted."
  default     = "preethamvs6"
}

variable "db_name" {
  type        = string
  description = "The database name for the MySQL container."
  default     = "ecommerce_db"
}

variable "db_password" {
  type        = string
  description = "The database root password."
  default     = "rootpassword"
  sensitive   = true
}
