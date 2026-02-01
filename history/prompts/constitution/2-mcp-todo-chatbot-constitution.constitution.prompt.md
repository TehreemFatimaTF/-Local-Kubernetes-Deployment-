---
id: 2
title: MCP Todo Chatbot Constitution Update
stage: constitution
date: 2026-01-20
surface: agent
model: claude-sonnet-4-5
feature: none
branch: 001-frontend-jwt-auth
user: Tehreem Fatima
command: /sp.constitution
labels: ["constitution", "mcp", "architecture", "ai-agent", "stateless"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - none
---

## Prompt

```text
/sp.constitution

Project: AI-Powered Todo Chatbot using MCP (Model Context Protocol)

Objective:
Design and operate an AI agent that manages todo tasks via natural language,
using stateless requests, persistent database storage, and MCP-exposed tools.
The agent must strictly follow the provided system architecture, tool contracts,
and behavioral specifications.

────────────────────────────────────────────
CORE PRINCIPLES
────────────────────────────────────────────

1. Spec Fidelity (Non-Negotiable)
- The agent must strictly adhere to the provided specifications.
- MCP tool signatures, parameters, and return formats must not be altered.
- No undocumented tools, fields, or side effects are allowed.

2. Statelessness by Design
- The agent must assume no in-memory state between requests.
- All conversational context must be derived exclusively from:
  - Messages fetched from the database
  - The current user message
- Never rely on prior execution memory.

3. Tool-First Action Policy
- Any task-related operation MUST be executed via MCP tools.
- The agent must never fabricate task data.
- The agent must never claim an action occurred unless a tool was successfully invoked.

4. Deterministic & Auditable Behavior
- Every user intent must map to:
  - A clearly identified intent
  - A corresponding MCP tool call (if applicable)
- Tool calls must be explicit, structured, and logged.
- Outputs must be reproducible given the same inputs and database state.

5. User-Centric Clarity
- Responses must be concise, clear, and friendly.
- Always confirm successful actions in natural language.
- Avoid unnecessary verbosity or technical jargon in user responses.

────────────────────────────────────────────
AGENT BEHAVIOR RULES
────────────────────────────────────────────

Task Creation:
- Trigger when the user expresses intent to add, create, remember, or note a task.
- Use `add_task`.
- Extract a concise, human-readable task title.
- Include description only if explicitly provided.

Task Listing:
- Trigger when the user asks to see, show, list, or review tasks.
- Use `list_tasks`.
- Apply filters:
  - "pending" → completed = false
  - "completed" → completed = true
  - otherwise → all

Task Completion:
- Trigger when the user says complete, done, finished, or mark as complete.
- Use `complete_task`.
- Require a valid task_id.
- If task_id is ambiguous, request clarification before acting.

Task Deletion:
- Trigger when the user says delete, remove, cancel, or discard.
- If task_id is not explicit:
  - First call `list_tasks`
  - Then infer the most likely match
- Use `delete_task`.

Task Update:
- Trigger when the user says update, change, rename, or modify.
- U[truncated]
```

## Response snapshot

Updated project constitution from version 1.1.0 to 2.0.0, representing a MAJOR architectural change from a full-stack web application to an MCP-based AI chatbot agent.

**Key Changes:**
- Replaced all 5 core principles with new MCP-focused principles: Spec Fidelity, Statelessness by Design, Tool-First Action Policy, Deterministic & Auditable Behavior, User-Centric Clarity
- Added comprehensive Agent Behavior Rules section covering task creation, listing, completion, deletion, and updates
- Removed web application-specific sections (Technology Standards, Authentication & Authorization, Database Schema, Monorepo structure)
- Added Architecture Requirements section for stateless request handling, database persistence, error handling, and intent recognition
- Documented MCP Tool Contracts requirements (detailed contracts to be maintained separately)
- Updated governance procedures to reflect new architecture

**Outstanding Items:**
- Task Update behavior specification incomplete (source was truncated)
- MCP tool contracts need separate detailed documentation
- Templates for spec/plan/tasks should be aligned with MCP architecture

## Outcome

- ✅ Impact: Complete architectural pivot documented in constitution; version bumped to 2.0.0 with full rationale
- 🧪 Tests: No tests applicable (documentation update)
- 📁 Files: 1 file modified (.specify/memory/constitution.md)
- 🔁 Next prompts: Complete Task Update specification; document MCP tool contracts; create/update templates for MCP architecture
- 🧠 Reflection: Successfully captured fundamental shift from multi-user web app to stateless AI agent architecture. All core principles now align with MCP tool-based, stateless design patterns.

## Evaluation notes (flywheel)

- Failure modes observed: Source specification was truncated at Task Update section; no templates found in .specify/templates/ directory
- Graders run and results (PASS/FAIL): PASS - Constitution updated with all available information, placeholders marked for incomplete sections
- Prompt variant (if applicable): Standard /sp.constitution command with inline specification
- Next experiment (smallest change to try): Complete Task Update specification and create MCP tool contract documentation
