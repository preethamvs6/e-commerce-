#!/usr/bin/env bash

# ==============================================================================
# QuantumShop - Kubernetes Application Clean-up
# ==============================================================================

set -euo pipefail

echo -e "\033[0;31m<<< Deleting QuantumShop Application from Kubernetes...\033[0m\n"

# 1. Routing
kubectl delete -f kubernetes/ingress.yaml || true

# 2. Microservices
kubectl delete -f kubernetes/frontend-deployment.yaml || true
kubectl delete -f kubernetes/backend-deployment.yaml || true

# 3. Database & Storage
kubectl delete -f kubernetes/db-deployment.yaml || true
kubectl delete -f kubernetes/db-init-configmap.yaml || true
kubectl delete -f kubernetes/mysql-pv.yaml || true

# 4. Configs & Secrets
kubectl delete -f kubernetes/secrets.yaml || true
kubectl delete -f kubernetes/configmap.yaml || true

echo -e "\n\033[0;31m<<< Cleanup completed successfully!\033[0m"
