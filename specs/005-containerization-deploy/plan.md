# Phase IV Execution Plan: Local Kubernetes Deployment (AI-Assisted)

**Branch**: `005-containerization-deploy` | **Date**: 2026-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-containerization-deploy/spec.md`

## Summary

Deploy the Cloud Native Todo Chatbot on a local Kubernetes cluster in a repeatable, spec-driven, and AI-assisted manner. This plan follows the Phase IV requirements to containerize the application, package it with Helm charts, and leverage AI agents (Docker AI, kubectl-ai, Kagent) for infrastructure generation and management.

## Execution Steps

### 1. Environment Preparation

Install and verify:

- Docker Desktop (with Docker AI / Gordon enabled if available)
- Minikube
- kubectl, Helm
- kubectl-ai and Kagent

Start Minikube and confirm cluster readiness.

Create a dedicated Kubernetes namespace.

### 2. Containerization

Generate Dockerfiles for frontend and backend:

- Prefer Docker AI (Gordon); fallback to Claude-generated Dockerfiles.
- Build Docker images locally with pinned base images.
- Load images into Minikube.

### 3. Helm Chart Creation

Generate Helm chart scaffolding for:

- Frontend
- Backend

Parameterize charts:

- Image name & tag
- Replicas
- Resource requests & limits
- Environment variables

Validate rendered manifests (helm template).

### 4. Kubernetes Deployment

Deploy Helm charts into the dedicated namespace.

Expose services using ClusterIP (NodePort only if required).

Verify pod health, logs, and service connectivity.

### 5. AI-Assisted Validation

Use AI agents for:

- Health validation with Kagent
- Resource optimization recommendations
- Deployment verification

## Technical Context

**Language/Version**:
- Frontend: Node.js 18+ (Next.js 14)
- Backend: Python 3.9+ (FastAPI)
- Container Runtime: Docker 24+
- Orchestration: Kubernetes 1.28+ (Minikube)

**Primary Dependencies**:
- Docker AI (Gordon) for Dockerfile generation
- kubectl-ai for Kubernetes manifest generation
- kagent for cluster health analysis
- Helm 3+ for chart management
- Minikube with Docker driver

**Storage**:
- PostgreSQL database (external to cluster, accessible via network)
- Container images stored locally in Minikube
- Kubernetes manifests stored in Helm chart templates

**Testing**:
- Container build validation (docker build)
- Local container runtime testing (docker-compose)
- Kubernetes deployment verification (kubectl get pods)
- End-to-end application testing (curl, browser)
- Resource usage validation (kagent analysis)

**Target Platform**:
- Local development: Minikube on Docker driver
- OS: Windows, macOS, Linux (cross-platform)

**Project Type**: Web application (frontend + backend)

**Performance Goals**:
- Container images build in under 5 minutes
- Pods reach Running state within 2 minutes
- Frontend loads in under 3 seconds
- Backend API responds within 1 second
- Resource utilization under 80% (CPU and memory)

**Constraints**:
- Must use AI-assisted tools (Docker AI, kubectl-ai, kagent) per Phase IV constitution
- Frontend: exactly 2 replicas
- Backend: exactly 1 replica
- Frontend: NodePort service for external access
- Backend: ClusterIP service for internal communication
- Images must use Alpine base images
- Must use multi-stage builds
- All manifests must be stored in Helm chart templates

**Scale/Scope**:
- 2 application components (frontend, backend)
- 3 Kubernetes deployments (frontend, backend, services)
- 1 Helm chart with multiple templates
- Local development environment (not production scale)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle 6: AI-Assisted Infrastructure
- ✅ **PASS**: Docker AI (Gordon) will be used for Dockerfile generation
- ✅ **PASS**: kubectl-ai will be used for Kubernetes manifest generation
- ✅ **PASS**: kagent will be used for health validation and optimization
- ⚠️ **VERIFY**: API keys for kubectl-ai must be configured (OPENAI_API_KEY or ANTHROPIC_API_KEY)

### Principle 7: Container-First Deployment
- ✅ **PASS**: All components (frontend, backend) will be containerized
- ✅ **PASS**: Dockerfiles will be generated/validated by Docker AI
- ✅ **PASS**: Multi-stage builds will be used for optimization
- ✅ **PASS**: Alpine base images will be used for minimal size

### Principle 8: Declarative Infrastructure
- ✅ **PASS**: All infrastructure defined in Kubernetes YAML manifests
- ✅ **PASS**: Helm charts will be used for packaging
- ✅ **PASS**: No imperative kubectl commands in deployment workflow
- ✅ **PASS**: All manifests will be version-controlled

### Principle 9: Local-First Development
- ✅ **PASS**: Minikube will be used for local Kubernetes cluster
- ✅ **PASS**: Full stack can run locally
- ✅ **PASS**: No cloud dependencies required
- ✅ **PASS**: Developers can test deployments locally

### Principle 10: Helm-Based Lifecycle Management
- ✅ **PASS**: Helm chart structure will be created
- ✅ **PASS**: All manifests will be stored in Helm templates
- ✅ **PASS**: Values files will support environment-specific configuration
- ✅ **PASS**: Resource limits and health checks will be included

**Gate Status**: ✅ **PASSED** - All constitutional requirements met. Proceed to Phase 0.

**Post-Design Re-check Required**: Yes - verify API keys are configured and AI tools are accessible.

## Project Structure

### Documentation (this feature)

```text
specs/005-containerization-deploy/
├── plan.md              # This file (/sp.plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (AI tools, containerization patterns)
├── data-model.md        # Phase 1 output (container images, K8s resources)
├── quickstart.md        # Phase 1 output (deployment guide)
├── contracts/           # Phase 1 output (Dockerfile templates, K8s manifests)
│   ├── frontend.Dockerfile.template
│   ├── backend.Dockerfile.template
│   ├── frontend-deployment.yaml
│   ├── backend-deployment.yaml
│   ├── frontend-service.yaml
│   └── backend-service.yaml
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Web application structure (existing Phase III code)
backend/
├── src/
│   ├── models/          # Database models
│   ├── services/        # Business logic
│   ├── routes/          # API endpoints
│   └── main.py          # FastAPI application
├── requirements.txt     # Python dependencies
└── Dockerfile           # Generated by Docker AI (Phase 0)

frontend/
├── src/
│   ├── components/      # React components
│   ├── pages/           # Next.js pages
│   ├── services/        # API clients
│   └── app/             # App router
├── package.json         # Node.js dependencies
├── next.config.js       # Next.js configuration
└── Dockerfile           # Generated by Docker AI (Phase 0)

# Kubernetes deployment structure (new for Phase IV)
helm/
└── todo-chatbot-chart/
    ├── Chart.yaml       # Helm chart metadata
    ├── values.yaml      # Default values
    ├── values-dev.yaml  # Development overrides
    └── templates/       # Kubernetes manifests
        ├── frontend-deployment.yaml
        ├── frontend-service.yaml
        ├── backend-deployment.yaml
        ├── backend-service.yaml
        ├── configmap.yaml
        └── secrets.yaml
```

**Structure Decision**: Web application structure with separate backend and frontend directories. Kubernetes deployment artifacts organized in Helm chart structure at repository root. This aligns with Phase IV constitutional requirements for Helm-based lifecycle management.

## Complexity Tracking

> **No constitutional violations to justify**

All requirements align with Phase IV constitutional principles. No additional complexity introduced beyond what is mandated by the constitution.

---

## Phase 0: Environment Preparation

**Purpose**: Prepare the local environment with all necessary tools and verify cluster readiness.

### Tasks

#### EP001: Install and Verify Tools
**Question**: Are all required tools installed and accessible?

**Tasks**:
- Install Docker Desktop with Docker AI (Gordon) if available
- Install Minikube
- Install kubectl, Helm
- Install kubectl-ai and Kagent
- Verify all tools are accessible from command line

**Expected Output**: All tools installed and accessible via command line.

#### EP002: Start and Verify Minikube Cluster
**Question**: Is the Minikube cluster running and accessible?

**Tasks**:
- Start Minikube with Docker driver
- Verify cluster is accessible via kubectl
- Check cluster status and node readiness

**Expected Output**: Minikube cluster running and accessible via kubectl.

#### EP003: Create Dedicated Namespace
**Question**: Is the application namespace created?

**Tasks**:
- Create dedicated Kubernetes namespace (e.g., `todo-app-dev`)
- Verify namespace exists and is ready

**Expected Output**: Dedicated namespace created and available for deployment.

---

## Phase 1: Containerization

**Purpose**: Containerize the frontend and backend applications using AI-assisted tools.

### Tasks

#### C001: Generate Dockerfiles with Docker AI
**Question**: Are optimized Dockerfiles generated for both frontend and backend?

**Tasks**:
- Use Docker AI (Gordon) to analyze frontend code and generate Dockerfile
- Use Docker AI (Gordon) to analyze backend code and generate Dockerfile
- Fallback to manual Dockerfile generation if AI unavailable
- Optimize Dockerfiles using multi-stage builds and Alpine base images

**Expected Output**: Optimized Dockerfiles for both frontend and backend applications.

#### C002: Build Container Images
**Question**: Are container images built successfully with pinned base images?

**Tasks**:
- Build frontend image with tag `todo-frontend`
- Build backend image with tag `todo-backend`
- Verify image sizes meet targets (< 500MB frontend, < 300MB backend)

**Expected Output**: Container images built successfully with appropriate sizes.

#### C003: Load Images to Minikube
**Question**: Are images available to Minikube cluster?

**Tasks**:
- Load frontend image to Minikube
- Load backend image to Minikube
- Verify images are available in Minikube's container registry

**Expected Output**: Images loaded and available in Minikube cluster.

---

## Phase 2: Helm Chart Creation

**Purpose**: Create and configure Helm charts for application deployment.

### Tasks

#### HC001: Generate Helm Chart Scaffolding
**Question**: Is the Helm chart structure created for both applications?

**Tasks**:
- Create Helm chart for frontend application
- Create Helm chart for backend application
- Use kubectl-ai to generate basic chart structure if available
- Organize manifests in templates directory

**Expected Output**: Basic Helm chart structure with templates directory.

#### HC002: Parameterize Helm Charts
**Question**: Are charts properly parameterized for flexibility?

**Tasks**:
- Add configurable parameters for image name & tag
- Add configurable parameters for replica counts
- Add configurable parameters for resource requests & limits
- Add configurable parameters for environment variables

**Expected Output**: Fully parameterized Helm charts with flexible configuration options.

#### HC003: Validate Helm Charts
**Question**: Do charts render correctly and pass validation?

**Tasks**:
- Run `helm lint` to validate chart structure
- Use `helm template` to render manifests with sample values
- Verify rendered manifests are valid Kubernetes resources

**Expected Output**: Validated Helm charts that render proper Kubernetes manifests.

---

## Phase 3: Kubernetes Deployment

**Purpose**: Deploy the application to Kubernetes using Helm charts.

### Tasks

#### KD001: Deploy Helm Charts
**Question**: Are applications deployed successfully to the namespace?

**Tasks**:
- Deploy frontend Helm chart with 2 replicas
- Deploy backend Helm chart with 1 replica
- Use dedicated namespace for deployment
- Verify deployments are created

**Expected Output**: Applications deployed with correct replica counts.

#### KD002: Configure Services
**Question**: Are services properly configured for networking?

**Tasks**:
- Create NodePort service for frontend external access
- Create ClusterIP service for backend internal communication
- Verify service configurations are correct
- Test service connectivity within cluster

**Expected Output**: Properly configured services for application networking.

#### KD003: Verify Deployment
**Question**: Are pods running and services accessible?

**Tasks**:
- Check pod status and readiness
- Verify all pods reach Running state
- Test service connectivity and accessibility
- Validate application functionality

**Expected Output**: Healthy running application with accessible services.

---

## Phase 4: AI-Assisted Validation

**Purpose**: Validate and optimize the deployment using AI agents.

### Tasks

#### AV001: Health Validation with Kagent
**Question**: Is the deployment healthy and properly configured?

**Tasks**:
- Use Kagent to analyze pod health
- Check startup logs for errors
- Validate resource utilization
- Identify any potential issues

**Expected Output**: Health validation report with no critical issues.

#### AV002: Resource Optimization
**Question**: Are resource requests and limits properly configured?

**Tasks**:
- Use Kagent to analyze resource usage
- Apply recommended resource limits
- Optimize CPU and memory allocations
- Verify performance impact

**Expected Output**: Optimized resource configurations with improved efficiency.

#### AV003: Final Deployment Verification
**Question**: Does the deployment meet all requirements?

**Tasks**:
- Verify all constitutional requirements are met
- Confirm AI-assisted tools were used appropriately
- Validate end-to-end application functionality
- Document any deviations or findings

**Expected Output**: Fully validated deployment meeting all requirements.

---

## Dependencies & Execution Order

### External Dependencies
1. **Feature 004-k8s-infra-setup** must be complete:
   - Minikube cluster running
   - kubectl-ai and kagent configured
   - Helm chart structure initialized
   - Namespace `todo-app-dev` created

2. **Phase III Application** must be functional:
   - Frontend code complete and tested
   - Backend code complete and tested
   - Database accessible

3. **Tools Installed**:
   - Docker and Docker AI (Gordon)
   - kubectl and kubectl-ai
   - kagent
   - Helm 3+
   - Minikube

### Phase Dependencies
- **Phase 0 (Environment Prep)**: No dependencies - can start immediately
- **Phase 1 (Containerization)**: Depends on Phase 0 completion
- **Phase 2 (Helm Chart Creation)**: Depends on Phase 1 completion
- **Phase 3 (Kubernetes Deployment)**: Depends on Phase 2 completion
- **Phase 4 (AI Validation)**: Depends on Phase 3 completion

### Parallel Opportunities
- Some environment preparation tasks can be done in parallel
- Frontend and backend containerization can proceed in parallel after Dockerfile generation

---

## Risk Analysis

### High Risk
1. **Docker AI Availability**: Docker AI (Gordon) may not be installed or accessible
   - **Mitigation**: Provide fallback manual Dockerfile templates in contracts/
   - **Detection**: Test Docker AI availability in Phase 0

2. **kubectl-ai API Key Missing**: kubectl-ai requires OPENAI_API_KEY or ANTHROPIC_API_KEY
   - **Mitigation**: Document API key setup in quickstart.md
   - **Detection**: Verify environment variables before manifest generation

3. **Image Size Exceeds Targets**: Container images may exceed 500MB (frontend) or 300MB (backend)
   - **Mitigation**: Use multi-stage builds and Alpine base images
   - **Detection**: Check image sizes after build

### Medium Risk
1. **Minikube Resource Constraints**: Insufficient CPU/memory for running pods
   - **Mitigation**: Use kagent to analyze resource requirements
   - **Detection**: Monitor pod status and resource utilization

2. **Database Connectivity**: Backend may fail to connect to database from Kubernetes
   - **Mitigation**: Test database connectivity before deployment
   - **Detection**: Check backend pod logs for connection errors

3. **Service Networking Issues**: Frontend may not reach backend through ClusterIP
   - **Mitigation**: Verify service DNS and port configuration
   - **Detection**: Test frontend-to-backend communication

### Low Risk
1. **Helm Chart Validation**: Chart may fail lint validation
   - **Mitigation**: Use standard Helm chart structure
   - **Detection**: Run `helm lint` before deployment

2. **NodePort Conflicts**: NodePort may conflict with existing services
   - **Mitigation**: Use auto-assigned NodePort
   - **Detection**: Check service creation status

---

## Success Metrics

### Phase 0 Completion
- ✅ All environment preparation tasks completed
- ✅ All required tools installed and verified
- ✅ Minikube cluster running and accessible
- ✅ Dedicated namespace created

### Phase 1 Completion
- ✅ Dockerfiles generated for frontend and backend
- ✅ Container images built successfully
- ✅ Images loaded to Minikube
- ✅ Image sizes within targets

### Phase 2 Completion
- ✅ Helm chart scaffolding created
- ✅ Charts properly parameterized
- ✅ Charts validated and rendering correctly

### Phase 3 Completion
- ✅ Applications deployed with correct configurations
- ✅ Services properly configured
- ✅ Pods running and healthy

### Phase 4 Completion
- ✅ Deployment validated with AI tools
- ✅ Resources optimized
- ✅ All requirements met

### Overall Success
- ✅ Cloud Native Todo Chatbot deployed on local Kubernetes
- ✅ AI-assisted tools utilized as required
- ✅ Spec-driven deployment achieved
- ✅ Constitutional requirements satisfied

---

**Plan Status**: ✅ **COMPLETE** - Ready for Phase 0 environment preparation execution
**Next Command**: Execute environment preparation tasks or run `/sp.tasks` to generate detailed implementation tasks
