#!/bin/bash

# Docker Build Script for Math Is Fun
# Usage: ./docker-build.sh [tag] [--no-cache]

set -e

IMAGE_NAME="math-is-fun"
TAG=${1:-latest}
NO_CACHE=${2:-""}

echo "🐳 Building Docker image: $IMAGE_NAME:$TAG"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build arguments
BUILD_ARGS=""
if [ "$NO_CACHE" == "--no-cache" ]; then
    BUILD_ARGS="--no-cache"
    echo "⚠️  Building without cache..."
fi

# Build the image
docker build $BUILD_ARGS -t $IMAGE_NAME:$TAG .

echo "✅ Build complete!"
echo ""
echo "To test locally:"
echo "  docker run -p 3000:3000 $IMAGE_NAME:$TAG"
echo ""
echo "To tag for registry:"
echo "  docker tag $IMAGE_NAME:$TAG yourregistry/$IMAGE_NAME:$TAG"

