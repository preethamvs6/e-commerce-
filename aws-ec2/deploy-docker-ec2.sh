#!/usr/bin/env bash

# ==============================================================================
# QuantumShop - AWS EC2 Docker Compose Deployer
# ==============================================================================
# This script automates installing Docker, Docker Compose, Git, and deploying 
# the QuantumShop application on a fresh Ubuntu 22.04 / 24.04 LTS EC2 instance.
# ==============================================================================

set -euo pipefail

# Text Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== QuantumShop - EC2 Docker Compose Deployment Initializer ===${NC}\n"

# 1. Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}Error: This script must be run as root (sudo).${NC}" 
   exit 1
fi

# 2. Update System Packages
echo -e "${GREEN}[1/5] Updating and upgrading system packages...${NC}"
apt-get update -y
apt-get upgrade -y
apt-get install -y curl git apt-transport-https ca-certificates gnupg lsb-release

# 3. Install Docker Engine and Docker Compose Plugin
if ! command -v docker &> /dev/null; then
    echo -e "${GREEN}[2/5] Docker not found. Installing Docker Engine...${NC}"
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # Enable and start docker
    systemctl enable docker
    systemctl start docker
    echo -e "${GREEN}Docker Engine installed successfully!${NC}"
else
    echo -e "${GREEN}[2/5] Docker is already installed. Skipping installation...${NC}"
fi

# 4. Configure permissions for non-root user (ubuntu)
CURRENT_USER=${SUDO_USER:-ubuntu}
if id "$CURRENT_USER" &>/dev/null; then
    echo -e "${GREEN}[3/5] Adding user '${CURRENT_USER}' to the docker group...${NC}"
    usermod -aG docker "$CURRENT_USER"
fi

# 5. Clone the Repository
REPO_DIR="/home/${CURRENT_USER}/ecommerce"
REPO_URL="https://github.com/preethamvs6/e-commerce-.git" # Default repository URL

echo -e "${GREEN}[4/5] Checking repository deployment...${NC}"
if [ ! -d "$REPO_DIR" ]; then
    echo -e "Cloning repository to ${REPO_DIR}..."
    git clone "$REPO_URL" "$REPO_DIR"
    chown -R "${CURRENT_USER}:${CURRENT_USER}" "$REPO_DIR"
else
    echo -e "Repository directory already exists. Pulling latest code..."
    cd "$REPO_DIR"
    git pull || echo -e "${YELLOW}Could not execute git pull. Continuing with existing files...${NC}"
fi

# 6. Initialize Environment Variables and Launch App
echo -e "${GREEN}[5/5] Launching QuantumShop with Docker Compose...${NC}"
cd "$REPO_DIR"

# Create a sample .env file if it does not exist
if [ ! -f .env ]; then
    echo -e "Creating default .env configuration..."
    cat <<EOT > .env
DOCKERHUB_USERNAME=preethamvs6
DB_NAME=ecommerce_db
DB_PASSWORD=rootpassword
EOT
    chown "${CURRENT_USER}:${CURRENT_USER}" .env
fi

# Run docker compose
echo -e "Starting containers in detached mode..."
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

echo -e "\n${GREEN}=== Deployment Complete! ===${NC}"
echo -e "Access your application at: ${YELLOW}http://<EC2-PUBLIC-IP>${NC}"
echo -e "Access Grafana dashboard at: ${YELLOW}http://<EC2-PUBLIC-IP>:3001${NC}"
echo -e "\nTo view logs, run:"
echo -e "  ${BLUE}docker compose -f docker-compose.prod.yml logs -f${NC}"
echo -e "To stop the application, run:"
echo -e "  ${BLUE}docker compose -f docker-compose.prod.yml down${NC}\n"
