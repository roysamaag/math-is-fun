This workspace includes a Helm chart at `chart/mathisfun` to deploy the MathIsFun static web app.

Files added:
- chart/mathisfun/Chart.yaml
- chart/mathisfun/values.yaml
- chart/mathisfun/templates/* (deployment, service, ingress, helpers, NOTES)

Next steps:
1. Build and push a Docker image for your app.
2. Update `chart/mathisfun/values.yaml` image fields.
3. Run `helm install` as shown in the chart README.
