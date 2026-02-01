# Quickstart: Containerization & AI Deployment

**Feature**: 005-containerization-deploy
**Date**: 2026-01-26
**Purpose**: Step-by-step guide for deploying Todo Chatbot to Minikube using AI-assisted tools

---

## Prerequisites

### Required Tools
- ✅ Docker installed and running
- ✅ Minikube running with Docker driver
- ✅ kubectl CLI installed
- ✅ Docker AI (Gordon) installed
- ✅ kubectl-ai installed
- ✅ kagent installed
- ✅ Helm 3+ installed

### Required Configuration
- ✅ API keys configured for kubectl-ai:
  - `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` set in environment
- ✅ Minikube cluster running:
  ```bash
  minikube status
  # Should show: Running
  ```
- ✅ Namespace created:
  ```bash
  kubectl create namespace todo-app-dev
  kubectl config set-context --current --namespace=todo-app-dev
  ```

### Verify Prerequisites
```bash
# Check Docker
docker --version
docker ps

# Check Minikube
minikube status

# Check kubectl
kubectl version --client
kubectl get nodes

# Check Helm
helm version

# Check API keys
echo $OPENAI_API_KEY
# or
echo $ANTHROPIC_API_KEY
```

---

## Phase 1: Build Container Images

### Step 1.1: Generate Frontend Dockerfile

Navigate to frontend directory and use Docker AI to generate optimized Dockerfile:

```bash
cd frontend

# Use Docker AI to analyze and generate Dockerfile
docker ai "create optimized multi-stage Dockerfile for Next.js 14 frontend with Node.js 18 Alpine base, production build, non-root user, and port 3000"

# Review generated Dockerfile
cat Dockerfile

# Optional: Use template from contracts/
# cp ../specs/005-containerization-deploy/contracts/frontend.Dockerfile ./Dockerfile
```

### Step 1.2: Build Frontend Image

```bash
# Build image
docker build -t todo-frontend:latest .

# Verify image size (should be < 500MB)
docker images | grep todo-frontend

# Test image locally (optional)
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://localhost:8080 todo-frontend:latest
# Open browser: http://localhost:3000
# Press Ctrl+C to stop
```

### Step 1.3: Generate Backend Dockerfile

Navigate to backend directory and use Docker AI:

```bash
cd ../backend

# Use Docker AI to analyze and generate Dockerfile
docker ai "create optimized multi-stage Dockerfile for FastAPI Python backend with Python 3.9 Alpine base, uvicorn server, health check endpoint at /health, non-root user, and port 8080"

# Review generated Dockerfile
cat Dockerfile

# Optional: Use template from contracts/
# cp ../specs/005-containerization-deploy/contracts/backend.Dockerfile ./Dockerfile
```

### Step 1.4: Build Backend Image

```bash
# Build image
docker build -t todo-backend:latest .

# Verify image size (should be < 300MB)
docker images | grep todo-backend

# Test image locally (optional)
docker run -p 8080:8080 \
  -e DATABASE_URL="postgresql://neondb_owner:npg_EjCo5xMe1bRT@ep-long-field-ah05rknq-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require" \
  -e JWT_SECRET="dev-secret" \
  -e GEMINI_API_KEY="" \
  todo-backend:latest
# Open browser: http://localhost:8080/health
# Press Ctrl+C to stop
```

---

## Phase 2: Load Images to Minikube

### Step 2.1: Load Frontend Image

```bash
# Load image to Minikube's Docker daemon
minikube image load todo-frontend:latest

# Verify image is available in Minikube
minikube image ls | grep todo-frontend
```

### Step 2.2: Load Backend Image

```bash
# Load image to Minikube's Docker daemon
minikube image load todo-backend:latest

# Verify image is available in Minikube
minikube image ls | grep todo-backend
```

---

## Phase 3: Generate Kubernetes Manifests

### Step 3.1: Generate Frontend Deployment

Use kubectl-ai to generate deployment manifest:

```bash
kubectl ai "create deployment named todo-frontend with image todo-frontend:latest, 2 replicas, container port 3000, environment variable NEXT_PUBLIC_API_URL=http://todo-backend-service:8080, resource requests 100m CPU and 128Mi memory, resource limits 500m CPU and 512Mi memory, readiness probe HTTP GET / on port 3000, liveness probe HTTP GET / on port 3000, imagePullPolicy Never"

# Save output to file
kubectl ai "create deployment named todo-frontend with image todo-frontend:latest, 2 replicas, container port 3000, environment variable NEXT_PUBLIC_API_URL=http://todo-backend-service:8080, resource requests 100m CPU and 128Mi memory, resource limits 500m CPU and 512Mi memory, readiness probe HTTP GET / on port 3000, liveness probe HTTP GET / on port 3000, imagePullPolicy Never" > frontend-deployment.yaml

# Review generated manifest
cat frontend-deployment.yaml
```

### Step 3.2: Generate Frontend Service

```bash
kubectl ai "create NodePort service named todo-frontend-service for deployment todo-frontend exposing port 80 targeting container port 3000"

# Save output to file
kubectl ai "create NodePort service named todo-frontend-service for deployment todo-frontend exposing port 80 targeting container port 3000" > frontend-service.yaml

# Review generated manifest
cat frontend-service.yaml
```

### Step 3.3: Generate Backend Deployment

```bash
kubectl ai "create deployment named todo-backend with image todo-backend:latest, 1 replica, container port 8080, environment variables from secret todo-app-secrets, resource requests 100m CPU and 128Mi memory, resource limits 500m CPU and 512Mi memory, readiness probe HTTP GET /health on port 8080, liveness probe HTTP GET /health on port 8080, imagePullPolicy Never"

# Save output to file
kubectl ai "create deployment named todo-backend with image todo-backend:latest, 1 replica, container port 8080, environment variables from secret todo-app-secrets, resource requests 100m CPU and 128Mi memory, resource limits 500m CPU and 512Mi memory, readiness probe HTTP GET /health on port 8080, liveness probe HTTP GET /health on port 8080, imagePullPolicy Never" > backend-deployment.yaml

# Review generated manifest
cat backend-deployment.yaml
```

### Step 3.4: Generate Backend Service

```bash
kubectl ai "create ClusterIP service named todo-backend-service for deployment todo-backend exposing port 8080 targeting container port 8080"

# Save output to file
kubectl ai "create ClusterIP service named todo-backend-service for deployment todo-backend exposing port 8080 targeting container port 8080" > backend-service.yaml

# Review generated manifest
cat backend-service.yaml
```

### Step 3.5: Create Secrets

Create Kubernetes secret for sensitive environment variables:

```bash
kubectl create secret generic todo-app-secrets \
  --from-literal=DATABASE_URL="postgresql://neondb_owner:npg_EjCo5xMe1bRT@ep-long-field-ah05rknq-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require" \
  --from-literal=JWT_SECRET="dev-secret-change-in-production" \
  --from-literal=GEMINI_API_KEY="AIzaSyDHfoqAmTBABlbaFJnhzWYHPhfsO44JWT8" \
  --from-literal=BETTER_AUTH_SECRET="dev-auth-secret" \
  --namespace=todo-app-dev

# Verify secret created
kubectl get secrets
```

---

## Phase 4: Deploy to Kubernetes

### Step 4.1: Apply Manifests

```bash
# Deploy backend first (frontend depends on backend service)
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml

# Wait for backend to be ready
kubectl wait --for=condition=ready pod -l app=todo-backend --timeout=120s

# Deploy frontend
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml

# Wait for frontend to be ready
kubectl wait --for=condition=ready pod -l app=todo-frontend --timeout=120s
```

### Step 4.2: Verify Deployment

```bash
# Check pod status
kubectl get pods

# Expected output:
# NAME                            READY   STATUS    RESTARTS   AGE
# todo-backend-xxxxxxxxxx-xxxxx   1/1     Running   0          2m
# todo-frontend-xxxxxxxxxx-xxxxx  1/1     Running   0          1m
# todo-frontend-xxxxxxxxxx-xxxxx  1/1     Running   0          1m

# Check services
kubectl get services

# Expected output:
# NAME                     TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
# todo-backend-service     ClusterIP   10.96.xxx.xxx   <none>        8080/TCP       2m
# todo-frontend-service    NodePort    10.96.xxx.xxx   <none>        80:30xxx/TCP   1m
```

---

## Phase 5: Validate Deployment

### Step 5.1: Check Pod Health with kagent

```bash
# Analyze pod health and startup logs
kagent "check pod health and startup logs for namespace todo-app-dev"

# Review output for any errors or warnings
```

### Step 5.2: Analyze Resource Usage

```bash
# Get resource recommendations
kagent "recommend CPU and memory limits for deployments in namespace todo-app-dev"

# Review recommendations and update deployment manifests if needed
```

### Step 5.3: Check Pod Logs

```bash
# Backend logs
kubectl logs -l app=todo-backend --tail=50

# Frontend logs
kubectl logs -l app=todo-frontend --tail=50

# Look for any errors or warnings
```

---

## Phase 6: Access Application

### Step 6.1: Get Frontend URL

```bash
# Get Minikube service URL
minikube service todo-frontend-service --url --namespace=todo-app-dev

# Example output: http://192.168.49.2:30080
```

### Step 6.2: Test Application

```bash
# Open in browser
# Copy the URL from previous command and open in browser

# Or use curl to test
curl $(minikube service todo-frontend-service --url --namespace=todo-app-dev)

# Test backend health endpoint
kubectl port-forward service/todo-backend-service 8080:8080 --namespace=todo-app-dev &
curl http://localhost:8080/health
# Press Ctrl+C to stop port forwarding
```

### Step 6.3: Test End-to-End Flow

1. Open frontend URL in browser
2. Login with credentials
3. Create a new task
4. Verify task appears in list
5. Use chatbot to add/manage tasks
6. Verify all features work correctly

---

## Phase 7: Store Manifests in Helm Chart

### Step 7.1: Create Helm Chart Structure

```bash
# Create Helm chart directory
mkdir -p helm/todo-chatbot-chart/templates

# Move manifests to templates directory
mv frontend-deployment.yaml helm/todo-chatbot-chart/templates/
mv frontend-service.yaml helm/todo-chatbot-chart/templates/
mv backend-deployment.yaml helm/todo-chatbot-chart/templates/
mv backend-service.yaml helm/todo-chatbot-chart/templates/
```

### Step 7.2: Create Chart.yaml

```bash
cat > helm/todo-chatbot-chart/Chart.yaml <<EOF
apiVersion: v2
name: todo-chatbot-chart
description: Helm chart for Todo Chatbot application
type: application
version: 1.0.0
appVersion: "1.0.0"
EOF
```

### Step 7.3: Create values.yaml

```bash
cat > helm/todo-chatbot-chart/values.yaml <<EOF
namespace: todo-app-dev

frontend:
  image:
    repository: todo-frontend
    tag: latest
    pullPolicy: Never
  replicaCount: 2

backend:
  image:
    repository: todo-backend
    tag: latest
    pullPolicy: Never
  replicaCount: 1
EOF
```

### Step 7.4: Validate Helm Chart

```bash
# Lint chart
helm lint helm/todo-chatbot-chart

# Dry run
helm install todo-app helm/todo-chatbot-chart --dry-run --debug --namespace=todo-app-dev

# If validation passes, chart is ready for version control
```

---

## Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl get pods

# Describe pod for events
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>

# Common issues:
# - ImagePullBackOff: Image not loaded to Minikube (run minikube image load)
# - CrashLoopBackOff: Application error (check logs)
# - Pending: Insufficient resources (check kagent recommendations)
```

### Service Not Accessible

```bash
# Check service
kubectl get service todo-frontend-service

# Check endpoints
kubectl get endpoints todo-frontend-service

# Test service from within cluster
kubectl run test-pod --image=alpine --rm -it -- sh
# Inside pod:
wget -O- http://todo-backend-service:8080/health
exit
```

### Database Connection Issues

```bash
# Check backend logs for connection errors
kubectl logs -l app=todo-backend | grep -i database

# Verify secret exists
kubectl get secret todo-app-secrets

# Test database connectivity from backend pod
kubectl exec -it <backend-pod-name> -- sh
# Inside pod:
wget -O- http://localhost:8080/health
exit
```

---

## Cleanup

### Remove Deployment

```bash
# Delete all resources
kubectl delete -f helm/todo-chatbot-chart/templates/

# Or delete by label
kubectl delete all -l app=todo-frontend
kubectl delete all -l app=todo-backend

# Delete secrets
kubectl delete secret todo-app-secrets

# Delete namespace (optional)
kubectl delete namespace todo-app-dev
```

### Remove Images from Minikube

```bash
# Remove images
minikube image rm todo-frontend:latest
minikube image rm todo-backend:latest
```

---

## Next Steps

1. ✅ Application deployed and running
2. ✅ Health validated with kagent
3. ✅ Manifests stored in Helm chart
4. ⏭️ Run `/sp.tasks` to generate implementation tasks
5. ⏭️ Implement CI/CD pipeline (future)
6. ⏭️ Add monitoring and logging (future)
7. ⏭️ Deploy to production cluster (future)

---

## Success Criteria Checklist

- [ ] Container images build successfully in under 5 minutes
- [ ] Frontend image < 500MB, backend image < 300MB
- [ ] All pods reach Running state within 2 minutes
- [ ] Frontend accessible via Minikube IP and loads in under 3 seconds
- [ ] Backend API responds to health check within 1 second
- [ ] End-to-end flow (frontend → backend → database) works
- [ ] Pod logs contain no error messages
- [ ] Resource utilization < 80% (CPU and memory)
- [ ] All manifests stored in Helm chart templates
- [ ] Deployment completes without manual intervention
- [ ] Application maintains Phase III functionality

---

**Quickstart Status**: ✅ **COMPLETE** - Ready for deployment execution
**Estimated Time**: 15-30 minutes (first deployment), 5-10 minutes (subsequent deployments)
