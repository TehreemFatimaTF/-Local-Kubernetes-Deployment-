# Data Model: Containerization & AI Deployment

**Feature**: 005-containerization-deploy
**Date**: 2026-01-26
**Purpose**: Define container images, Kubernetes resources, and Helm chart structure

---

## Container Images

### Frontend Image: `todo-frontend:latest`

**Purpose**: Containerized Next.js 14 frontend application

**Base Image**: `node:18-alpine` (5MB base + dependencies)

**Build Stages**:
1. **Builder Stage**:
   - Install production dependencies via `npm ci --only=production`
   - Copy source code
   - Build Next.js application (`npm run build`)
   - Output: `.next/` directory with optimized production build

2. **Runtime Stage**:
   - Copy built application from builder
   - Copy production node_modules
   - Run as non-root user (nextjs:nodejs)
   - Start Next.js server

**Exposed Ports**: 3000 (Next.js default)

**Environment Variables**:
- `NEXT_PUBLIC_API_URL`: Backend API endpoint (e.g., `http://todo-backend-service:8080`)
- `NODE_ENV`: Set to `production`

**Size Target**: < 500MB

**Security**:
- Non-root user (UID 1001)
- Minimal Alpine base
- No build tools in runtime image

**Health Check**: HTTP GET / on port 3000

---

### Backend Image: `todo-backend:latest`

**Purpose**: Containerized FastAPI Python backend application

**Base Image**: `python:3.9-alpine` (5MB base + dependencies)

**Build Stages**:
1. **Builder Stage**:
   - Install build dependencies (gcc, musl-dev, libffi-dev)
   - Install Python packages from requirements.txt
   - Output: Installed packages in /root/.local

2. **Runtime Stage**:
   - Copy installed packages from builder
   - Copy application code
   - Run as non-root user (fastapi:python)
   - Start uvicorn server

**Exposed Ports**: 8080 (configurable)

**Environment Variables**:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `GEMINI_API_KEY`: Google Gemini API key
- `BETTER_AUTH_SECRET`: Better Auth secret key

**Size Target**: < 300MB

**Security**:
- Non-root user (UID 1001)
- Minimal Alpine base
- No build tools in runtime image

**Health Check**: HTTP GET /health on port 8080

---

## Kubernetes Resources

### Frontend Deployment

**Resource Name**: `todo-frontend`

**Specification**:
```yaml
Replicas: 2
Container:
  Name: frontend
  Image: todo-frontend:latest
  ImagePullPolicy: Never
  Port: 3000
  Environment:
    - NEXT_PUBLIC_API_URL: http://todo-backend-service:8080
  Resources:
    Requests:
      CPU: 100m
      Memory: 128Mi
    Limits:
      CPU: 500m
      Memory: 512Mi
  Readiness Probe:
    HTTP GET / on port 3000
    InitialDelaySeconds: 10
    PeriodSeconds: 10
    TimeoutSeconds: 5
  Liveness Probe:
    HTTP GET / on port 3000
    InitialDelaySeconds: 15
    PeriodSeconds: 20
    TimeoutSeconds: 5
Labels:
  app: todo-frontend
  tier: frontend
```

**Scaling Strategy**: Horizontal (2 replicas for high availability)

**Update Strategy**: RollingUpdate (maxSurge: 1, maxUnavailable: 0)

---

### Backend Deployment

**Resource Name**: `todo-backend`

**Specification**:
```yaml
Replicas: 1
Container:
  Name: backend
  Image: todo-backend:latest
  ImagePullPolicy: Never
  Port: 8080
  Environment:
    - DATABASE_URL: (from Secret)
    - JWT_SECRET: (from Secret)
    - GEMINI_API_KEY: (from Secret)
    - BETTER_AUTH_SECRET: (from Secret)
  Resources:
    Requests:
      CPU: 100m
      Memory: 128Mi
    Limits:
      CPU: 500m
      Memory: 512Mi
  Readiness Probe:
    HTTP GET /health on port 8080
    InitialDelaySeconds: 10
    PeriodSeconds: 10
    TimeoutSeconds: 5
  Liveness Probe:
    HTTP GET /health on port 8080
    InitialDelaySeconds: 15
    PeriodSeconds: 20
    TimeoutSeconds: 5
Labels:
  app: todo-backend
  tier: backend
```

**Scaling Strategy**: Vertical (1 replica, can scale horizontally if needed)

**Update Strategy**: RollingUpdate (maxSurge: 1, maxUnavailable: 0)

---

### Frontend Service

**Resource Name**: `todo-frontend-service`

**Type**: NodePort

**Specification**:
```yaml
Type: NodePort
Selector:
  app: todo-frontend
Ports:
  - Protocol: TCP
    Port: 80
    TargetPort: 3000
    NodePort: 30080 (auto-assigned if omitted)
```

**Purpose**: External access to frontend from host machine

**Access Method**: `minikube service todo-frontend-service --url`

**DNS Name**: `todo-frontend-service.todo-app-dev.svc.cluster.local`

---

### Backend Service

**Resource Name**: `todo-backend-service`

**Type**: ClusterIP

**Specification**:
```yaml
Type: ClusterIP
Selector:
  app: todo-backend
Ports:
  - Protocol: TCP
    Port: 8080
    TargetPort: 8080
```

**Purpose**: Internal cluster communication (frontend → backend)

**Access Method**: DNS name `todo-backend-service` (within same namespace)

**DNS Name**: `todo-backend-service.todo-app-dev.svc.cluster.local`

---

## Configuration Resources

### ConfigMap: `todo-app-config`

**Purpose**: Non-sensitive configuration data

**Data**:
```yaml
NEXT_PUBLIC_API_URL: "http://todo-backend-service:8080"
NODE_ENV: "production"
```

**Usage**: Mounted as environment variables in frontend deployment

---

### Secret: `todo-app-secrets`

**Purpose**: Sensitive configuration data

**Data** (base64 encoded):
```yaml
DATABASE_URL: <base64-encoded-connection-string>
JWT_SECRET: <base64-encoded-secret>
GEMINI_API_KEY: <base64-encoded-api-key>
BETTER_AUTH_SECRET: <base64-encoded-secret>
```

**Usage**: Mounted as environment variables in backend deployment

**Security**: Kubernetes Secrets are base64 encoded (not encrypted). For production, use external secret management (Vault, Sealed Secrets).

---

## Helm Chart Structure

### Chart Metadata

**Chart.yaml**:
```yaml
apiVersion: v2
name: todo-chatbot-chart
description: Helm chart for Todo Chatbot application with AI-powered task management
type: application
version: 1.0.0
appVersion: "1.0.0"
keywords:
  - todo
  - chatbot
  - ai
  - kubernetes
maintainers:
  - name: DevOps Team
```

---

### Values Structure

**values.yaml** (defaults):
```yaml
# Global settings
namespace: todo-app-dev

# Frontend configuration
frontend:
  enabled: true
  image:
    repository: todo-frontend
    tag: latest
    pullPolicy: Never
  replicaCount: 2
  service:
    type: NodePort
    port: 80
    targetPort: 3000
    nodePort: null  # Auto-assign
  resources:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 500m
      memory: 512Mi
  env:
    NEXT_PUBLIC_API_URL: "http://todo-backend-service:8080"
    NODE_ENV: "production"
  probes:
    readiness:
      path: /
      initialDelaySeconds: 10
      periodSeconds: 10
    liveness:
      path: /
      initialDelaySeconds: 15
      periodSeconds: 20

# Backend configuration
backend:
  enabled: true
  image:
    repository: todo-backend
    tag: latest
    pullPolicy: Never
  replicaCount: 1
  service:
    type: ClusterIP
    port: 8080
    targetPort: 8080
  resources:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 500m
      memory: 512Mi
  env:
    # Sensitive values should be in secrets
    DATABASE_URL: ""
    JWT_SECRET: ""
    GEMINI_API_KEY: ""
    BETTER_AUTH_SECRET: ""
  probes:
    readiness:
      path: /health
      initialDelaySeconds: 10
      periodSeconds: 10
    liveness:
      path: /health
      initialDelaySeconds: 15
      periodSeconds: 20
```

**values-dev.yaml** (local development overrides):
```yaml
frontend:
  image:
    pullPolicy: Never
backend:
  image:
    pullPolicy: Never
  env:
    DATABASE_URL: "postgresql://neondb_owner:npg_EjCo5xMe1bRT@ep-long-field-ah05rknq-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
    JWT_SECRET: "dev-secret-change-in-production"
    GEMINI_API_KEY: "AIzaSyDHfoqAmTBABlbaFJnhzWYHPhfsO44JWT8"
    BETTER_AUTH_SECRET: "dev-auth-secret"
```

---

### Template Helpers

**_helpers.tpl**:
```yaml
{{/* Generate full name */}}
{{- define "todo-chatbot.fullname" -}}
{{- .Release.Name }}-{{ .Chart.Name }}
{{- end }}

{{/* Generate labels */}}
{{- define "todo-chatbot.labels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/* Frontend selector labels */}}
{{- define "todo-chatbot.frontend.selectorLabels" -}}
app: todo-frontend
tier: frontend
{{- end }}

{{/* Backend selector labels */}}
{{- define "todo-chatbot.backend.selectorLabels" -}}
app: todo-backend
tier: backend
{{- end }}
```

---

## Resource Relationships

### Network Flow
```
User Browser
    ↓ (HTTP)
NodePort Service (todo-frontend-service:30080)
    ↓
Frontend Pods (2 replicas)
    ↓ (HTTP)
ClusterIP Service (todo-backend-service:8080)
    ↓
Backend Pod (1 replica)
    ↓ (PostgreSQL)
External Database (Neon PostgreSQL)
```

### Dependency Graph
```
Helm Chart
├── ConfigMap (todo-app-config)
├── Secret (todo-app-secrets)
├── Frontend Deployment
│   ├── Depends on: ConfigMap
│   └── Exposes: Port 3000
├── Frontend Service
│   └── Selects: Frontend Deployment
├── Backend Deployment
│   ├── Depends on: Secret
│   └── Exposes: Port 8080
└── Backend Service
    └── Selects: Backend Deployment
```

---

## Validation Rules

### Container Images
- ✅ Image size < 500MB (frontend), < 300MB (backend)
- ✅ Multi-stage build used
- ✅ Alpine base image
- ✅ Non-root user
- ✅ Health check defined

### Kubernetes Resources
- ✅ Resource requests and limits defined
- ✅ Readiness and liveness probes configured
- ✅ Labels and selectors match
- ✅ Environment variables properly sourced (ConfigMap/Secret)
- ✅ Image pull policy set to Never for local images

### Helm Chart
- ✅ Chart.yaml has required fields
- ✅ values.yaml has all configurable parameters
- ✅ Templates use values correctly
- ✅ Helpers defined for common patterns
- ✅ Chart passes `helm lint` validation

---

## State Transitions

### Deployment Lifecycle
1. **Initial**: No resources exist
2. **Building**: Container images being built
3. **Loading**: Images loaded to Minikube
4. **Deploying**: Kubernetes resources being created
5. **Starting**: Pods initializing, readiness probes failing
6. **Running**: Pods ready, services accessible
7. **Healthy**: All health checks passing, resource usage normal
8. **Updating**: Rolling update in progress
9. **Failed**: Pods crashing, health checks failing

### Pod States
- **Pending**: Waiting for scheduling
- **ContainerCreating**: Pulling image, creating container
- **Running**: Container started, may not be ready
- **Ready**: Readiness probe passing, receiving traffic
- **CrashLoopBackOff**: Container repeatedly crashing
- **ImagePullBackOff**: Cannot pull image
- **OOMKilled**: Out of memory, killed by system
- **Completed**: Container exited successfully
- **Terminating**: Pod being deleted

---

## Performance Characteristics

### Resource Utilization (Expected)
- **Frontend Pod**: 50-200m CPU, 100-300Mi memory
- **Backend Pod**: 50-200m CPU, 100-300Mi memory
- **Total Cluster**: 200-800m CPU, 400-1200Mi memory

### Startup Times
- **Container Build**: 2-5 minutes (first build), 30-60 seconds (cached)
- **Image Load**: 10-30 seconds per image
- **Pod Startup**: 10-30 seconds (readiness probe delay)
- **Total Deployment**: 3-7 minutes (cold start), 1-2 minutes (warm start)

### Response Times
- **Frontend Load**: < 3 seconds (initial page load)
- **Backend API**: < 1 second (health check)
- **End-to-End**: < 5 seconds (frontend → backend → database)

---

## Next Steps

1. Create Dockerfile templates in contracts/ directory
2. Create Kubernetes manifest templates in contracts/ directory
3. Create quickstart.md with deployment guide
4. Validate all templates with Docker AI, kubectl-ai, and Helm lint
5. Proceed to implementation (Phase 2 - tasks.md)
