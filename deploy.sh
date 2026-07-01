#!/usr/bin/env bash

# ==============================================================================
# QuantumShop - Kubernetes Application Deployer
# ==============================================================================

set -euo pipefail

echo -e "\033[0;34m>>> Deploying QuantumShop Application to Kubernetes...\033[0m\n"

# 1. Configs & Secrets
echo -e "\033[0;32m[1/4] Applying configurations and secrets...\033[0m"
kubectl apply -f kubernetes/configmap.yaml
kubectl apply -f kubernetes/secrets.yaml

# 2. Database & Storage
echo -e "\033[0;32m[2/4] Applying persistent storage and database...\033[0m"
kubectl apply -f kubernetes/mysql-pv.yaml
kubectl apply -f kubernetes/db-init-configmap.yaml
kubectl apply -f kubernetes/db-deployment.yaml

# 3. Microservices
echo -e "\033[0;32m[3/4] Deploying backend and frontend microservices (Blue)...\033[0m"
kubectl apply -f kubernetes/backend-deployment-blue.yaml
kubectl apply -f kubernetes/backend-service.yaml
kubectl apply -f kubernetes/frontend-deployment-blue.yaml
kubectl apply -f kubernetes/frontend-service.yaml

# 4. Routing
echo -e "\033[0;32m[4/4] Applying Ingress routing configurations...\033[0m"
kubectl apply -f kubernetes/ingress.yaml

echo -e "\n\033[0;34m>>> Deploy completed successfully! Run 'kubectl get pods' to check status.\033[0m"
