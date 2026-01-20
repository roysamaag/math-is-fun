Helm chart for the MathIsFun app

Quick start

Package chart:

```bash
helm package chart/mathisfun
```

Install locally (replace `my-release` and namespace as needed):

```bash
helm install my-release chart/mathisfun --namespace default --create-namespace
```

Upgrade with new values or image tag:

```bash
helm upgrade my-release chart/mathisfun -f values.yaml --namespace default
```

Notes:
- Build and push a container image for your app and set `image.repository` and `image.tag` in `values.yaml` before installing in a cluster.
- The default image is `nginx:latest` as a placeholder for static sites.
