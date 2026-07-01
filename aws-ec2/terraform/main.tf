terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# 1. Look up the latest Ubuntu 22.04 LTS AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
  owners = ["099720109477"] # Canonical
}

# 2. Virtual Private Cloud (VPC) Setup
resource "aws_vpc" "quantumshop_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "quantumshop-vpc"
  }
}

# Public Subnet
resource "aws_subnet" "quantumshop_public_subnet" {
  vpc_id                  = aws_vpc.quantumshop_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "${var.aws_region}a"

  tags = {
    Name = "quantumshop-public-subnet"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "quantumshop_igw" {
  vpc_id = aws_vpc.quantumshop_vpc.id

  tags = {
    Name = "quantumshop-igw"
  }
}

# Route Table for Public Subnet
resource "aws_route_table" "quantumshop_public_rt" {
  vpc_id = aws_vpc.quantumshop_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.quantumshop_igw.id
  }

  tags = {
    Name = "quantumshop-public-route-table"
  }
}

# Route Table Association
resource "aws_route_table_association" "quantumshop_public_association" {
  subnet_id      = aws_subnet.quantumshop_public_subnet.id
  route_table_id = aws_route_table.quantumshop_public_rt.id
}

# 3. Security Group Config
resource "aws_security_group" "quantumshop_sg" {
  name        = "quantumshop-ec2-security-group"
  description = "Allow inbound traffic for QuantumShop and admin SSH access"
  vpc_id      = aws_vpc.quantumshop_vpc.id

  # SSH Access
  ingress {
    description = "SSH access from anywhere"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # React Frontend (HTTP)
  ingress {
    description = "Web Application (HTTP)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # React Frontend (HTTPS)
  ingress {
    description = "Web Application (HTTPS)"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Spring Boot REST API
  ingress {
    description = "Spring Boot backend REST API / Actuator"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Grafana Dashboard
  ingress {
    description = "Grafana dashboard"
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound Rules
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "quantumshop-sg"
  }
}

# 4. EC2 Instance Provisioning
resource "aws_instance" "quantumshop" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.quantumshop_public_subnet.id
  vpc_security_group_ids = [aws_security_group.quantumshop_sg.id]
  key_name               = var.key_name != "" ? var.key_name : null

  # Root disk size sizing
  root_block_device {
    volume_size = 20 # 20GB disk space
    volume_type = "gp3"
  }

  # User Data Script to configure Docker, Docker Compose, Git and launch services
  user_data = <<-EOF
              #!/usr/bin/env bash
              set -euo pipefail

              # Update system
              apt-get update -y
              apt-get install -y curl git apt-transport-https ca-certificates gnupg lsb-release

              # Install Docker
              mkdir -p /etc/apt/keyrings
              curl -fsSL https://download.download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes || \
              curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes

              echo \
                "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
                $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

              apt-get update -y
              apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

              # Enable Docker service
              systemctl enable docker
              systemctl start docker

              # Configure permissions for ubuntu user
              usermod -aG docker ubuntu

              # Clone application repository
              REPO_DIR="/home/ubuntu/ecommerce"
              git clone "${var.repo_url}" "$REPO_DIR"
              chown -R ubuntu:ubuntu "$REPO_DIR"

              # Set environment variables for docker-compose
              cd "$REPO_DIR"
              cat <<EOT > .env
              DOCKERHUB_USERNAME=${var.dockerhub_username}
              DB_NAME=${var.db_name}
              DB_PASSWORD=${var.db_password}
              EOT
              chown ubuntu:ubuntu .env

              # Pull images and start the container group
              docker compose -f docker-compose.prod.yml pull
              docker compose -f docker-compose.prod.yml up -d
              EOF

  tags = {
    Name = "quantumshop-server"
  }
}
