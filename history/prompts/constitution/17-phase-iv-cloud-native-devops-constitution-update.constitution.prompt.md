---
id: 17
title: Phase IV Cloud Native DevOps Constitution Update
stage: constitution
date: 2026-01-26
surface: agent
model: claude-sonnet-4-5
feature: none
branch: 003-stateless-chat-api
user: system
command: /sp.constitution
labels: ["constitution", "phase-iv", "kubernetes", "docker", "devops", "cloud-native"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - None
---

## Prompt

# Role: Cloud Native DevOps Expert (Phase IV)
You are now acting as the lead Platform Engineer for the "Todo Chatbot" project. Your mission is to handle Local Kubernetes Deployment (Phase IV) using AI-assisted tools.

## 1. Toolchain & Interaction Rules
You must leverage the following tools for all operations:
- **Docker AI (Gordon):** Use `docker ai` for all containerization and image building tasks.
- **kubectl-ai:** Use `kubectl ai "prompt"` for generating Kubernetes manifests and deployments.
- **Kagent:** Use `kagent` for cluster health analysis and resource optimization.
- **Minikube:** Use as the target local cluster.
- **Helm:** Use for packaging and managing the application lifecycle.

## 2. Technical Objectives
Follow these steps strictly:
1. **Containerization:** Invoke Gordon to analyze the Phase III code and create optimized Dockerfiles for both Frontend and Backend.
2. **Cluster Readiness:** Ensure Minikube is running with `minikube status`. If not, start it using the Docker driver.
3. **AI-Driven Deployment:** - Use `kubectl ai` to generate initial deployment specs for 2 replicas of the frontend and 1 for the backend.
   - Use `kagent` to verify if the cluster resources (CPU/RAM) are sufficient.
4. **Helm Integration:** Convert the AI-generated manifests into a structured Helm Chart.
5. **Blueprint Validation:** Research and implement Spec-Driven deployment logic as per project requirements.

## 3. Communication Style
- **Concise & Witty:** Be direct like a senior engineer, but keep it engaging.
- **Dry Run First:** Always show the command you are about to run before executing.
- **Safety:** Verify that the `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` is present in the environment before calling `kubectl-ai`.

## 4. Troubleshooting
If a pod fails, do not manually debug immediately. Run `kubectl ai "check why the pods are failing"` or `kagent "analyze logs of failing pods"` first.

---
Current Objective: Begin Phase IV - Containerize the Frontend and Backend using Gordon.

## Response snapshot

Constitution successfully updated from version 2.0.0 to 2.1.0 with Phase IV Cloud Native DevOps principles.

**Key Changes:**
- Added 5 new principles (6-10) for cloud native deployment
- Added comprehensive Phase IV deployment section
- Defined containerization standards for frontend and backend
- Established Kubernetes deployment standards with replica configuration
- Documented Helm chart structure and requirements
- Integrated AI toolchain (Docker AI/Gordon, kubectl-ai, Kagent)
- Defined 5-phase deployment workflow

**New Principles:**
1. AI-Assisted Infrastructure (Principle 6)
2. Container-First Deployment (Principle 7)
3. Declarative Infrastructure (Principle 8)
4. Local-First Development (Principle 9)
5. Helm-Based Lifecycle Management (Principle 10)

**Architecture Expansion:**
- MCP chatbot → MCP chatbot + Cloud Native K8s deployment
- Local-first development with Minikube
- Production-ready containerization
- Helm-based lifecycle management

**Templates Status:**
- ✅ plan-template.md - reviewed, compatible
- ⚠️ spec-template.md - may need deployment section
- ⚠️ tasks-template.md - may need infrastructure task categories

## Outcome

- ✅ Impact: Constitution updated to v2.1.0 with Phase IV Cloud Native DevOps principles. All existing principles preserved. Added comprehensive deployment standards and AI toolchain integration.
- 🧪 Tests: No tests required for constitution updates
- 📁 Files: Modified .specify/memory/constitution.md (v2.0.0 → v2.1.0)
- 🔁 Next prompts:
  - Begin Phase IV.1: Containerization with Docker AI (Gordon)
  - Verify Minikube cluster setup
  - Generate Kubernetes manifests with kubectl-ai
  - Create Helm chart structure
- 🧠 Reflection: Successfully integrated Phase IV requirements while maintaining backward compatibility. The constitution now provides clear guidance for AI-assisted infrastructure deployment. The 5-phase deployment workflow (Containerization → Cluster Setup → Manifest Generation → Helm Packaging → Validation) provides a structured approach to cloud native deployment.

## Evaluation notes (flywheel)

- Failure modes observed: None - constitution update completed successfully
- Graders run and results (PASS/FAIL): PASS - All validation checks passed, no unresolved placeholders, version incremented correctly
- Prompt variant (if applicable): Standard constitution update workflow
- Next experiment (smallest change to try): Begin implementing Phase IV.1 containerization using Docker AI to generate optimized Dockerfiles for frontend and backend components
