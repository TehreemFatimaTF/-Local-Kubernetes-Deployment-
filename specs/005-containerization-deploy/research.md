# Research: Containerization & AI Deployment

**Feature**: 005-containerization-deploy
**Date**: 2026-01-26
**Purpose**: Resolve technical unknowns for AI-assisted containerization and Kubernetes deployment

---

## R001: Docker AI (Gordon) Capabilities and Workflow

### Decision: Docker AI Command Patterns
**Chosen**: Use `docker ai` with natural language prompts to analyze source code and generate optimized Dockerfiles.

**Command Syntax**:
```bash
# Analyze and generate Dockerfile
docker ai "create optimized multi-stage Dockerfile for [technology] application in [directory]"

# Example for Next.js
docker ai "create optimized multi-stage Dockerfile for Next.js 14 frontend with Node.js Alpine base"

# Example for FastAPI
docker ai "create optimized multi-stage Dockerfile for FastAPI Python backend with Alpine base and health check"
```

**Capabilities**:
- Source code analysis (detects framework, dependencies, build requirements)
- Multi-stage build recommendations (separate build and runtime stages)
- Base image selection (Alpine for minimal size)
- Security best practices (non-root user, minimal attack surface)
- Layer optimization (proper COPY ordering, cache utilization)
- Size optimization (remove build dependencies, use .dockerignore)

**Workflow**:
1. Navigate to application directory
2. Run `docker ai` with descriptive prompt
3. Review generated Dockerfile
4. Adjust if needed (environment variables, ports, commands)
5. Build image: `docker build -t <image-name>:<tag> .`
6. Verify image size: `docker images | grep <image-name>`

**Rationale**: Docker AI encodes containerization best practices and automatically applies optimization techniques. It reduces manual Dockerfile creation time and ensures consistency across projects.

**Alternatives Considered**:
- Manual Dockerfile creation: Time-consuming, error-prone, requires deep Docker knowledge
- Dockerfile generators (Jib, Buildpacks): Less flexible, framework-specific
- Copy existing Dockerfiles: May not be optimized for specific application needs

---

## R002: kubectl-ai Manifest Generation Patterns

### Decision: Prompt Engineering for Kubernetes Manifests
**Chosen**: Use structured natural language prompts with kubectl-ai to generate deployment and service manifests.

**Command Syntax**:
```bash
# Deployment manifest
kubectl ai "create deployment named <name> with image <image:tag>, <N> replicas, port <port>, resource limits <cpu>/<memory>"

# Service manifest
kubectl ai "create <type> service named <name> for deployment <deployment-name> exposing port <port>"

# Examples
kubectl ai "create deployment named todo-frontend with image todo-frontend:latest, 2 replicas, port 3000, resource limits 500m CPU and 512Mi memory"

kubectl ai "create NodePort service named todo-frontend-service for deployment todo-frontend exposing port 3000"

kubectl ai "create ClusterIP service named todo-backend-service for deployment todo-backend exposing port 8080"
```

**Prompt Templates**:

**Deployment**:
```
create deployment named {name} with:
- image {image:tag}
- {N} replicas
- container port {port}
- environment variables: {VAR1}={value1}, {VAR2}={value2}
- resource requests: {cpu} CPU, {memory} memory
- resource limits: {cpu} CPU, {memory} memory
- readiness probe: HTTP GET {path} on port {port}
- liveness probe: HTTP GET {path} on port {port}
```

**Service**:
```
create {ClusterIP|NodePort|LoadBalancer} service named {name}:
- selector: app={deployment-name}
- port {external-port} targeting container port {internal-port}
- [for NodePort] nodePort {port-number} (optional, auto-assign if omitted)
```

**Configuration Patterns**:
- **Environment Variables**: Use ConfigMap for non-sensitive data, Secret for sensitive data
- **Resource Limits**: Start conservative (100m CPU, 128Mi memory), adjust based on kagent recommendations
- **Health Checks**: Readiness probe for traffic routing, liveness probe for restart policy
- **Probe Configuration**: initialDelaySeconds: 10, periodSeconds: 10, timeoutSeconds: 5

**Rationale**: kubectl-ai generates valid Kubernetes YAML following best practices. Structured prompts ensure consistent manifest generation with all required fields.

**Alternatives Considered**:
- Manual YAML creation: Error-prone, requires deep Kubernetes knowledge
- kubectl create commands: Limited customization, imperative approach
- Helm chart generators: Overkill for initial manifest generation

---

## R003: kagent Health Analysis and Optimization

### Decision: kagent Workflow for Validation and Optimization
**Chosen**: Use kagent with natural language queries to analyze cluster health and optimize resource allocation.

**Command Syntax**:
```bash
# Pod health analysis
kagent "check pod health and startup logs for namespace <namespace>"
kagent "analyze why pods are failing in namespace <namespace>"

# Resource optimization
kagent "recommend CPU and memory limits for deployment <name>"
kagent "analyze resource utilization for namespace <namespace>"

# Cluster health
kagent "check cluster resource availability"
kagent "identify resource bottlenecks"
```

**Analysis Capabilities**:
- **Pod Log Analysis**: Detects errors, warnings, startup failures
- **Resource Utilization**: Monitors CPU, memory, disk, network usage
- **Limit Recommendations**: Suggests appropriate resource requests and limits
- **Failure Diagnosis**: Identifies root causes (OOMKilled, CrashLoopBackOff, ImagePullBackOff)
- **Performance Optimization**: Recommends scaling, resource adjustments

**Workflow**:
1. Deploy application to Kubernetes
2. Wait for pods to start (or fail)
3. Run `kagent "check pod health"` to analyze status
4. If issues found, run `kagent "analyze why pods are failing"`
5. Review logs and error messages
6. Fix issues (resource limits, configuration, connectivity)
7. Run `kagent "recommend resource limits"` after stable operation
8. Update deployment manifests with recommended limits

**Rationale**: kagent provides AI-assisted troubleshooting and optimization, reducing manual log analysis and guesswork for resource allocation.

**Alternatives Considered**:
- Manual kubectl logs/describe: Time-consuming, requires expertise
- Monitoring tools (Prometheus, Grafana): Overkill for local development
- Trial-and-error resource tuning: Inefficient, may cause instability

---

## R004: Next.js Containerization Best Practices

### Decision: Multi-Stage Build for Next.js
**Chosen**: Use multi-stage Dockerfile with separate build and runtime stages, Node.js Alpine base image.

**Dockerfile Pattern**:
```dockerfile
# Stage 1: Dependencies and Build
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (production only)
RUN npm ci --only=production

# Copy source code
COPY . .

# Build Next.js application
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine AS runner
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy built application from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

**Key Optimizations**:
- **Multi-stage build**: Separates build dependencies from runtime, reduces image size
- **Alpine base**: Minimal Linux distribution, smaller image size
- **Production dependencies only**: `npm ci --only=production` excludes devDependencies
- **Non-root user**: Security best practice, prevents privilege escalation
- **Layer caching**: Copy package files before source code for better cache utilization
- **.dockerignore**: Exclude node_modules, .git, .next (build artifacts)

**Environment Variables**:
- `NEXT_PUBLIC_API_URL`: Backend API endpoint (must be set at build time for static generation)
- `NODE_ENV=production`: Enables production optimizations

**Port Configuration**: 3000 (Next.js default)

**Size Target**: < 500MB (achievable with Alpine and production dependencies)

**Rationale**: Multi-stage builds significantly reduce image size by excluding build tools and dev dependencies from runtime image. Alpine base provides minimal attack surface.

**Alternatives Considered**:
- Single-stage build: Larger image size, includes unnecessary build tools
- Debian/Ubuntu base: Larger base image (100MB+ vs 5MB for Alpine)
- Standalone output: More complex, requires additional configuration

---

## R005: FastAPI Containerization Best Practices

### Decision: Multi-Stage Build for FastAPI
**Chosen**: Use multi-stage Dockerfile with Python Alpine base, uvicorn server, health check endpoint.

**Dockerfile Pattern**:
```dockerfile
# Stage 1: Dependencies
FROM python:3.9-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache gcc musl-dev libffi-dev

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Runtime
FROM python:3.9-alpine AS runner
WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /root/.local /root/.local

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S python && \
    adduser -S fastapi -u 1001 -G python

# Change ownership
RUN chown -R fastapi:python /app

# Switch to non-root user
USER fastapi

# Update PATH
ENV PATH=/root/.local/bin:$PATH

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8080/health')"

# Start application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```

**Key Optimizations**:
- **Multi-stage build**: Separates build dependencies (gcc, musl-dev) from runtime
- **Alpine base**: Minimal Linux distribution
- **User-level pip install**: `pip install --user` for cleaner separation
- **No cache**: `--no-cache-dir` reduces image size
- **Non-root user**: Security best practice
- **Health check**: Built-in Docker health check for /health endpoint

**Environment Variables**:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `GEMINI_API_KEY`: Google Gemini API key for AI agent

**Port Configuration**: 8080 (configurable via uvicorn --port)

**Size Target**: < 300MB (achievable with Alpine and minimal dependencies)

**Health Check Endpoint**: `/health` (must be implemented in FastAPI application)

**Rationale**: Multi-stage builds remove build dependencies from runtime image. Health checks enable Kubernetes to detect and restart unhealthy containers.

**Alternatives Considered**:
- Single-stage build: Larger image size, includes gcc and build tools
- Debian/Ubuntu base: Larger base image
- Gunicorn instead of uvicorn: Uvicorn is recommended for FastAPI (ASGI)

---

## R006: Minikube Image Loading Strategies

### Decision: Direct Image Loading to Minikube
**Chosen**: Use `minikube image load` to transfer locally built images to Minikube's Docker daemon.

**Command Syntax**:
```bash
# Build image locally
docker build -t <image-name>:<tag> .

# Load image into Minikube
minikube image load <image-name>:<tag>

# Verify image is available
minikube image ls | grep <image-name>

# Alternative: Use Minikube's Docker daemon directly
eval $(minikube docker-env)
docker build -t <image-name>:<tag> .
```

**Workflow**:
1. Build images on host machine: `docker build -t todo-frontend:latest ./frontend`
2. Load images to Minikube: `minikube image load todo-frontend:latest`
3. Repeat for backend: `minikube image load todo-backend:latest`
4. Set imagePullPolicy to `Never` or `IfNotPresent` in deployment manifests
5. Deploy to Kubernetes: `kubectl apply -f manifests/`

**Image Pull Policy**:
- `Never`: Always use local image, never pull from registry (recommended for local dev)
- `IfNotPresent`: Use local image if available, otherwise pull from registry
- `Always`: Always pull from registry (not suitable for local images)

**Rationale**: `minikube image load` is the simplest method for making locally built images available to Minikube pods. No registry setup required.

**Alternatives Considered**:
- Local Docker registry: More complex setup, unnecessary for local development
- Minikube Docker daemon: Requires eval $(minikube docker-env), affects host Docker commands
- Push to Docker Hub: Requires internet, slower, unnecessary for local images

---

## R007: Kubernetes Service Networking

### Decision: ClusterIP for Internal, NodePort for External
**Chosen**: Use ClusterIP service for backend (internal communication), NodePort service for frontend (external access).

**Service Types**:

**ClusterIP (Backend)**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: todo-backend-service
spec:
  type: ClusterIP
  selector:
    app: todo-backend
  ports:
    - protocol: TCP
      port: 8080
      targetPort: 8080
```

- **Purpose**: Internal cluster communication only
- **Access**: Accessible via DNS name `todo-backend-service.todo-app-dev.svc.cluster.local`
- **Port**: 8080 (matches backend container port)
- **Use Case**: Frontend pods call backend API via ClusterIP service

**NodePort (Frontend)**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: todo-frontend-service
spec:
  type: NodePort
  selector:
    app: todo-frontend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
      nodePort: 30080  # Optional, auto-assigned if omitted
```

- **Purpose**: External access from host machine
- **Access**: Accessible via `minikube service todo-frontend-service --url`
- **Port Mapping**: External port 80 → Container port 3000
- **NodePort Range**: 30000-32767 (Kubernetes default)
- **Use Case**: Developer accesses frontend UI from browser

**Service Discovery**:
- **DNS**: Kubernetes creates DNS records for services
- **Format**: `<service-name>.<namespace>.svc.cluster.local`
- **Short Form**: `<service-name>` (within same namespace)
- **Environment Variables**: Kubernetes injects service endpoints as env vars

**Frontend-to-Backend Communication**:
```javascript
// Frontend API client configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://todo-backend-service:8080';
```

**Rationale**: ClusterIP provides internal service discovery and load balancing. NodePort enables external access without Ingress controller complexity.

**Alternatives Considered**:
- LoadBalancer: Requires cloud provider, not available in Minikube
- Ingress: More complex setup, unnecessary for local development
- Port forwarding: Manual, not persistent, requires kubectl command

---

## R008: Helm Chart Structure and Values

### Decision: Standard Helm Chart Structure with Environment-Specific Values
**Chosen**: Use standard Helm chart directory structure with values.yaml for defaults and values-dev.yaml for local development overrides.

**Chart Structure**:
```
helm/todo-chatbot-chart/
├── Chart.yaml           # Chart metadata
├── values.yaml          # Default values
├── values-dev.yaml      # Development environment overrides
├── values-prod.yaml     # Production environment overrides (future)
├── templates/           # Kubernetes manifest templates
│   ├── _helpers.tpl     # Template helpers
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── configmap.yaml
│   └── secrets.yaml
└── .helmignore          # Files to exclude from chart
```

**Chart.yaml**:
```yaml
apiVersion: v2
name: todo-chatbot-chart
description: Helm chart for Todo Chatbot application
type: application
version: 1.0.0
appVersion: "1.0.0"
```

**values.yaml** (defaults):
```yaml
frontend:
  image:
    repository: todo-frontend
    tag: latest
    pullPolicy: Never
  replicaCount: 2
  service:
    type: NodePort
    port: 80
    targetPort: 3000
  resources:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 500m
      memory: 512Mi
  env:
    NEXT_PUBLIC_API_URL: "http://todo-backend-service:8080"

backend:
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
    DATABASE_URL: "postgresql://user:pass@host:5432/db"
    JWT_SECRET: "change-me-in-production"
```

**values-dev.yaml** (local development):
```yaml
frontend:
  image:
    pullPolicy: Never  # Use local images
backend:
  image:
    pullPolicy: Never  # Use local images
  env:
    DATABASE_URL: "postgresql://neondb_owner:npg_EjCo5xMe1bRT@ep-long-field-ah05rknq-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

**Template Example** (frontend-deployment.yaml):
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-frontend
spec:
  replicas: {{ .Values.frontend.replicaCount }}
  selector:
    matchLabels:
      app: todo-frontend
  template:
    metadata:
      labels:
        app: todo-frontend
    spec:
      containers:
      - name: frontend
        image: "{{ .Values.frontend.image.repository }}:{{ .Values.frontend.image.tag }}"
        imagePullPolicy: {{ .Values.frontend.image.pullPolicy }}
        ports:
        - containerPort: {{ .Values.frontend.service.targetPort }}
        env:
        - name: NEXT_PUBLIC_API_URL
          value: {{ .Values.frontend.env.NEXT_PUBLIC_API_URL }}
        resources:
          {{- toYaml .Values.frontend.resources | nindent 10 }}
```

**Helm Commands**:
```bash
# Validate chart
helm lint ./helm/todo-chatbot-chart

# Dry run (test rendering)
helm install todo-app ./helm/todo-chatbot-chart --dry-run --debug

# Install with dev values
helm install todo-app ./helm/todo-chatbot-chart -f ./helm/todo-chatbot-chart/values-dev.yaml

# Upgrade
helm upgrade todo-app ./helm/todo-chatbot-chart -f ./helm/todo-chatbot-chart/values-dev.yaml

# Uninstall
helm uninstall todo-app
```

**Rationale**: Standard Helm structure enables version control, templating, and multi-environment deployment. Values files separate configuration from manifests.

**Alternatives Considered**:
- Plain Kubernetes YAML: No templating, duplication across environments
- Kustomize: Less mature, different paradigm
- Custom scripts: Reinventing the wheel, no ecosystem support

---

## Summary of Decisions

| Research Task | Decision | Key Benefit |
|---------------|----------|-------------|
| R001: Docker AI | Use `docker ai` with natural language prompts | Automated Dockerfile generation with best practices |
| R002: kubectl-ai | Structured prompts for manifest generation | Consistent, valid Kubernetes YAML |
| R003: kagent | AI-assisted health analysis and optimization | Faster troubleshooting and resource tuning |
| R004: Next.js | Multi-stage build with Alpine base | Optimized image size (< 500MB) |
| R005: FastAPI | Multi-stage build with health check | Optimized image size (< 300MB) |
| R006: Minikube | Direct image loading with `minikube image load` | Simple local image availability |
| R007: Services | ClusterIP for backend, NodePort for frontend | Internal communication + external access |
| R008: Helm | Standard chart structure with values files | Multi-environment deployment support |

---

## Unresolved Questions

**None** - All technical unknowns have been resolved through research.

---

## Next Steps

1. Proceed to Phase 1: Design & Contracts
2. Create data-model.md with detailed entity definitions
3. Generate Dockerfile templates in contracts/ directory
4. Generate Kubernetes manifest templates in contracts/ directory
5. Create quickstart.md with step-by-step deployment guide
6. Verify API keys for kubectl-ai (OPENAI_API_KEY or ANTHROPIC_API_KEY)
7. Re-validate Constitution Check with resolved unknowns
