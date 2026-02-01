---
id: 2
title: Stateless Chat API Implementation Plan
stage: plan
date: 2026-01-20
surface: agent
model: claude-sonnet-4-5
feature: 003-stateless-chat-api
branch: 003-stateless-chat-api
user: Tehreem Fatima
command: /sp.plan
labels: ["plan", "chat-api", "architecture", "fastapi", "openai-agents", "mcp"]
links:
  spec: specs/003-stateless-chat-api/spec.md
  plan: specs/003-stateless-chat-api/plan.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/003-stateless-chat-api/plan.md
tests:
  - Architecture validation against constitution
  - Integration approach validation
---

## Prompt

```text
/sp.plan

Create:
- Architecture sketch: frontend ChatKit, FastAPI backend, MCP server, Neon DB
- Section structure: Agent Behavior → MCP Tools → Chat API → Error Handling → Testing
- Implementation approach: iterative, stateless request cycle, tool-first actions
- Quality validation: correct tool calls, conversation persistence, error handling

Decisions needing documentation:
- Task ID resolution strategies
- Ambiguous intent handling
- Tool parameter defaults
- Conversation state storage design

Testing strategy:
- Validate user intents map to correct MCP tools
- Confirm database stores conversation/messages correctly
- Ensure stateless server resumes conversations
- Test all CRUD operations via natural language
```

## Response snapshot

Created comprehensive implementation plan for Stateless Chat API following user-specified structure and incorporating clarifications from previous session (no history limit, 30s timeout).

**Plan Structure**:
1. **Summary**: Stateless request cycle with database-backed conversation history
2. **Technical Context**: Python 3.11+, FastAPI, SQLModel, OpenAI Agents SDK, Neon PostgreSQL
3. **Constitution Check**: All 5 principles validated (Spec Fidelity, Statelessness, Tool-First, Deterministic, User-Centric)
4. **Architecture Overview**: System components diagram and stateless request flow (6 steps)
5. **Phase 0 Research**: OpenAI Agents SDK, MCP integration, database schema, concurrency, error handling
6. **Phase 1 Design**: Agent behavior, MCP tools, Chat API contracts, database schema, error handling
7. **Phase 2 Implementation**: 6 iterations (Core → Agent → Tool Metadata → Errors → Concurrency → Frontend)
8. **Testing Strategy**: Unit tests (conversation_service, agent_service), integration tests (chat API, agent integration), E2E tests (stateless operation, NL CRUD, performance)

**Key Architectural Decisions Documented**:
- **Task ID Resolution**: 4 strategies (explicit ID, context inference, fuzzy matching, clarification)
- **Ambiguous Intent Handling**: Agent asks clarifying questions, persists as assistant message
- **Tool Parameter Defaults**: list_tasks returns all if no filter, add_task accepts title-only, update_task partial updates
- **Conversation State Storage**: All state in PostgreSQL (conversations + messages tables), no in-memory cache, JSONB for tool_invocations

**Integration Approach**:
- Iterative development: 6 iterations from core flow to frontend
- Stateless request cycle: fetch history → invoke agent → persist messages → return response
- Tool-first actions: AI agent calls MCP tools, API persists metadata
- Quality validation checkpoints after each iteration

**Testing Coverage**:
- 9 unit tests for conversation_service
- 5 unit tests for agent_service
- 11 integration tests for chat API
- 6 agent integration tests (intent mapping)
- 5 E2E tests (stateless operation, NL CRUD)
- 4 performance tests (<3s without tools, <5s with tools, 50+ concurrent, 1000+ messages)

## Outcome

- ✅ Impact: Complete architectural plan ready for implementation with clear phases and iterations
- 🧪 Tests: Comprehensive testing strategy covering unit, integration, E2E, and performance
- 📁 Files: 1 file created (plan.md - 13,000+ words)
- 🔁 Next prompts: Create supporting documents (research.md, data-model.md, contracts/) or proceed to `/sp.tasks` for task breakdown
- 🧠 Reflection: Plan successfully integrates existing backend structure (routes/, models.py, db.py) with new chat functionality. Clarifications from previous session (no history limit, 30s timeout) incorporated throughout. All user-requested decisions documented with clear rationale.

## Evaluation notes (flywheel)

- Failure modes observed: None - plan completed successfully with all requested sections
- Graders run and results (PASS/FAIL): PASS - Architecture aligns with constitution, integration approach is iterative and testable
- Prompt variant (if applicable): User-specified structure (Agent Behavior → MCP Tools → Chat API → Error Handling → Testing)
- Next experiment (smallest change to try): Create supporting documents (research.md for OpenAI Agents SDK patterns, data-model.md for schema details, contracts/ for API specifications)
