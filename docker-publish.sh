#!/bin/bash

# Docker Publish Script for Math Is Fun
# Usage: ./docker-publish.sh [registry] [username] [tag]
# Example: ./docker-publish.sh dockerhub myusername latest
# Example: ./docker-publish.sh ghcr myusername v1.0.0

set -e

REGISTRY=${1:-dockerhub}
USERNAME=${2:-""}
TAG=${3:-latest}
IMAGE_NAME="math-is-fun"

if [ -z "$USERNAME" ]; then
    echo "❌ Username is required"
    echo "Usage: ./docker-publish.sh [registry] [username] [tag]"
    echo "Example: ./docker-publish.sh dockerhub myusername latest"
    exit 1
fi

echo "🚀 Publishing to $REGISTRY..."

# Build first
echo "📦 Building image..."
docker build -t $IMAGE_NAME:$TAG .

case $REGISTRY in
    dockerhub|docker)
        echo "📤 Publishing to Docker Hub..."
        docker tag $IMAGE_NAME:$TAG $USERNAME/$IMAGE_NAME:$TAG
        docker tag $IMAGE_NAME:$TAG $USERNAME/$IMAGE_NAME:latest
        docker push $USERNAME/$IMAGE_NAME:$TAG
        docker push $USERNAME/$IMAGE_NAME:latest
        echo "✅ Published to: https://hub.docker.com/r/$USERNAME/$IMAGE_NAME"
        ;;
    
    ghcr|github)
        echo "📤 Publishing to GitHub Container Registry..."
        docker tag $IMAGE_NAME:$TAG ghcr.io/$USERNAME/$IMAGE_NAME:$TAG
        docker tag $IMAGE_NAME:$TAG ghcr.io/$USERNAME/$IMAGE_NAME:latest
        docker push ghcr.io/$USERNAME/$IMAGE_NAME:$TAG
        docker push ghcr.io/$USERNAME/$IMAGE_NAME:latest
        echo "✅ Published to: https://github.com/$USERNAME?tab=packages"
        ;;
    
    acr|azure)
        if [ -z "$ACR_NAME" ]; then
            echo "❌ ACR_NAME environment variable not set"
            echo "Set it with: export ACR_NAME=yourregistry"
            exit 1
        fi
        echo "📤 Publishing to Azure Container Registry..."
        az acr login --name $ACR_NAME
        docker tag $IMAGE_NAME:$TAG $ACR_NAME.azurecr.io/$IMAGE_NAME:$TAG
        docker tag $IMAGE_NAME:$TAG $ACR_NAME.azurecr.io/$IMAGE_NAME:latest
        docker push $ACR_NAME.azurecr.io/$IMAGE_NAME:$TAG
        docker push $ACR_NAME.azurecr.io/$IMAGE_NAME:latest
        echo "✅ Published to: $ACR_NAME.azurecr.io"
        ;;
    
    gcr|google)
        if [ -z "$GCP_PROJECT" ]; then
            echo "❌ GCP_PROJECT environment variable not set"
            exit 1
        fi
        echo "📤 Publishing to Google Container Registry..."
        gcloud auth configure-docker
        docker tag $IMAGE_NAME:$TAG gcr.io/$GCP_PROJECT/$IMAGE_NAME:$TAG
        docker tag $IMAGE_NAME:$TAG gcr.io/$GCP_PROJECT/$IMAGE_NAME:latest
        docker push gcr.io/$GCP_PROJECT/$IMAGE_NAME:$TAG
        docker push gcr.io/$GCP_PROJECT/$IMAGE_NAME:latest
        echo "✅ Published to: gcr.io/$GCP_PROJECT/$IMAGE_NAME"
        ;;
    
    ecr|aws)
        if [ -z "$AWS_REGION" ] || [ -z "$AWS_ACCOUNT_ID" ]; then
            echo "❌ AWS_REGION and AWS_ACCOUNT_ID environment variables required"
            exit 1
        fi
        echo "📤 Publishing to Amazon ECR..."
        aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
        docker tag $IMAGE_NAME:$TAG $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$IMAGE_NAME:$TAG
        docker tag $IMAGE_NAME:$TAG $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$IMAGE_NAME:latest
        docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$IMAGE_NAME:$TAG
        docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$IMAGE_NAME:latest
        echo "✅ Published to: $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$IMAGE_NAME"
        ;;
    
    *)
        echo "❌ Unknown registry: $REGISTRY"
        echo "Supported registries: dockerhub, ghcr, acr, gcr, ecr"
        exit 1
        ;;
esac

echo "✨ Done!"

