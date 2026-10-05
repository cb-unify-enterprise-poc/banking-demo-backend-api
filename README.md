# banking-demo-backend-api

Application/business-logic tier of the CloudBees Unify banking demo
(Meridian Bank). Express service: mock auth (base64 token — demo-only,
not real security), ownership checks, transfer validation (balance and
currency checks), orchestrates calls to `data-service`.

Part of a 3-repo demo app:
- [`banking-demo-frontend`](https://github.com/cb-unify-enterprise-poc/banking-demo-frontend) — presentation, CloudBees Unify native workflow
- [`banking-demo-backend-api`](.) (this repo) — application/business logic, Jenkins pipeline
- [`banking-demo-data-service`](https://github.com/cb-unify-enterprise-poc/banking-demo-data-service) — static/in-memory data tier, CloudBees Unify native workflow

## Run locally

```bash
npm install
DATA_SERVICE_URL=http://localhost:5000 npm start
# http://localhost:4000
```

## CI/CD: Jenkins → CloudBees Unify

`Jenkinsfile` demonstrates a Unify/Jenkins integration pipeline:

1. **Build** — `npm install`
2. **Test** — runs `scripts/generate-test-report.js`, which writes a
   **canned/simulated** JUnit report (`test-reports/junit.xml`) for demo
   purposes — there's no real test suite here. The `junit` pipeline step
   publishes it to Unify's **Test results** tab.
3. **Build image** — `docker build`
4. **Push to Docker Hub** — pushes `cloudbeesdemo/banking-demo-backend-api:<build-number>`
5. **Register artifact in Unify** — `registerBuildArtifactMetadata` records
   the pushed image as a build artifact against this component, so it can
   be picked up later by Unify release orchestration.

The pipeline runs on a Kubernetes agent pod (CloudBees CI on Kubernetes)
with two containers: `node` (for `npm install`/`npm test`) and `kaniko`
(for the image build/push — daemonless, so no privileged container is
needed on the agent pod).

### Prerequisites (configured once, outside this repo)

- This Jenkins controller/operations center is integrated with CloudBees
  Unify (CI/Jenkins integration + CloudBees Platform Insights plugin), so
  `junit` results and `registerBuildArtifactMetadata` calls actually surface
  against this component in Unify.
- JUnit plugin installed on the controller.
- The Kubernetes plugin configured so the controller can provision agent
  pods (CloudBees CI on Kubernetes has this out of the box).
- A Kubernetes Secret of type `kubernetes.io/dockerconfigjson`, named
  `dockerhub-regcred`, in the namespace your Jenkins agents run in:
  ```bash
  kubectl create secret docker-registry dockerhub-regcred \
    --docker-server=https://index.docker.io/v1/ \
    --docker-username=cloudbeesdemo \
    --docker-password='<your-docker-hub-password-or-token>' \
    --namespace=<agent-namespace>
  ```
  Kaniko reads registry auth from this mounted `config.json` — **not**
  from a Jenkins credential, and the password is never stored in this
  repo.

## Build & push the image manually

```bash
docker build -t cloudbeesdemo/banking-demo-backend-api:latest .
docker push cloudbeesdemo/banking-demo-backend-api:latest
```

## Deploy to Kubernetes

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/backend-api.yaml
```

`backend-api` is `ClusterIP` — internal only, called by `frontend`'s
nginx proxy, never exposed externally.
