# Quick Docker Reference

## Build Image

```bash
docker build -t math-is-fun:latest .
```

Or use the script:
```bash
./docker-build.sh
```

## Test Locally

```bash
docker run -p 3000:3000 math-is-fun:latest
```

## Publish to Docker Hub

```bash
# Login
docker login

# Tag
docker tag math-is-fun:latest yourusername/math-is-fun:latest

# Push
docker push yourusername/math-is-fun:latest
```

Or use the script:
```bash
./docker-publish.sh dockerhub yourusername
```

## Publish to GitHub Container Registry

```bash
# Login
docker login ghcr.io -u YOUR_GITHUB_USERNAME

# Tag and push
docker tag math-is-fun:latest ghcr.io/YOUR_GITHUB_USERNAME/math-is-fun:latest
docker push ghcr.io/YOUR_GITHUB_USERNAME/math-is-fun:latest
```

Or use the script:
```bash
./docker-publish.sh ghcr yourusername
```

## Update Helm Chart

After publishing, update `chart/mathisfun/values.yaml`:

```yaml
image:
  repository: yourusername/math-is-fun  # or ghcr.io/username/math-is-fun
  tag: latest
```

## Run with Persistent Storage

```bash
docker run -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  math-is-fun:latest
```

