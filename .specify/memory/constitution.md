# Cloud-Native Spec-Driven Deployment Constitution

## Core Principles

### I. Spec-Driven Infrastructure
All infrastructure, containers, and deployments must originate from an explicit spec. No manual, undocumented cluster mutations are allowed. Infrastructure is code, not clicks. Kubernetes manifests and Helm charts are the source of truth. AI agents may generate artifacts, but outputs must be committed and reviewable.

### II. Local-First, Cloud-Ready
The system must run entirely on Minikube without paid services. No cloud-specific dependencies may be hard-coded. All deployments must be designed to work in a local Kubernetes environment first, with cloud deployment capability maintained through abstraction.

### III. Deterministic Deployments
All deployments must be reproducible and deterministic. Base images must be explicit and version-pinned. Final deployment commands must be human-auditable. No hard-coded secrets or environment-specific configurations.

### IV. AI Agent Governance
AI agents (Docker AI, kubectl-ai, Kagent) may be used for infrastructure generation and management, but all AI-generated artifacts must be validated, committed to version control, and manually reviewed before deployment. AI recommendations are advisory, not authoritative.

### V. Containerization Standards
Frontend and backend must be containerized separately. Each service must expose only required ports, use non-root containers where possible, and support environment-based configuration. Images must be built locally and loaded into Minikube with semantic versioning.

### VI. Security & Isolation
No secrets may be hard-coded in images or manifests. Environment variables must be injected via Helm values. The system must assume zero trust between services. All workloads must run in dedicated namespaces, not default.

## Additional Constraints

### Infrastructure Requirements
- All workloads must be deployed to a dedicated namespace
- Services must use ClusterIP for internal communication, NodePort or Ingress only when explicitly required
- The cluster must remain functional after pod restarts, deployment rollouts, and replica scaling
- All Kubernetes resources must include labels, resource requests & limits, and readiness/liveness probes where applicable

### Helm Chart Standards
- All deployments must use Helm charts with proper Chart.yaml metadata
- Values.yaml must contain sane defaults and configurable resource limits
- Charts must support scaling without template changes and no hard-coded replicas

### Observability & Debuggability
- Logs must be accessible via kubectl logs
- Pods must fail loudly and descriptively
- Health checks must reflect real service readiness
- AI agents may diagnose failing pods but never apply fixes silently

## Development Workflow

### Deployment Process
1. Specifications precede implementation
2. Generate container images using Docker AI agent (Gordon) or manual process
3. Load images into Minikube using minikube image load
4. Create Helm charts with proper templating
5. Deploy to dedicated namespace with proper resource allocation
6. Validate health checks and connectivity

### Quality Gates
- All Kubernetes manifests must be valid and standards-compliant
- Resource requests and limits must be defined for all deployments
- Security best practices must be followed (non-root containers, secret management)
- Health checks must be implemented where applicable

## Governance

This constitution supersedes all other deployment practices. All deployments must comply with these principles. Any deviation requires explicit documentation and approval. AI-generated infrastructure must be audited before deployment. All team members are responsible for ensuring compliance with these standards.

**Version**: 1.0.0 | **Ratified**: 2026-01-27 | **Last Amended**: 2026-01-27
