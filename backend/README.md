# Todo Web Application Backend

Backend API for the Todo Web Application built with FastAPI, SQLModel, and PostgreSQL.

## Features

- JWT-based authentication verification using Better Auth shared secret
- User-isolated task management with persistent storage in Neon PostgreSQL
- Full CRUD operations for tasks
- Secure access control ensuring users can only access their own data

## Technology Stack

- **Language**: Python 3.11+
- **Framework**: FastAPI
- **ORM**: SQLModel
- **Database**: Neon Serverless PostgreSQL
- **Auth**: JWT verification using Better Auth secret
- **AI**: Google Gemini API (gemini-1.5-flash or gemini-1.5-pro)

## Installation

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

2. Set up your environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

## Environment Variables

- `BETTER_AUTH_SECRET`: Secret key used to verify JWT tokens issued by Better Auth
- `DATABASE_URL`: PostgreSQL connection string for Neon database
- `GEMINI_API_KEY`: Google Gemini API key for AI agent integration
- `GEMINI_MODEL`: Gemini model to use (default: gemini-1.5-flash, options: gemini-1.5-flash, gemini-1.5-pro)
- `AI_AGENT_TIMEOUT`: Timeout in seconds for AI agent invocations (default: 30)

## Running the Application

Start the development server:
```bash
uvicorn main:app --reload --port 8000
```

## API Endpoints

### Authentication Endpoints
All API endpoints are protected by JWT authentication and follow the pattern:

### Task Management Endpoints
- `GET    /api/{user_id}/tasks` - Get all tasks for a user
- `POST   /api/{user_id}/tasks` - Create a new task for a user
- `GET    /api/{user_id}/tasks/{id}` - Get a specific task
- `PUT    /api/{user_id}/tasks/{id}` - Update a specific task
- `DELETE /api/{user_id}/tasks/{id}` - Delete a specific task
- `PATCH  /api/{user_id}/tasks/{id}/complete` - Toggle task completion status

### Chat API Endpoint (T074)
- `POST   /api/{user_id}/chat` - Send a chat message and receive AI agent response

**Chat API Details**:

**Request Body**:
```json
{
  "message": "Add task: buy groceries",
  "conversation_id": "optional-conversation-uuid"
}
```

**Response**:
```json
{
  "conversation_id": "conversation-uuid",
  "message_id": "message-uuid",
  "role": "assistant",
  "content": "I've added 'buy groceries' to your tasks.",
  "tool_invocations": [
    {
      "tool_name": "add_task",
      "parameters": {"title": "buy groceries"},
      "result": {"id": "task-uuid", "title": "buy groceries"},
      "timestamp": "2026-01-20T10:30:00Z"
    }
  ],
  "created_at": "2026-01-20T10:30:00Z"
}
```

**Features**:
- Stateless architecture - no in-memory conversation state
- Full conversation history reconstruction from database
- AI agent integration with 30-second timeout
- Tool invocation metadata tracking
- Comprehensive error handling with structured error codes

**Error Codes**:
- `MISSING_PARAMETER`: Required parameter missing
- `VALIDATION_ERROR`: Invalid input (empty message, invalid format, length exceeded)
- `NOT_FOUND`: Conversation not found
- `FORBIDDEN`: Conversation doesn't belong to user
- `AI_AGENT_TIMEOUT`: AI agent exceeded 30-second timeout
- `AI_AGENT_ERROR`: AI agent invocation failed
- `DATABASE_ERROR`: Database operation failed

## Security Features

- JWT tokens issued by Better Auth are verified using the shared secret
- All requests require valid JWT authentication
- Users can only access their own data
- Cross-user data access is prevented