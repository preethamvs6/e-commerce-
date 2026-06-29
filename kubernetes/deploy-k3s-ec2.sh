#!/usr/bin/env bash

# ==============================================================================
# QuantumShop - K3s Deployment Script for AWS EC2
# ==============================================================================
# This script guides and automates setting up a lightweight Kubernetes (K3s) 
# cluster on a single AWS EC2 instance (Ubuntu 22.04 LTS / 24.04 LTS recommended).
# Minimum Instance Requirement: t3.medium (2 vCPUs, 4GB RAM)
# ==============================================================================

set -euo pipefail

# Text Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== QuantumShop - K3s EC2 Deployment Initializer ===${NC}\n"

# 1. Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}Error: This script must be run as root (sudo).${NC}" 
   exit 1
fi

# 2. System updates
echo -e "${GREEN}[1/5] Updating system packages...${NC}"
apt-get update -y && apt-get upgrade -y
apt-get install -y curl git software-properties-common

# 3. Install K3s (with default Traefik ingress controller)
echo -e "${GREEN}[2/5] Installing lightweight Kubernetes (K3s)...${NC}"
# We disable the default Traefik if we want to run Nginx ingress, 
# but Traefik is perfect for single EC2 deployments out-of-the-box.
# We install standard K3s:
curl -sfL https://get.k3s.io | sh -

# 4. Verify installation
echo -e "${GREEN}[3/5] Verifying cluster status...${NC}"
sleep 10
kubectl get nodes

# 5. Configure Kubeconfig permissions for non-root user (e.g. ubuntu)
echo -e "${GREEN}[4/5] Setting up local user Kubeconfig access...${NC}"
CURRENT_USER=${SUDO_USER:-ubuntu}
USER_HOME=$(eval echo "~$CURRENT_USER")

mkdir -p "$USER_HOME/.kube"
cp /etc/rancher/k3s/k3s.yaml "$USER_HOME/.kube/config"
chown -R "$CURRENT_USER:$CURRENT_USER" "$USER_HOME/.kube"
chmod 600 "$USER_HOME/.kube/config"

echo -e "${GREEN}[5/5] Setup complete!${NC}\n"

echo -e "${YELLOW}======================================================================${NC}"
echo -e "${YELLOW}               IMPORTANT AWS SECURITY GROUP REQS                      ${NC}"
echo -e "${YELLOW}======================================================================${NC}"
echo -e "Make sure the AWS Security Group for your EC2 instance allows:${NC}"
echo -e "  - Port 22 (SSH)       -> For administrator access"
echo -e "  - Port 80 (HTTP)      -> For client access to React frontend"
echo -e "  - Port 443 (HTTPS)    -> For secure client access"
echo -e "  - Port 6443 (K8s API) -> Optional (only if managing cluster from local machine)"
echo -e "${YELLOW}======================================================================${NC}\n"

echo -e "${BLUE}How to Deploy QuantumShop on this Instance:${NC}"
echo -e "1. Clone this repository on the EC2 instance:"
echo -e "   ${GREEN}git clone <your-repo-url> ecommerce && cd ecommerce${NC}"
echo -e "2. Build and push your Docker images to Docker Hub (or run local builds)."
echo -e "3. Apply the manifests in order:"
echo -e "   ${GREEN}kubectl apply -f kubernetes/configmap.yaml${NC}"
echo -e "   ${GREEN}kubectl apply -f kubernetes/secrets.yaml${NC}"
echo -e "   ${GREEN}kubectl apply -f kubernetes/db-init-configmap.yaml${NC}"
echo -e "   ${GREEN}kubectl apply -f kubernetes/db-deployment.yaml${NC}"
echo -e "   ${GREEN}kubectl apply -f kubernetes/backend-deployment.yaml${NC}"
echo -e "   ${GREEN}kubectl apply -f kubernetes/frontend-deployment.yaml${NC}"
echo -e "   ${GREEN}kubectl apply -f kubernetes/ingress.yaml${NC}"
echo -e "4. Check progress:"
echo -e "   ${GREEN}kubectl get pods -w${NC}"
echo -e "5. Access your app using the EC2 Public IP or DNS at: ${GREEN}http://<EC2-PUBLIC-IP>${NC}"
