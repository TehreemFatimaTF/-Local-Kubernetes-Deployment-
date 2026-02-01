# Tasks: Stateless Chat API with Persistent Conversation History

**Input**: Design documents from `/specs/003-stateless-chat-api/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Tests are NOT included in this task list as they were not explicitly requested in the feature specification. Focus is on implementation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/` for API, `frontend/` for UI
- All backend code in `backend/` directory
- All frontend code in `frontend/src/` directory

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [x] T001 Install OpenAI Agents SDK dependency in backend/pyproject.toml
- [x] T002 Install MCP SDK dependency in backend/pyproject.toml
- [x] T003 [P] Create backend/services/ directory for service layer
- [x] T004 [P] Create backend/services/__init__.py

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core database models and schemas that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 [P] Add Conversation model to backend/models.py with fields: id, user_id, created_at, updated_at
- [x] T006 [P] Add Message model to backend/models.py with fields: id, conversation_id, role, content, tool_invocations, created_at
- [x] T007 [P] Add ChatRequest schema to backend/schemas.py with fields: message, conversation_id (optional)
- [x] T008 [P] Add ToolInvocation schema to backend/schemas.py with fields: tool_name, parameters, result, timestamp
- [x] T009 [P] Add ChatResponse schema to backend/schemas.py with fields: conversation_id, message_id, role, content, tool_invocations, created_at
- [x] T010 [P] Add ErrorResponse schema to backend/schemas.py with fields: code, message, details (optional)
- [x] T011 Create database migration for conversations and messages tables with indexes
- [x] T012 Update backend/db.py to include new models in create_db_and_tables()

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Send Chat Message (Priority: P1) 🎯 MVP Core

**Goal**: Implement the core chat endpoint that receives messages, creates/retrieves conversations, invokes AI agent, persists messages, and returns responses

**Independent Test**: Send POST request to `/api/{user_id}/chat` with message, verify AI response returned and both user/assistant messages persisted to database

**Dependencies**: This story integrates US2 (history reconstruction) and US3 (persistence) as they are inseparable parts of the stateless request cycle

### Implementation for User Story 1

- [x] T013 [P] [US1] Create conversation_service.py in backend/services/ with create_conversation() function
- [x] T014 [P] [US1] Implement get_conversation() function in backend/services/conversation_service.py
- [x] T015 [P] [US1] Implement validate_conversation_ownership() function in backend/services/conversation_service.py
- [x] T016 [US1] Implement get_conversation_history() function in backend/services/conversation_service.py to retrieve all messages ordered by created_at
- [x] T017 [US1] Implement persist_user_message() function in backend/services/conversation_service.py with transaction support
- [x] T018 [US1] Implement persist_assistant_message() function in backend/services/conversation_service.py with tool_invocations support
- [x] T019 [US1] Implement update_conversation_timestamp() function in backend/services/conversation_service.py
- [x] T020 [P] [US1] Create agent_service.py in backend/services/ with format_conversation_context() function
- [x] T021 [US1] Implement invoke_agent() function in backend/services/agent_service.py with OpenAI Agents SDK integration and 30-second timeout
- [x] T022 [US1] Implement parse_tool_invocations() function in backend/services/agent_service.py to extract tool metadata from agent response
- [x] T023 [US1] Create chat.py in backend/routes/ with POST /api/{user_id}/chat endpoint
- [x] T024 [US1] Implement request validation in backend/routes/chat.py (validate user_id, message not empty, conversation_id format)
- [x] T025 [US1] Implement conversation creation/retrieval logic in backend/routes/chat.py
- [x] T026 [US1] Integrate conversation_service.get_conversation_history() in backend/routes/chat.py
- [x] T027 [US1] Integrate agent_service.invoke_agent() in backend/routes/chat.py with history context
- [x] T028 [US1] Implement message persistence logic in backend/routes/chat.py using database transactions
- [x] T029 [US1] Implement response formatting in backend/routes/chat.py to return ChatResponse schema
- [x] T030 [US1] Register chat router in backend/main.py with /api prefix

**Checkpoint**: At this point, User Story 1 should be fully functional - can send messages, get AI responses, and persist conversation history

---

## Phase 4: User Story 2 - Reconstruct Conversation History (Priority: P1)

**Goal**: Ensure conversation history is correctly reconstructed from database on every request (integrated into US1)

**Independent Test**: Send multiple messages in sequence, verify AI agent responses demonstrate awareness of previous messages

**Note**: This story is implemented as part of US1 (tasks T016, T020, T026) since history reconstruction is inseparable from the core chat flow

### Implementation for User Story 2

- [x] T031 [US2] Add query optimization for get_conversation_history() in backend/services/conversation_service.py (composite index on conversation_id + created_at)
- [x] T032 [US2] Implement tool invocation metadata inclusion in format_conversation_context() in backend/services/agent_service.py
- [x] T033 [US2] Add logging for conversation history size in backend/services/conversation_service.py to monitor large conversations

**Checkpoint**: Conversation history reconstruction is optimized and includes tool metadata

---

## Phase 5: User Story 3 - Persist Conversation and Messages (Priority: P1)

**Goal**: Ensure all conversations and messages are persisted to database with proper attributes (integrated into US1)

**Independent Test**: Send messages, query database directly, verify conversations and messages stored with correct attributes and relationships

**Note**: This story is implemented as part of US1 (tasks T017, T018, T019) since persistence is inseparable from the core chat flow

### Implementation for User Story 3

- [x] T034 [US3] Implement database transaction rollback handling in backend/routes/chat.py for persistence failures
- [x] T035 [US3] Add validation for tool_invocations JSON structure in backend/services/conversation_service.py
- [x] T036 [US3] Implement conversation updated_at timestamp update in persist_assistant_message() in backend/services/conversation_service.py

**Checkpoint**: All persistence operations use transactions and handle failures gracefully

---

## Phase 6: User Story 7 - Resume After Server Restart (Priority: P1)

**Goal**: Verify stateless operation - server can restart and continue conversations seamlessly

**Independent Test**: Start conversation, restart server, send new message, verify conversation continues seamlessly

**Note**: This story is validated by the architecture (no in-memory state) and doesn't require additional implementation tasks beyond US1-US3

### Validation for User Story 7

- [x] T037 [US7] Add documentation comment in backend/routes/chat.py confirming stateless operation (no module-level state variables)
- [x] T038 [US7] Verify no global conversation cache or session storage in backend/services/conversation_service.py
- [x] T039 [US7] Add logging statement in backend/routes/chat.py indicating conversation retrieved from database on each request

**Checkpoint**: Stateless architecture verified - all state comes from database

---

## Phase 7: User Story 4 - Return AI Response with Metadata (Priority: P2)

**Goal**: Ensure API returns structured responses with all required metadata fields

**Independent Test**: Send messages and verify response structure matches documented schema with all required fields

**Note**: Basic response structure implemented in US1 (task T029), this phase adds metadata enhancements

### Implementation for User Story 4

- [x] T040 [P] [US4] Add response validation in backend/routes/chat.py to ensure all ChatResponse fields present
- [x] T041 [P] [US4] Implement tool_invocations array formatting in backend/routes/chat.py when tools were used
- [x] T042 [US4] Add HTTP status code validation (200 for success) in backend/routes/chat.py
- [x] T043 [US4] Implement JSON response formatting with proper content-type headers in backend/routes/chat.py

**Checkpoint**: All responses follow documented schema with complete metadata

---

## Phase 8: User Story 6 - Error Handling and Validation (Priority: P2)

**Goal**: Implement comprehensive error handling with structured error responses for all failure modes

**Independent Test**: Trigger various error conditions and verify error responses match documented format and codes

### Implementation for User Story 6

- [x] T044 [P] [US6] Implement MISSING_PARAMETER error handling in backend/routes/chat.py for missing user_id
- [x] T045 [P] [US6] Implement VALIDATION_ERROR error handling in backend/routes/chat.py for empty message
- [x] T046 [P] [US6] Implement VALIDATION_ERROR error handling in backend/routes/chat.py for invalid conversation_id format
- [x] T047 [P] [US6] Implement NOT_FOUND error handling in backend/routes/chat.py for nonexistent conversation_id
- [x] T048 [P] [US6] Implement FORBIDDEN error handling in backend/routes/chat.py for conversation belonging to different user
- [x] T049 [US6] Implement AI_AGENT_TIMEOUT error handling in backend/services/agent_service.py for 30-second timeout
- [x] T050 [US6] Implement AI_AGENT_ERROR error handling in backend/services/agent_service.py for agent invocation failures
- [x] T051 [US6] Implement DATABASE_ERROR error handling in backend/routes/chat.py for database connection failures
- [x] T052 [US6] Implement MCP tool error persistence in backend/services/conversation_service.py (store in tool_invocations metadata)
- [x] T053 [US6] Add error response formatting function in backend/routes/chat.py to return ErrorResponse schema
- [x] T054 [US6] Add input validation for message length (max 10,000 characters) in backend/routes/chat.py
- [x] T055 [US6] Add input validation for user_id format in backend/routes/chat.py

**Checkpoint**: All error conditions return appropriate error codes with structured responses

---

## Phase 9: User Story 5 - Handle Concurrent Requests (Priority: P2)

**Goal**: Ensure API handles multiple concurrent requests to same conversation without data corruption

**Independent Test**: Send multiple requests simultaneously for same conversation, verify all messages persisted correctly with proper ordering

### Implementation for User Story 5

- [x] T056 [US5] Configure database transaction isolation level in backend/db.py for concurrent access
- [x] T057 [US5] Implement database connection pooling configuration in backend/db.py
- [x] T058 [US5] Add optimistic locking or retry logic in backend/services/conversation_service.py for concurrent updates
- [x] T059 [US5] Verify message ordering by created_at timestamp in backend/services/conversation_service.py
- [x] T060 [US5] Add concurrent request handling documentation in backend/routes/chat.py

**Checkpoint**: API handles 50+ concurrent requests without data corruption

---

## Phase 10: Frontend Integration (Optional Enhancement)

**Goal**: Create ChatKit components for user interface

**Independent Test**: Open chat interface, send messages, verify responses displayed with tool invocation metadata

**Note**: This phase is optional and can be deferred if focusing on backend API only

### Implementation for Frontend

- [ ] T061 [P] Create frontend/src/components/chat/ directory
- [ ] T062 [P] Create ChatInterface.tsx component in frontend/src/components/chat/
- [ ] T063 [P] Create MessageList.tsx component in frontend/src/components/chat/
- [ ] T064 [P] Create MessageInput.tsx component in frontend/src/components/chat/
- [ ] T065 [P] Create chatApi.ts service in frontend/src/services/ for API client
- [ ] T066 Implement POST /api/{user_id}/chat API call in frontend/src/services/chatApi.ts
- [ ] T067 Integrate chat components in main application page
- [ ] T068 Add tool invocation metadata display in MessageList.tsx component
- [ ] T069 Add error handling and display in ChatInterface.tsx component

**Checkpoint**: Frontend chat interface functional and integrated with backend API

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T070 [P] Add comprehensive logging for all chat operations in backend/routes/chat.py
- [x] T071 [P] Add performance monitoring for AI agent invocation time in backend/services/agent_service.py
- [x] T072 [P] Add performance monitoring for database query time in backend/services/conversation_service.py
- [x] T073 [P] Add API documentation comments in backend/routes/chat.py
- [x] T074 [P] Update backend/README.md with chat API endpoint documentation
- [x] T075 Code review and refactoring for consistency with existing backend patterns
- [x] T076 Security review for input validation and SQL injection prevention
- [x] T077 Performance optimization for large conversation history queries
- [x] T078 Add environment variable configuration for AI agent timeout in backend/.env

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - US1 (Phase 3): Core implementation - MUST complete first
  - US2 (Phase 4): Optimization of US1 - depends on US1
  - US3 (Phase 5): Enhancement of US1 - depends on US1
  - US7 (Phase 6): Validation of US1 - depends on US1
  - US4 (Phase 7): Enhancement of US1 - depends on US1
  - US6 (Phase 8): Can start after US1 - adds error handling
  - US5 (Phase 9): Can start after US1 - adds concurrency handling
- **Frontend (Phase 10)**: Depends on US1 completion - optional
- **Polish (Phase 11)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories - **MUST COMPLETE FIRST**
- **User Story 2 (P1)**: Integrated into US1, optimizations can be done after US1 complete
- **User Story 3 (P1)**: Integrated into US1, enhancements can be done after US1 complete
- **User Story 7 (P1)**: Validation of US1 architecture, can be done after US1 complete
- **User Story 4 (P2)**: Depends on US1 - adds metadata enhancements
- **User Story 6 (P2)**: Depends on US1 - adds error handling
- **User Story 5 (P2)**: Depends on US1 - adds concurrency handling

### Within Each User Story

- Models and schemas before services (Foundational phase)
- Services before routes/endpoints
- Core implementation before enhancements
- Error handling after core functionality
- Story complete before moving to next priority

### Parallel Opportunities

- **Setup (Phase 1)**: All tasks marked [P] can run in parallel (T003, T004)
- **Foundational (Phase 2)**: All tasks marked [P] can run in parallel (T005-T010)
- **User Story 1 (Phase 3)**: Tasks T013-T015, T020 can run in parallel (different files)
- **User Story 4 (Phase 7)**: Tasks T040-T041 can run in parallel
- **User Story 6 (Phase 8)**: Tasks T044-T048 can run in parallel (different error types)
- **Frontend (Phase 10)**: Tasks T061-T064 can run in parallel (different components)
- **Polish (Phase 11)**: All tasks marked [P] can run in parallel (T070-T074)

---

## Parallel Example: User Story 1 Core Services

```bash
# Launch all service creation tasks together:
Task T013: "Create conversation_service.py with create_conversation()"
Task T014: "Implement get_conversation() function"
Task T015: "Implement validate_conversation_ownership() function"
Task T020: "Create agent_service.py with format_conversation_context()"

# These can all be worked on simultaneously as they are in different files
# or different functions within the same file with no dependencies
```

---

## Parallel Example: User Story 6 Error Handling

```bash
# Launch all validation error handlers together:
Task T044: "Implement MISSING_PARAMETER error handling"
Task T045: "Implement VALIDATION_ERROR for empty message"
Task T046: "Implement VALIDATION_ERROR for invalid conversation_id"
Task T047: "Implement NOT_FOUND error handling"
Task T048: "Implement FORBIDDEN error handling"

# These can all be implemented in parallel as they handle different error conditions
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T012) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T013-T030)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Send first message → verify conversation created
   - Send follow-up message → verify history reconstructed
   - Verify messages persisted to database
   - Restart server → verify conversation continues
5. Deploy/demo if ready

**MVP Scope**: 30 tasks (T001-T030) delivers a working stateless chat API with AI agent integration

### Incremental Delivery

1. **Foundation** (T001-T012): Setup + Database models → Foundation ready
2. **MVP** (T013-T030): User Story 1 → Test independently → Deploy/Demo (Core chat working!)
3. **Optimization** (T031-T039): User Stories 2, 3, 7 → Test independently → Deploy/Demo (History optimized, stateless verified)
4. **Enhancement** (T040-T043): User Story 4 → Test independently → Deploy/Demo (Metadata complete)
5. **Robustness** (T044-T055): User Story 6 → Test independently → Deploy/Demo (Error handling complete)
6. **Scale** (T056-T060): User Story 5 → Test independently → Deploy/Demo (Concurrency handled)
7. **UI** (T061-T069): Frontend → Test independently → Deploy/Demo (Full user experience)
8. **Polish** (T070-T078): Cross-cutting concerns → Final deployment

Each increment adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (T001-T012)
2. **Once Foundational is done**:
   - Developer A: User Story 1 core (T013-T030) - PRIORITY
   - Developer B: Can start on error schemas and validation logic prep
   - Developer C: Can start on frontend components prep
3. **After US1 complete**:
   - Developer A: User Story 2, 3, 7 optimizations (T031-T039)
   - Developer B: User Story 6 error handling (T044-T055)
   - Developer C: User Story 4 metadata (T040-T043)
4. **Final phase**:
   - Developer A: User Story 5 concurrency (T056-T060)
   - Developer B: Frontend integration (T061-T069)
   - Developer C: Polish (T070-T078)

---

## Task Summary

**Total Tasks**: 78 tasks
- Phase 1 (Setup): 4 tasks
- Phase 2 (Foundational): 8 tasks
- Phase 3 (US1 - Core): 18 tasks
- Phase 4 (US2 - History): 3 tasks
- Phase 5 (US3 - Persistence): 3 tasks
- Phase 6 (US7 - Stateless): 3 tasks
- Phase 7 (US4 - Metadata): 4 tasks
- Phase 8 (US6 - Errors): 12 tasks
- Phase 9 (US5 - Concurrency): 5 tasks
- Phase 10 (Frontend): 9 tasks (optional)
- Phase 11 (Polish): 9 tasks

**MVP Scope**: 30 tasks (Phases 1-3) delivers working stateless chat API

**Parallel Opportunities**: 25+ tasks can be executed in parallel across different phases

**Independent Test Criteria**:
- US1: Send message → get AI response → verify persistence
- US2: Send multiple messages → verify agent aware of history
- US3: Query database → verify correct data structure
- US7: Restart server → verify conversation continues
- US4: Check response → verify all metadata fields present
- US6: Trigger errors → verify correct error codes returned
- US5: Send concurrent requests → verify no data corruption

---

## Notes

- [P] tasks = different files or independent functions, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- US1, US2, US3, US7 are tightly coupled (core stateless flow) - implement together
- US4, US5, US6 are enhancements - can be added incrementally
- Frontend (Phase 10) is optional - backend API can function independently
- Focus on MVP first (30 tasks) before adding enhancements
