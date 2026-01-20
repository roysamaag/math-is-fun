# Docker Image Publishing Guide

This guide covers how to build and publish the Math Is Fun Docker image to various container registries.

## Prerequisites

- Docker installed and running
- Account on your chosen container registry (Docker Hub, GitHub Container Registry, Azure Container Registry, etc.)

## Quick Start

### Build the Image

```bash
docker build -t math-is-fun:latest .
```

### Test Locally

```bash
docker run -p 3000:3000 math-is-fun:latest
```

Visit `http://localhost:3000` to test.

## Publishing to Docker Hub

### Step 1: Login to Docker Hub

```bash
docker login
```

### Step 2: Tag Your Image

Replace `yourusername` with your Docker Hub username:

```bash
docker tag math-is-fun:latest yourusername/math-is-fun:latest
docker tag math-is-fun:latest yourusername/math-is-fun:1.0.0
```

### Step 3: Push to Docker Hub

```bash
docker push yourusername/math-is-fun:latest
docker push yourusername/math-is-fun:1.0.0
```

### Step 4: Verify

Visit `https://hub.docker.com/r/yourusername/math-is-fun` to see your published image.

## Publishing to GitHub Container Registry (GHCR)

### Step 1: Create GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate token with `write:packages` permission
3. Copy the token

### Step 2: Login to GHCR

```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

Or interactively:
```bash
docker login ghcr.io -u YOUR_GITHUB_USERNAME
```

### Step 3: Tag Your Image

```bash
docker tag math-is-fun:latest ghcr.io/YOUR_GITHUB_USERNAME/math-is-fun:latest
docker tag math-is-fun:latest ghcr.io/YOUR_GITHUB_USERNAME/math-is-fun:1.0.0
```

### Step 4: Push to GHCR

```bash
docker push ghcr.io/YOUR_GITHUB_USERNAME/math-is-fun:latest
docker push ghcr.io/YOUR_GITHUB_USERNAME/math-is-fun:1.0.0
```

### Step 5: Make Package Public (Optional)

1. Go to your GitHub repository
2. Click on "Packages" on the right
3. Click on your package
4. Go to "Package settings" → "Change visibility" → "Public"

## Publishing to Azure Container Registry (ACR)

### Step 1: Create ACR (if not exists)

```bash
az acr create --resource-group myResourceGroup --name myregistry --sku Basic
```

### Step 2: Login to ACR

```bash
az acr login --name myregistry
```

### Step 3: Build and Push

```bash
# Build directly in ACR
az acr build --registry myregistry --image math-is-fun:latest .

# Or build locally and push
docker tag math-is-fun:latest myregistry.azurecr.io/math-is-fun:latest
docker push myregistry.azurecr.io/math-is-fun:latest
```

## Publishing to Google Container Registry (GCR)

### Step 1: Configure gcloud

```bash
gcloud auth configure-docker
```

### Step 2: Tag and Push

```bash
docker tag math-is-fun:latest gcr.io/YOUR_PROJECT_ID/math-is-fun:latest
docker push gcr.io/YOUR_PROJECT_ID/math-is-fun:latest
```

## Publishing to Amazon ECR

### Step 1: Create ECR Repository

```bash
aws ecr create-repository --repository-name math-is-fun --region us-east-1
```

### Step 2: Login to ECR

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
```

### Step 3: Tag and Push

```bash
docker tag math-is-fun:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/math-is-fun:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/math-is-fun:latest
```

## Using Helper Scripts

### Build Script

```bash
./docker-build.sh
```

### Publish Script

```bash
./docker-publish.sh dockerhub yourusername
# or
./docker-publish.sh ghcr yourusername
# or
./docker-publish.sh acr myregistry
```

## Versioning Strategy

### Semantic Versioning

Tag your images with semantic versions:

```bash
docker tag math-is-fun:latest yourusername/math-is-fun:1.0.0
docker tag math-is-fun:latest yourusername/math-is-fun:1.0
docker tag math-is-fun:latest yourusername/math-is-fun:1
docker push yourusername/math-is-fun:1.0.0
docker push yourusername/math-is-fun:1.0
docker push yourusername/math-is-fun:1
docker push yourusername/math-is-fun:latest
```

### Git-based Tagging

```bash
VERSION=$(git describe --tags --always)
docker tag math-is-fun:latest yourusername/math-is-fun:$VERSION
docker push yourusername/math-is-fun:$VERSION
```

## Multi-Architecture Builds

### Build for Multiple Platforms

```bash
docker buildx create --use
docker buildx build --platform linux/amd64,linux/arm64 -t yourusername/math-is-fun:latest --push .
```

## Environment Variables

When running the container, you can set environment variables:

```bash
docker run -p 3000:3000 \
  -e PORT=3000 \
  -e NODE_ENV=production \
  math-is-fun:latest
```

## Persistent Storage

For production, mount a volume for the database:

```bash
docker run -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -e DB_PATH=/app/data/mathgame.db \
  math-is-fun:latest
```

## Health Checks

The Dockerfile includes a health check. Monitor with:

```bash
docker ps
docker inspect --format='{{.State.Health.Status}}' <container-id>
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Push Docker Image

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Login to Docker Hub
        uses: docker/login-action@v1
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build and push
        uses: docker/build-push-action@v2
        with:
          context: .
          push: true
          tags: yourusername/math-is-fun:latest
```

## Troubleshooting

### Build Fails

```bash
# Clean build
docker build --no-cache -t math-is-fun:latest .
```

### Push Fails - Authentication

```bash
# Re-login
docker logout
docker login
```

### Image Too Large

- Use multi-stage builds
- Use .dockerignore properly
- Use alpine base images (already done)

## Best Practices

1. **Always tag with version numbers** - Don't just use `latest`
2. **Use semantic versioning** - Follow semver.org
3. **Scan for vulnerabilities** - Use `docker scan`
4. **Keep images small** - Use multi-stage builds and alpine images
5. **Use specific tags in production** - Avoid `latest` in production
6. **Sign your images** - Use Docker Content Trust for security

## Next Steps

1. Choose your registry
2. Build and test locally
3. Tag appropriately
4. Push to registry
5. Update your Helm chart values.yaml with the new image location

