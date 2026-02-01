# Phase IV Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Cloud Native Todo Chatbot to a local Kubernetes cluster using Minikube and Helm.

## Prerequisites

- Docker Desktop installed and running
- Minikube installed (v1.37.0+)
- kubectl installed (v1.35.0+)
- Helm 3+ installed
- 4GB RAM available for Minikube
- 20GB disk space available

## Architecture

```
Frontend (React/Next.js)
├── Port: 3000
├── Replicas: 2
├── Service: NodePort (external access)
└── Image: todo-frontend:latest

Backend (FastAPI)
├── Port: 5000
├── Replicas: 1
├── Service: ClusterIP (internal only)
└── Image: todo-backend:latest

Orchestration: Minikube + Helm
Namespace: todo-app-dev
```

## Quick Start

### 1. Start Minikube

```bash
minikube start --driver=docker --cpus=2 --memory=4096
```

### 2. Create Namespace

```bash
kubectl create namespace todo-app-dev
```

### 3. Build Docker Images

```bash
# Build frontend image
docker build -f docker/frontend.Dockerfile -t todo-frontend:latest ./frontend

# Build backend image
docker build -f docker/backend.Dockerfile -t todo-backend:latest ./backend
```

### 4. Load Images to Minikube

```bash
minikube image load todo-frontend:latest
minikube image load todo-backend:latest

# Verify images loaded
minikube image ls | grep todo
```

### 5. Deploy with Helm

```bash
helm install todo-app charts/todo-app \
  -n todo-app-dev \
  -f charts/todo-app/values-dev.yaml
```

### 6. Verify Deployment

```bash
# Check pods
kubectl get pods -n todo-app-dev

# Check services
kubectl get services -n todo-app-dev

# Wait for pods to be ready
kubectl wait --for=condition=ready pod -l app=todo-frontend -n todo-app-dev --timeout=120s
kubectl wait --for=condition=ready pod -l app=todo-backend -n todo-app-dev --timeout=120s
```

### 7. Access Application

```bash
# Get frontend URL
minikube service todo-frontend-service -n todo-app-dev --url

# Open in browser
# The URL will be something like: http://192.168.49.2:30080
```

## Configuration

### Environment Variables

Update `charts/todo-app/values-dev.yaml` with your configuration:

```yaml
backend:
  env:
    DATABASE_URL: "your-database-url"
    JWT_SECRET: "your-jwt-secret"
    GEMINI_API_KEY: "your-gemini-api-key"
    BETTER_AUTH_SECRET: "your-auth-secret"
```

### Resource Limits

Adjust resource limits in `charts/todo-app/values.yaml`:

```yaml
frontend:
  resources:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 500m
      memory: 512Mi
```

## Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl describe pods -n todo-app-dev

# Check pod logs
kubectl logs -n todo-app-dev -l app=todo-frontend
kubectl logs -n todo-app-dev -l app=todo-backend
```

### Image Pull Errors

Ensure images are loaded to Minikube:
```bash
minikube image ls | grep todo
```

If missing, reload:
```bash
minikube image load todo-frontend:latest
minikube image load todo-backend:latest
```

### Service Not Accessible

```bash
# Check service status
kubectl get svc -n todo-app-dev

# Get service URL
minikube service todo-frontend-service -n todo-app-dev --url
```

## Cleanup

### Uninstall Application

```bash
helm uninstall todo-app -n todo-app-dev
```

### Delete Namespace

```bash
kubectl delete namespace todo-app-dev
```

### Stop Minikube

```bash
minikube stop
```

### Delete Minikube Cluster

```bash
minikube delete
```

## Updating Deployment

### Update Configuration

```bash
# Edit values-dev.yaml
# Then upgrade:
helm upgrade todo-app charts/todo-app \
  -n todo-app-dev \
  -f charts/todo-app/values-dev.yaml
```

### Rebuild Images

```bash
# Rebuild images
docker build -f docker/frontend.Dockerfile -t todo-frontend:latest ./frontend
docker build -f docker/backend.Dockerfile -t todo-backend:latest ./backend

# Reload to Minikube
minikube image load todo-frontend:latest
minikube image load todo-backend:latest

# Restart pods
kubectl rollout restart deployment/todo-frontend -n todo-app-dev
kubectl rollout restart deployment/todo-backend -n todo-app-dev
```

## Validation Checklist

- [ ] Minikube cluster running
- [ ] Namespace created
- [ ] Images built and loaded
- [ ] Helm chart deployed
- [ ] All pods in Running state
- [ ] Frontend accessible via NodePort
- [ ] Backend health check responding
- [ ] Frontend can communicate with backend
- [ ] Application functions end-to-end

## Next Steps

1. Test application functionality
2. Monitor resource usage
3. Review logs for errors
4. Optimize resource limits if needed
5. Document any issues encountered

## Support

For issues or questions:
- Check pod logs: `kubectl logs -n todo-app-dev <pod-name>`
- Check events: `kubectl get events -n todo-app-dev`
- Validate Helm chart: `helm lint charts/todo-app`
- Test template rendering: `helm template todo-app charts/todo-app`

