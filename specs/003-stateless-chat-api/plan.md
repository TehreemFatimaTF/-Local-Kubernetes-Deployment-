# Implementation Plan: Stateless Chat API with Persistent Conversation History

**Branch**: `003-stateless-chat-api` | **Date**: 2026-01-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-stateless-chat-api/spec.md`

## Summary

Implement a stateless FastAPI chat endpoint that integrates the AI agent (001-nl-todo-agent) with the MCP server (002-mcp-todo-server) while persisting conversation history to Neon PostgreSQL. The API reconstructs full conversation context from the database on every request, invokes the AI agent with history, persists both user and assistant messages with tool invocation metadata, and returns structured responses. The system operates without in-memory state, enabling horizontal scaling and seamless server restarts.

**Key Technical Approach**:
- Stateless request cycle: fetch history → invoke agent → persist messages → return response
- Tool-first actions: AI agent calls MCP tools; API persists metadata
- Database-backed state: conversations and messages tables with proper indexing
- 30-second timeout on AI agent invocations (clarified)
- No hard limit on conversation history size (clarified)

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: FastAPI, SQLModel, OpenAI Agents SDK, MCP SDK, Pydantic
**Storage**: Neon Serverless PostgreSQL (existing connection via SQLModel)
**Testing**: pytest, pytest-asyncio, httpx (for API testing)
**Target Platform**: Linux server (containerized via Docker)
**Project Type**: Web application (backend API)
**Performance Goals**:
- <3s response time for messages without tool invocations
- <5s response time for messages with tool invocations
- Support 50+ concurrent requests without data corruption
**Constraints**:
- Stateless architecture (no in-memory conversation state)
- 30-second timeout on AI agent invocations
- All conversation state must persist to database
- Must integrate with existing backend structure (routes/, models.py, db.py)
**Scale/Scope**:
- Support unlimited conversation history per conversation
- Handle multiple concurrent users and conversations
- Integrate with existing task management system

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **Spec Fidelity**: Implementation must strictly follow the specification contracts for request/response structures, error codes, and database schema.

✅ **Statelessness by Design**: No in-memory conversation state; all context derived from database. Verified by server restart tests.

✅ **Tool-First Action Policy**: AI agent invokes MCP tools; API never fabricates data. All tool calls logged and persisted.

✅ **Deterministic & Auditable Behavior**: Given same conversation history and user message, system produces reproducible results. All tool invocations logged with parameters and results.

✅ **User-Centric Clarity**: API returns clear, structured responses with conversation_id, message_id, and tool invocation metadata for client transparency.

**Constitution Alignment**: This feature aligns with all five core principles from the MCP Todo Chatbot constitution. No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/003-stateless-chat-api/
├── plan.md              # This file (/sp.plan command output)
├── spec.md              # Feature specification (completed)
├── research.md          # Phase 0: OpenAI Agents SDK integration patterns
├── data-model.md        # Phase 1: Conversation/Message schema design
├── contracts/           # Phase 1: API contracts and error codes
│   ├── request-response.md
│   └── error-codes.md
└── tasks.md             # Phase 2: Implementation tasks (/sp.tasks command)
```

### Source Code (repository root)

```text
backend/
├── main.py              # FastAPI app (existing - add chat router)
├── db.py                # Database connection (existing)
├── models.py            # SQLModel models (existing - add Conversation, Message)
├── schemas.py           # Pydantic schemas (existing - add chat schemas)
├── routes/
│   ├── __init__.py      # (existing)
│   ├── auth.py          # (existing)
│   ├── tasks.py         # (existing)
│   └── chat.py          # NEW: Chat endpoint implementation
├── services/
│   ├── __init__.py      # NEW
│   ├── agent_service.py # NEW: OpenAI Agents SDK integration
│   ├── conversation_service.py # NEW: Conversation/message persistence
│   └── mcp_client.py    # NEW: MCP server client (if needed)
└── tests/
    ├── test_chat_api.py # NEW: Chat endpoint tests
    ├── test_conversation_service.py # NEW: Service layer tests
    └── test_agent_integration.py # NEW: AI agent integration tests

frontend/
├── src/
│   ├── components/
│   │   └── chat/        # NEW: ChatKit components
│   │       ├── ChatInterface.tsx
│   │       ├── MessageList.tsx
│   │       └── MessageInput.tsx
│   └── services/
│       └── chatApi.ts   # NEW: Chat API client
└── tests/
    └── chat/            # NEW: Chat component tests
```

**Structure Decision**: Web application structure with backend API and frontend UI. The chat API will be implemented as a new route in the existing FastAPI backend (`routes/chat.py`), with supporting services for AI agent integration and conversation management. Database models will be added to the existing `models.py` file. Frontend will use ChatKit components to interact with the chat API.

## Complexity Tracking

No constitution violations. All complexity is justified by core requirements:
- Multiple services (agent_service, conversation_service) needed for separation of concerns
- Database transactions required for data consistency
- OpenAI Agents SDK integration necessary for AI agent invocation

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (ChatKit)                            │
│  - Chat interface components                                     │
│  - Message display with tool invocation metadata                │
│  - API client for chat endpoint                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │ POST /api/{user_id}/chat
                         │ { message, conversation_id? }
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              FastAPI Backend (Stateless Chat API)                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ routes/chat.py                                            │  │
│  │ - Validate request                                        │  │
│  │ - Create/retrieve conversation                           │  │
│  │ - Reconstruct history from DB                            │  │
│  │ - Invoke AI agent (30s timeout)                          │  │
│  │ - Persist messages + tool metadata                       │  │
│  │ - Return structured response                             │  │
│  └────────┬─────────────────────────────────┬───────────────┘  │
│           │                                  │                   │
│           ▼                                  ▼                   │
│  ┌─────────────────────┐         ┌──────────────────────────┐  │
│  │ conversation_service │         │    agent_service         │  │
│  │ - CRUD operations    │         │ - OpenAI Agents SDK      │  │
│  │ - History retrieval  │         │ - Context formatting     │  │
│  │ - Transaction mgmt   │         │ - Tool metadata parsing  │  │
│  └──────────┬───────────┘         └────────┬─────────────────┘  │
│             │                               │                    │
└─────────────┼───────────────────────────────┼────────────────────┘
              │                               │
              ▼                               ▼
    ┌──────────────────┐         ┌────────────────────────┐
    │  Neon PostgreSQL │         │  OpenAI Agents SDK     │
    │  - conversations │         │  (001-nl-todo-agent)   │
    │  - messages      │         │  - Intent detection    │
    │  - Indexes       │         │  - Tool selection      │
    └──────────────────┘         └────────┬───────────────┘
                                          │ MCP tool calls
                                          ▼
                                 ┌────────────────────────┐
                                 │   MCP Server           │
                                 │ (002-mcp-todo-server)  │
                                 │  - add_task            │
                                 │  - list_tasks          │
                                 │  - update_task         │
                                 │  - complete_task       │
                                 │  - delete_task         │
                                 └────────────────────────┘
```

### Request Flow (Stateless Cycle)

1. **Request Reception** (`routes/chat.py`)
   - Validate user_id path parameter
   - Parse JSON body: { message, conversation_id? }
   - Validate message not empty

2. **Conversation Management** (`conversation_service`)
   - If conversation_id provided: retrieve from DB, validate ownership
   - If not provided: create new conversation with user_id
   - Retrieve all messages for conversation ordered by created_at

3. **History Reconstruction** (`conversation_service`)
   - Fetch all messages (no limit - clarified)
   - Order chronologically by created_at timestamp
   - Format for AI agent context (include tool invocations)

4. **AI Agent Invocation** (`agent_service`)
   - Format conversation history for OpenAI Agents SDK
   - Add new user message to context
   - Invoke agent with 30-second timeout (clarified)
   - Parse response including tool invocation metadata

5. **Message Persistence** (`conversation_service`)
   - Begin database transaction
   - Persist user message (role="user", content, created_at)
   - Persist assistant message (role="assistant", content, tool_invocations, created_at)
   - Update conversation updated_at timestamp
   - Commit transaction (rollback on error)

6. **Response Formation** (`routes/chat.py`)
   - Structure response: { conversation_id, message_id, role, content, tool_invocations?, created_at }
   - Return 200 with JSON response
   - Handle errors with structured error codes

---

## Phase 0: Research & Discovery

### Research Topics

1. **OpenAI Agents SDK Integration**
   - How to initialize and configure the agent
   - Context formatting for conversation history
   - Tool invocation metadata structure
   - Timeout configuration and error handling
   - Async vs sync invocation patterns

2. **MCP Server Communication**
   - How AI agent connects to MCP server
   - Tool registration and discovery
   - Error propagation from MCP tools to agent to API

3. **Database Schema Design**
   - Conversation and Message table structures
   - Foreign key relationships and cascading
   - Indexes for performance (conversation_id, created_at, user_id)
   - JSON storage for tool_invocations array

4. **Concurrency Handling**
   - Database transaction isolation levels
   - Optimistic vs pessimistic locking
   - Race condition scenarios and mitigations

5. **Error Handling Patterns**
   - Structured error response format
   - Error code taxonomy (VALIDATION_ERROR, NOT_FOUND, FORBIDDEN, AI_AGENT_ERROR, AI_AGENT_TIMEOUT, DATABASE_ERROR)
   - Partial failure handling (user message saved, agent fails)

### Research Deliverables

Create `research.md` with:
- OpenAI Agents SDK code examples for conversation context
- MCP server integration patterns
- Database schema with indexes and constraints
- Concurrency handling recommendations
- Error handling decision tree

---

## Phase 1: Design & Contracts

### 1. Agent Behavior Design

**Intent Detection & Tool Selection** (handled by 001-nl-todo-agent):
- Agent receives conversation history + new user message
- Agent classifies intent (create_task, list_tasks, complete_task, update_task, delete_task, clarify, general)
- Agent selects appropriate MCP tool(s) to invoke
- Agent handles ambiguous requests by asking clarifying questions

**Context Formatting**:
```python
# Format for OpenAI Agents SDK
context = [
    {"role": "user", "content": "add task buy groceries"},
    {"role": "assistant", "content": "I've added 'buy groceries' to your tasks.",
     "tool_calls": [{"name": "add_task", "parameters": {...}, "result": {...}}]},
    {"role": "user", "content": "show my tasks"},
    # ... all historical messages
]
```

**Tool Invocation Metadata Structure**:
```python
{
    "tool_name": "add_task",
    "parameters": {"user_id": "user123", "title": "buy groceries"},
    "result": {"id": "task-uuid", "title": "buy groceries", "completed": false},
    "timestamp": "2026-01-20T10:30:00Z"
}
```

### 2. MCP Tools Integration

**Tool Contracts** (from 002-mcp-todo-server):
- `add_task(user_id, title, description?)` → Task object
- `list_tasks(user_id, completed?)` → Task[]
- `update_task(user_id, task_id, new_title?, new_description?)` → Task object
- `complete_task(user_id, task_id)` → Task object
- `delete_task(user_id, task_id)` → Success confirmation

**Error Handling from MCP Tools**:
- Tool returns error → Agent receives error → API persists error in tool_invocations
- Error codes: VALIDATION_ERROR, NOT_FOUND, FORBIDDEN, MISSING_PARAMETER
- API includes tool errors in response for client transparency

**Task ID Resolution Strategies**:
1. **Explicit ID**: User provides task ID directly ("complete task 123")
2. **Context Inference**: Agent uses conversation history to identify task ("complete that task" referring to recently created task)
3. **Fuzzy Matching**: Agent calls list_tasks, matches by title/description similarity
4. **Clarification**: If ambiguous, agent asks user to specify which task

### 3. Chat API Design

**Endpoint**: `POST /api/{user_id}/chat`

**Request Schema**:
```python
class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=10000)  # Default limit
    conversation_id: Optional[str] = None
```

**Response Schema**:
```python
class ToolInvocation(BaseModel):
    tool_name: str
    parameters: dict
    result: dict
    timestamp: datetime

class ChatResponse(BaseModel):
    conversation_id: str
    message_id: str
    role: Literal["assistant"]
    content: str
    tool_invocations: Optional[List[ToolInvocation]] = None
    created_at: datetime
```

**Error Response Schema**:
```python
class ErrorResponse(BaseModel):
    code: str  # Error code enum
    message: str  # Human-readable message
    details: Optional[dict] = None  # Additional context
```

**Error Codes**:
- `VALIDATION_ERROR`: Invalid request parameters
- `MISSING_PARAMETER`: Required parameter absent
- `NOT_FOUND`: Conversation not found
- `FORBIDDEN`: Conversation doesn't belong to user
- `AI_AGENT_ERROR`: AI agent invocation failed
- `AI_AGENT_TIMEOUT`: AI agent exceeded 30-second timeout
- `DATABASE_ERROR`: Database operation failed

### 4. Database Schema

**Conversations Table**:
```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    INDEX idx_user_id (user_id),
    INDEX idx_updated_at (updated_at)
);
```

**Messages Table**:
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    tool_invocations JSONB,  -- Array of tool invocation objects
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_created_at (created_at),
    INDEX idx_conversation_created (conversation_id, created_at)  -- Composite for history queries
);
```

**SQLModel Models**:
```python
class Conversation(SQLModel, table=True):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(max_length=255, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Message(SQLModel, table=True):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    conversation_id: str = Field(foreign_key="conversation.id", index=True)
    role: str = Field(max_length=20)  # "user" or "assistant"
    content: str
    tool_invocations: Optional[str] = Field(default=None)  # JSON string
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
```

**Conversation State Storage Design**:
- All state in database (conversations + messages tables)
- No in-memory caching or session storage
- Conversation history reconstructed on every request
- Indexes optimize history retrieval queries
- Tool invocations stored as JSONB for flexibility

### 5. Error Handling Strategy

**Error Handling Decision Tree**:

```
Request Received
├─ Validation Error? → 400 VALIDATION_ERROR
├─ Missing user_id? → 400 MISSING_PARAMETER
├─ Invalid conversation_id format? → 400 VALIDATION_ERROR
│
├─ Conversation Retrieval
│  ├─ Not found? → 404 NOT_FOUND
│  └─ Wrong user? → 403 FORBIDDEN
│
├─ History Reconstruction
│  └─ DB error? → 503 DATABASE_ERROR
│
├─ AI Agent Invocation
│  ├─ Timeout (>30s)? → 500 AI_AGENT_TIMEOUT
│  ├─ Agent error? → 500 AI_AGENT_ERROR
│  └─ MCP tool error? → Persist in tool_invocations, return in response
│
└─ Message Persistence
   ├─ Transaction fails? → 503 DATABASE_ERROR (rollback)
   └─ Success → 200 with ChatResponse
```

**Ambiguous Intent Handling**:
- Agent detects ambiguity (e.g., "complete the task" with multiple pending tasks)
- Agent responds with clarifying question
- API persists agent's clarification request as assistant message
- User's next message provides clarification
- Agent uses conversation history to resolve ambiguity

**Tool Parameter Defaults**:
- `list_tasks`: If no `completed` filter specified, return all tasks
- `add_task`: If no `description` provided, create task with title only
- `update_task`: Only update fields provided (partial update)
- All tools: `user_id` always required (from path parameter)

### Design Deliverables

Create `data-model.md` with:
- Complete database schema with indexes
- SQLModel model definitions
- Relationship diagrams

Create `contracts/request-response.md` with:
- API endpoint specifications
- Request/response schemas with examples
- Success and error response formats

Create `contracts/error-codes.md` with:
- Complete error code taxonomy
- Error handling decision tree
- Example error responses for each code

---

## Phase 2: Implementation Approach

### Iterative Development Strategy

**Iteration 1: Core Chat Flow (P1)**
- Implement Conversation and Message models
- Create conversation_service with CRUD operations
- Implement POST /api/{user_id}/chat endpoint (stub agent)
- Test: Create conversation, persist messages, retrieve history

**Iteration 2: AI Agent Integration (P1)**
- Implement agent_service with OpenAI Agents SDK
- Integrate with MCP server (002-mcp-todo-server)
- Add 30-second timeout handling
- Test: Agent receives history, invokes tools, returns response

**Iteration 3: Tool Metadata Persistence (P1)**
- Parse tool invocations from agent response
- Persist tool_invocations in messages table
- Include tool metadata in API response
- Test: Tool calls logged, metadata returned to client

**Iteration 4: Error Handling (P2)**
- Implement structured error responses
- Add validation for all inputs
- Handle AI agent timeouts and errors
- Test: All error codes return correct responses

**Iteration 5: Concurrency & Performance (P2)**
- Add database transaction management
- Optimize history retrieval queries
- Test concurrent requests to same conversation
- Load test with 50+ concurrent users

**Iteration 6: Frontend Integration (P3)**
- Implement ChatKit components
- Create chat API client
- Display messages with tool invocation metadata
- Test: End-to-end chat flow from UI

### Quality Validation Checkpoints

**After Each Iteration**:
1. ✅ All tests pass (unit + integration)
2. ✅ Code follows existing backend patterns
3. ✅ No regressions in existing functionality
4. ✅ Documentation updated

**Final Validation** (before merge):
1. ✅ Correct tool calls: Agent maps intents to correct MCP tools
2. ✅ Conversation persistence: All messages stored with correct attributes
3. ✅ Stateless operation: Server restart doesn't lose conversation state
4. ✅ CRUD via natural language: All task operations work through chat
5. ✅ Error handling: All error codes tested and return correct responses
6. ✅ Performance: Response times meet success criteria (<3s without tools, <5s with tools)
7. ✅ Concurrency: 50+ concurrent requests handled without corruption

---

## Testing Strategy

### Unit Tests

**conversation_service Tests**:
- `test_create_conversation()`: Creates conversation with user_id
- `test_retrieve_conversation()`: Retrieves existing conversation
- `test_retrieve_nonexistent_conversation()`: Returns None
- `test_validate_conversation_ownership()`: Rejects wrong user_id
- `test_persist_user_message()`: Saves user message correctly
- `test_persist_assistant_message()`: Saves assistant message with tool metadata
- `test_retrieve_conversation_history()`: Returns all messages ordered by created_at
- `test_retrieve_large_history()`: Handles 1000+ messages efficiently
- `test_transaction_rollback()`: Rolls back on error

**agent_service Tests**:
- `test_format_conversation_context()`: Formats history for agent
- `test_invoke_agent_success()`: Agent returns response
- `test_invoke_agent_timeout()`: Raises timeout after 30s
- `test_parse_tool_invocations()`: Extracts tool metadata from response
- `test_agent_error_handling()`: Handles agent errors gracefully

### Integration Tests

**Chat API Tests** (`test_chat_api.py`):
- `test_send_first_message()`: Creates conversation, returns response with conversation_id
- `test_send_message_to_existing_conversation()`: Continues conversation
- `test_conversation_history_reconstructed()`: Agent aware of previous messages
- `test_tool_invocation_persisted()`: Tool metadata saved and returned
- `test_invalid_user_id()`: Returns 400 MISSING_PARAMETER
- `test_invalid_conversation_id()`: Returns 404 NOT_FOUND
- `test_wrong_user_conversation()`: Returns 403 FORBIDDEN
- `test_empty_message()`: Returns 400 VALIDATION_ERROR
- `test_agent_timeout()`: Returns 500 AI_AGENT_TIMEOUT after 30s
- `test_database_error()`: Returns 503 DATABASE_ERROR
- `test_concurrent_requests()`: Multiple requests to same conversation handled safely

**Agent Integration Tests** (`test_agent_integration.py`):
- `test_intent_create_task()`: "add task X" → calls add_task
- `test_intent_list_tasks()`: "show my tasks" → calls list_tasks
- `test_intent_complete_task()`: "mark task X done" → calls complete_task
- `test_intent_update_task()`: "rename task X to Y" → calls update_task
- `test_intent_delete_task()`: "delete task X" → calls delete_task
- `test_ambiguous_intent_clarification()`: Agent asks clarifying question
- `test_tool_error_handling()`: MCP tool error persisted in metadata

### End-to-End Tests

**Stateless Operation Tests**:
- `test_server_restart_continuity()`: Start conversation, restart server, continue conversation
- `test_no_in_memory_state()`: Multiple server instances handle same conversation

**Natural Language CRUD Tests**:
- `test_create_task_via_chat()`: "remind me to buy groceries" → task created
- `test_list_tasks_via_chat()`: "what do I need to do?" → tasks listed
- `test_complete_task_via_chat()`: "I finished buying groceries" → task completed
- `test_update_task_via_chat()`: "change groceries to groceries and milk" → task updated
- `test_delete_task_via_chat()`: "remove the groceries task" → task deleted

**Performance Tests**:
- `test_response_time_without_tools()`: <3s average
- `test_response_time_with_tools()`: <5s average
- `test_concurrent_load()`: 50+ concurrent requests without errors
- `test_large_conversation_history()`: 1000+ messages retrieved efficiently

---

## Risks & Mitigations

### Technical Risks

**Risk 1: AI Agent Context Window Limits**
- **Impact**: Very long conversations (1000+ messages) may exceed agent's context window
- **Mitigation**: Monitor token usage; implement graceful degradation if context limit approached; consider conversation summarization as future enhancement
- **Detection**: Log context size for each request; alert if approaching limits

**Risk 2: Database Query Performance**
- **Impact**: Retrieving large conversation histories may cause slow queries
- **Mitigation**: Composite index on (conversation_id, created_at); monitor query performance; optimize as needed
- **Detection**: Log query execution times; alert on slow queries (>500ms)

**Risk 3: OpenAI Agents SDK Integration Complexity**
- **Impact**: SDK may have unexpected behavior or limitations
- **Mitigation**: Thorough research phase; prototype integration early; maintain fallback error handling
- **Detection**: Comprehensive integration tests; monitor agent invocation failures

**Risk 4: Concurrent Write Conflicts**
- **Impact**: Multiple clients sending messages simultaneously may cause race conditions
- **Mitigation**: Database transactions with appropriate isolation level; rely on created_at timestamps for ordering
- **Detection**: Concurrent request tests; monitor for data inconsistencies

### Operational Risks

**Risk 5: MCP Server Availability**
- **Impact**: If MCP server unavailable, agent cannot invoke tools
- **Mitigation**: Agent handles tool failures gracefully; API persists error metadata; clear error messages to users
- **Detection**: Monitor MCP server health; alert on tool invocation failures

**Risk 6: Database Connection Pool Exhaustion**
- **Impact**: High load may exhaust database connections
- **Mitigation**: Configure appropriate connection pool size; implement connection retry logic; monitor pool usage
- **Detection**: Database connection metrics; alert on pool exhaustion

---

## Success Criteria

### Functional Success
- ✅ All user stories from spec implemented and tested
- ✅ All acceptance scenarios pass
- ✅ All error codes implemented and tested
- ✅ Stateless operation verified (server restart test)
- ✅ Natural language CRUD operations work end-to-end

### Performance Success
- ✅ Response time <3s for messages without tool invocations (average)
- ✅ Response time <5s for messages with tool invocations (average)
- ✅ 50+ concurrent requests handled without errors
- ✅ Conversation history retrieval <500ms for 100 messages

### Quality Success
- ✅ 100% test coverage for critical paths (conversation management, agent invocation, message persistence)
- ✅ Zero data loss or corruption in concurrent scenarios
- ✅ All error conditions return appropriate error codes
- ✅ Code follows existing backend patterns and conventions

---

## Next Steps

1. **Complete Phase 0 Research** (`/sp.plan` creates research.md)
   - Research OpenAI Agents SDK integration patterns
   - Document MCP server communication approach
   - Design database schema with indexes

2. **Complete Phase 1 Design** (`/sp.plan` creates data-model.md and contracts/)
   - Finalize database models
   - Document API contracts
   - Create error code taxonomy

3. **Generate Implementation Tasks** (`/sp.tasks`)
   - Break down implementation into testable tasks
   - Prioritize by iteration
   - Assign acceptance criteria to each task

4. **Begin Implementation** (Iteration 1)
   - Implement database models
   - Create conversation service
   - Build chat endpoint with stub agent

5. **Continuous Validation**
   - Run tests after each task
   - Validate against success criteria
   - Update documentation as needed
