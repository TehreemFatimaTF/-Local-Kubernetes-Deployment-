# Feature Specification: Stateless Chat API with Persistent Conversation History

**Feature Branch**: `003-stateless-chat-api`
**Created**: 2026-01-20
**Status**: Draft
**Input**: User description: "Stateless Chat API with Persistent Conversation History - Target audience: Backend engineers building FastAPI services for AI applications"

## Clarifications

### Session 2026-01-20

- Q: What is the maximum number of messages that should be retrieved and sent to the AI agent as conversation history? → A: No hard limit - retrieve all messages regardless of count
- Q: What is the maximum time the API should wait for the AI agent to respond before timing out? → A: 30 seconds

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Send Chat Message (Priority: P1)

Clients send a chat message to the API endpoint, which creates or retrieves a conversation, reconstructs the full conversation history from the database, invokes the AI agent with the history and new message, persists the AI response, and returns the response to the client.

**Why this priority**: This is the core functionality that enables the entire chat experience. Without it, no conversation can occur. This is the minimum viable feature.

**Independent Test**: Can be fully tested by sending a POST request to `/api/{user_id}/chat` with a message, verifying the AI response is returned, and confirming both user and assistant messages are persisted to the database.

**Acceptance Scenarios**:

1. **Given** user sends first message "add task buy groceries", **When** API processes request, **Then** API creates new conversation, invokes AI agent, persists both messages, and returns AI response with conversation_id
2. **Given** user sends message with existing conversation_id, **When** API processes request, **Then** API retrieves conversation history, reconstructs full context, invokes AI agent, persists new messages, and returns AI response
3. **Given** user sends message without conversation_id, **When** API processes request, **Then** API creates new conversation and returns conversation_id in response
4. **Given** AI agent invokes MCP tools during processing, **When** API receives response, **Then** API persists tool invocation metadata (tool name, parameters, results) and returns it in response
5. **Given** user sends empty message, **When** API validates request, **Then** API returns error with code "VALIDATION_ERROR" and message "message cannot be empty"

---

### User Story 2 - Reconstruct Conversation History (Priority: P1)

For every chat request, the API retrieves all messages for the conversation from the database, orders them chronologically, and provides them to the AI agent as context. This ensures the agent has full conversation history despite the server being stateless.

**Why this priority**: Conversation continuity is essential for the AI agent to understand context and provide relevant responses. Without history reconstruction, each message would be treated in isolation.

**Independent Test**: Can be fully tested by sending multiple messages in sequence, then verifying the AI agent's responses demonstrate awareness of previous messages (e.g., "mark that task as done" referring to a task mentioned earlier).

**Acceptance Scenarios**:

1. **Given** conversation has 5 previous messages, **When** user sends new message, **Then** API retrieves all 5 messages, orders by created_at timestamp, and provides to AI agent
2. **Given** conversation history includes tool invocations, **When** API reconstructs history, **Then** API includes tool call details in the context provided to AI agent
3. **Given** server restarts between messages, **When** user sends new message, **Then** API successfully retrieves conversation from database and continues seamlessly
4. **Given** conversation has any number of messages (no hard limit), **When** API reconstructs history, **Then** API retrieves all messages and provides complete history to AI agent
5. **Given** messages are stored out of order in database, **When** API reconstructs history, **Then** API correctly orders by created_at timestamp

---

### User Story 3 - Persist Conversation and Messages (Priority: P1)

The API persists conversations and messages to the database immediately after processing. Conversations track metadata (user_id, created_at, updated_at), while messages store content, role (user/assistant), timestamps, and optional tool invocation metadata.

**Why this priority**: Persistence is fundamental to the stateless architecture. Without it, conversation history cannot be reconstructed, and the system cannot function.

**Independent Test**: Can be fully tested by sending messages, querying the database directly, and verifying conversations and messages are stored with correct attributes and relationships.

**Acceptance Scenarios**:

1. **Given** user sends first message, **When** API processes request, **Then** API creates conversation record with user_id, created_at, updated_at and message record with role="user"
2. **Given** AI agent responds, **When** API receives response, **Then** API creates message record with role="assistant", content, and created_at timestamp
3. **Given** AI agent invokes tools, **When** API persists assistant message, **Then** API stores tool invocation metadata (tool_name, tool_parameters, tool_result) with the message
4. **Given** database write fails, **When** API attempts to persist, **Then** API returns error to client and does not return AI response (transaction rollback)
5. **Given** conversation already exists, **When** user sends new message, **Then** API updates conversation's updated_at timestamp

---

### User Story 4 - Return AI Response with Metadata (Priority: P2)

The API returns a structured response containing the AI agent's message, conversation_id, message_id, and optional tool invocation metadata. This allows clients to display responses and track conversation state.

**Why this priority**: While returning the AI response is essential, the metadata structure is important for client integration but not critical for basic functionality.

**Independent Test**: Can be fully tested by sending messages and verifying the response structure matches the documented schema with all required fields present.

**Acceptance Scenarios**:

1. **Given** AI agent responds without tool invocations, **When** API returns response, **Then** response includes: conversation_id, message_id, role="assistant", content, created_at
2. **Given** AI agent invokes tools, **When** API returns response, **Then** response includes tool_invocations array with tool_name, parameters, result for each invocation
3. **Given** new conversation created, **When** API returns first response, **Then** response includes newly created conversation_id
4. **Given** existing conversation, **When** API returns response, **Then** response includes existing conversation_id
5. **Given** API processes request successfully, **When** returning response, **Then** HTTP status code is 200 and response is valid JSON

---

### User Story 5 - Handle Concurrent Requests (Priority: P2)

The API handles multiple concurrent requests for the same conversation without data corruption or race conditions. Database transactions ensure message ordering and consistency.

**Why this priority**: Concurrent access is important for production reliability but not critical for initial functionality. Single-user testing can proceed without this.

**Independent Test**: Can be fully tested by sending multiple requests simultaneously for the same conversation and verifying all messages are persisted correctly with proper ordering.

**Acceptance Scenarios**:

1. **Given** two clients send messages simultaneously to same conversation, **When** API processes both, **Then** both messages are persisted with correct created_at timestamps and no data loss
2. **Given** client sends message while AI agent is processing previous message, **When** API handles new request, **Then** API waits for previous transaction to complete or processes in parallel safely
3. **Given** database uses optimistic locking, **When** concurrent updates occur, **Then** API handles conflicts gracefully and retries if necessary
4. **Given** multiple messages arrive rapidly, **When** API persists them, **Then** messages maintain correct chronological order based on created_at timestamps

---

### User Story 6 - Error Handling and Validation (Priority: P2)

The API validates all inputs, handles errors from the AI agent and MCP server gracefully, and returns structured error responses. Errors include validation failures, database errors, AI agent errors, and MCP tool errors.

**Why this priority**: Robust error handling is essential for production use but not required for initial prototype testing.

**Independent Test**: Can be fully tested by triggering various error conditions and verifying error responses match the documented format and codes.

**Acceptance Scenarios**:

1. **Given** request missing required user_id, **When** API validates request, **Then** API returns 400 error with code "MISSING_PARAMETER"
2. **Given** request has invalid conversation_id, **When** API retrieves conversation, **Then** API returns 404 error with code "NOT_FOUND"
3. **Given** AI agent returns error, **When** API processes response, **Then** API returns 500 error with code "AI_AGENT_ERROR" and error details
4. **Given** MCP tool invocation fails, **When** AI agent reports failure, **Then** API persists error in tool invocation metadata and returns it to client
5. **Given** database connection fails, **When** API attempts operation, **Then** API returns 503 error with code "DATABASE_ERROR"
6. **Given** conversation belongs to different user, **When** API validates access, **Then** API returns 403 error with code "FORBIDDEN"

---

### User Story 7 - Resume After Server Restart (Priority: P1)

The API operates statelessly, storing no conversation state in memory. After server restart, the API can immediately process requests by retrieving all necessary state from the database.

**Why this priority**: Stateless operation is a fundamental architectural requirement for scalability and reliability. This is non-negotiable.

**Independent Test**: Can be fully tested by starting a conversation, restarting the server, sending a new message, and verifying the conversation continues seamlessly.

**Acceptance Scenarios**:

1. **Given** server restarts mid-conversation, **When** user sends next message, **Then** API retrieves conversation and history from database and processes normally
2. **Given** server has no in-memory cache, **When** any request arrives, **Then** API retrieves all necessary data from database
3. **Given** multiple server instances running, **When** requests are load-balanced, **Then** any instance can handle any request without shared state
4. **Given** server crashes during request processing, **When** client retries, **Then** API handles retry safely (idempotency considerations)

---

### Edge Cases

- What happens when conversation history becomes very large (e.g., 1000+ messages)? API retrieves all messages without pagination; performance monitoring and query optimization required.
- How does the API handle extremely long user messages (e.g., 10,000 characters)?
- What happens when AI agent takes longer than 30 seconds to respond? API times out and returns error with code "AI_AGENT_TIMEOUT".
- How does the API handle malformed JSON in request body?
- What happens when user_id format is invalid or contains special characters?
- How does the API handle database transaction deadlocks?
- What happens when AI agent returns malformed response?
- How does the API handle Unicode, emojis, and special characters in messages?
- What happens when conversation_id exists but belongs to different user?
- How does the API handle rate limiting or throttling from AI agent or MCP server?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: API MUST expose POST endpoint at `/api/{user_id}/chat` accepting JSON request body
- **FR-002**: Request body MUST include message (required string) and conversation_id (optional string)
- **FR-003**: API MUST validate user_id parameter and return error if missing or invalid
- **FR-004**: API MUST create new conversation if conversation_id not provided or does not exist
- **FR-005**: API MUST retrieve existing conversation if conversation_id provided and exists
- **FR-006**: API MUST validate conversation belongs to specified user_id before processing
- **FR-007**: API MUST retrieve all messages for conversation ordered by created_at timestamp
- **FR-008**: API MUST reconstruct conversation history and provide to AI agent as context
- **FR-009**: API MUST invoke AI agent with conversation history and new user message with 30-second timeout
- **FR-010**: API MUST persist user message to database with role="user", content, created_at
- **FR-011**: API MUST persist AI agent response to database with role="assistant", content, created_at
- **FR-012**: API MUST persist tool invocation metadata when AI agent uses MCP tools
- **FR-013**: Tool invocation metadata MUST include tool_name, parameters, result, and timestamp
- **FR-014**: API MUST return structured response with conversation_id, message_id, role, content, created_at
- **FR-015**: API MUST include tool_invocations array in response when tools were used
- **FR-016**: API MUST update conversation's updated_at timestamp on every new message
- **FR-017**: API MUST operate statelessly with no in-memory conversation state
- **FR-018**: API MUST use database transactions to ensure message persistence consistency
- **FR-019**: API MUST return structured errors with code, message, and optional details
- **FR-020**: API MUST handle concurrent requests to same conversation safely

### Key Entities

- **Conversation**: Represents a chat session with attributes:
  - id: Unique identifier (string, auto-generated)
  - user_id: Owner identifier (string, required)
  - created_at: Creation timestamp (ISO 8601 datetime)
  - updated_at: Last activity timestamp (ISO 8601 datetime)

- **Message**: Represents a single message in a conversation with attributes:
  - id: Unique identifier (string, auto-generated)
  - conversation_id: Parent conversation (string, foreign key)
  - role: Message sender (enum: "user" or "assistant")
  - content: Message text (string, required)
  - tool_invocations: Optional array of tool invocation metadata
  - created_at: Creation timestamp (ISO 8601 datetime)

- **Tool Invocation**: Represents an MCP tool call made by the AI agent with attributes:
  - tool_name: Name of the MCP tool invoked (string)
  - parameters: Input parameters passed to tool (JSON object)
  - result: Output returned by tool (JSON object)
  - timestamp: When tool was invoked (ISO 8601 datetime)

- **Chat Request**: API request structure with attributes:
  - user_id: User identifier (path parameter)
  - message: User's message text (required)
  - conversation_id: Optional conversation to continue (optional)

- **Chat Response**: API response structure with attributes:
  - conversation_id: Conversation identifier
  - message_id: Newly created message identifier
  - role: Always "assistant"
  - content: AI agent's response text
  - tool_invocations: Optional array of tool invocation metadata
  - created_at: Response timestamp

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: API successfully processes 100% of valid chat requests and returns AI responses
- **SC-002**: API correctly reconstructs conversation history for 100% of requests with existing conversations
- **SC-003**: API persists 100% of user and assistant messages to database without data loss
- **SC-004**: API operates statelessly with zero reliance on in-memory conversation state
- **SC-005**: API successfully resumes conversations after server restart with 100% continuity
- **SC-006**: API response time averages under 3 seconds for messages without tool invocations
- **SC-007**: API response time averages under 5 seconds for messages with tool invocations
- **SC-008**: API handles at least 50 concurrent requests without data corruption or errors
- **SC-009**: API returns structured errors for 100% of invalid requests with appropriate error codes
- **SC-010**: API correctly enforces user_id scoping with zero cross-user conversation access

## Assumptions *(mandatory)*

- The database (Neon Serverless PostgreSQL) is available and accessible with appropriate connection credentials
- Database schema is pre-created with conversations and messages tables and appropriate indexes
- The OpenAI Agents SDK is properly configured and can be invoked from the API
- The MCP server is running and accessible for tool invocations
- User authentication is handled by a separate system; the API trusts provided user_id values
- Conversation IDs and message IDs are globally unique (UUIDs or similar)
- Network latency between API, database, AI agent, and MCP server is reasonable (<100ms each)
- The AI agent returns responses in a predictable format that can be parsed
- Tool invocation metadata from the AI agent includes all necessary details (tool name, parameters, results)
- Clients can handle both successful responses and error responses appropriately
- Message content is limited to reasonable size (e.g., 10,000 characters) by client-side validation

## Constraints *(mandatory)*

- API MUST remain stateless across all requests with no in-memory conversation state
- Conversation state MUST live exclusively in the database
- API MUST support resuming conversations after server restart without data loss
- API MUST integrate with OpenAI Agents SDK for AI agent invocation
- API MUST integrate with MCP server for tool invocations (via AI agent)
- API MUST use database transactions to ensure data consistency
- API MUST enforce user_id scoping for all conversation access
- API MUST NOT implement AI prompt engineering or agent logic (handled by AI agent)
- API MUST NOT implement MCP tool functionality (handled by MCP server)
- API MUST NOT implement frontend UI or chat components

## Out of Scope *(mandatory)*

- Frontend UI components or ChatKit integrations
- AI prompt engineering, system prompts, or agent behavior tuning
- MCP tool implementations or tool definitions
- Database migration tooling or schema management
- User authentication mechanisms (login, signup, session management)
- User authorization rules beyond user_id scoping
- Message search or filtering functionality
- Conversation deletion or archiving
- Message editing or deletion
- Conversation export or import
- Real-time updates or WebSocket connections
- Message read receipts or typing indicators
- Multi-user conversations or group chats
- Message attachments or file uploads
- Rate limiting or throttling (handled by infrastructure)
- Monitoring, logging, or observability infrastructure

## Dependencies *(mandatory)*

- **OpenAI Agents SDK**: Required for invoking the AI agent with conversation history
- **MCP Server**: Required for AI agent to invoke task management tools
- **Database (Neon Serverless PostgreSQL)**: Required for persisting conversations and messages
- **Database Schema**: Must be pre-created with conversations and messages tables
- **AI Agent (001-nl-todo-agent)**: Must be configured and accessible via OpenAI Agents SDK
- **MCP Tools (002-mcp-todo-server)**: Must be running and accessible to AI agent

## Risks & Mitigations *(mandatory)*

### Risk 1: AI Agent Latency
**Description**: AI agent takes longer than 30 seconds to process requests, causing API timeouts.
**Impact**: High - Users experience timeout errors when AI agent processing exceeds 30 seconds, particularly for complex multi-tool invocations.
**Mitigation**: Implement 30-second timeout on AI agent invocations. Return AI_AGENT_TIMEOUT error gracefully with clear message. Consider async processing for long-running requests as future enhancement. Monitor AI agent response times and alert when approaching timeout threshold (e.g., >25 seconds). Optimize tool invocation patterns to minimize latency.

### Risk 2: Database Connection Failures
**Description**: Database becomes unavailable or connection pool exhausted, preventing conversation persistence.
**Impact**: High - API cannot function without database access.
**Mitigation**: Implement connection retry logic with exponential backoff. Use connection pooling efficiently. Return DATABASE_ERROR with clear message. Monitor database health and alert on connection failures.

### Risk 3: Conversation History Size
**Description**: Long conversations with hundreds or thousands of messages cause slow history reconstruction or exceed AI agent context limits.
**Impact**: Medium-High - Performance degrades for long conversations, potentially causing timeouts. AI agent may fail if context window exceeded.
**Mitigation**: No hard limit enforced; all messages retrieved. Implement database query optimization and appropriate indexes on conversation_id and created_at. Monitor query performance and alert on slow queries. Ensure AI agent can handle large context windows or implement graceful degradation. Consider conversation archiving for inactive conversations as future enhancement.

### Risk 4: Concurrent Message Conflicts
**Description**: Multiple clients send messages simultaneously to same conversation, causing race conditions or message ordering issues.
**Impact**: Medium - Messages may be stored out of order or data corruption may occur.
**Mitigation**: Use database transactions with appropriate isolation levels. Rely on created_at timestamps for ordering. Implement optimistic locking if necessary. Test concurrent access scenarios thoroughly.

### Risk 5: Tool Invocation Failures
**Description**: MCP tools fail or return errors, causing AI agent to fail or return incomplete responses.
**Impact**: Medium - Users cannot complete task operations, reducing functionality.
**Mitigation**: AI agent should handle tool errors gracefully. API should persist tool error metadata. Return partial responses when possible. Provide clear error messages to users about tool failures.

### Risk 6: Data Consistency Issues
**Description**: Server crashes or database transaction failures cause incomplete message persistence (user message saved but assistant message lost).
**Impact**: High - Conversation history becomes inconsistent, confusing users and AI agent.
**Mitigation**: Use database transactions to ensure atomic writes. Implement idempotency for retries. Log all transaction failures for investigation. Consider implementing message status tracking (pending, completed, failed).

## Notes *(optional)*

- This specification focuses on the API contract and behavior. Implementation details for OpenAI Agents SDK integration and database operations are intentionally minimal.
- The stateless constraint is critical for horizontal scalability. Multiple API instances can run concurrently without coordination.
- Tool invocation metadata structure should be flexible to accommodate different tool types and response formats.
- Consider implementing request idempotency keys to handle client retries safely.
- Future enhancements could include conversation search, message filtering, and real-time updates via WebSockets.
- The API acts as the "glue" layer connecting the AI agent (001-nl-todo-agent) and MCP server (002-mcp-todo-server) with persistent storage.
- Error handling should distinguish between client errors (4xx), server errors (5xx), and external service errors (AI agent, MCP server).
