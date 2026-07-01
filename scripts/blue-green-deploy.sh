#!/bin/bash

set -e

COMPONENT="$1" # backend or frontend
ACTION="$2"    # deploy or destroy
IMAGE="$3"     # docker image tag

if [ -z "$COMPONENT" ] || [ -z "$ACTION" ]; then
    echo "Usage: ./scripts/blue-green-deploy.sh <backend|frontend> <deploy|destroy> [image]"
    exit 1
fi

if [ "$ACTION" == "deploy" ]; then
    if [ -z "$IMAGE" ]; then
        echo "Usage: ./scripts/blue-green-deploy.sh <backend|frontend> deploy <image>"
        exit 1
    fi

    echo "===== Blue-Green Deploy for $COMPONENT ====="
    
    # Get active color from Service selector
    ACTIVE_COLOR=$(kubectl get svc $COMPONENT -o jsonpath='{.spec.selector.color}' 2>/dev/null || echo "none")
    
    if [ "$ACTIVE_COLOR" == "blue" ]; then
        TARGET_COLOR="green"
    else
        TARGET_COLOR="blue"
    fi

    echo "Active color: $ACTIVE_COLOR"
    echo "Deploying new version to: $TARGET_COLOR"
    echo "Using image: $IMAGE"

    # Replace image placeholder (latest) with the dynamic build image and apply
    sed "s|image: docker.io/preethamvs6/ecommerce-${COMPONENT}:latest|image: $IMAGE|g" kubernetes/${COMPONENT}-deployment-${TARGET_COLOR}.yaml | kubectl apply -f -

    echo "Waiting for rollout to complete..."
    kubectl rollout status deployment/${COMPONENT}-${TARGET_COLOR}

    echo "Switching traffic to $TARGET_COLOR..."
    kubectl patch svc $COMPONENT -p "{\"spec\":{\"selector\":{\"app\":\"$COMPONENT\",\"color\":\"$TARGET_COLOR\"}}}"

    echo "Blue-Green switch complete for $COMPONENT!"

elif [ "$ACTION" == "destroy" ]; then
    COLOR="$3"
    if [ -z "$COLOR" ]; then
        echo "Usage: ./scripts/blue-green-deploy.sh <backend|frontend> destroy <blue|green>"
        exit 1
    fi
    kubectl delete deployment ${COMPONENT}-${COLOR} --ignore-not-found
    echo "Destroyed $COMPONENT color: $COLOR"
else
    echo "Unknown action: $ACTION"
    exit 1
fi
