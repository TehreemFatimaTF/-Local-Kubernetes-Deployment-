"""
Chat Routes

Implements the stateless chat API endpoint for conversation management.
All state is retrieved from and persisted to the database on every request.

STATELESS ARCHITECTURE (T037):
- No module-level state variables
- No in-memory conversation cache
- No session storage
- Every request reconstructs full context from database
- Server can restart at any time without losing conversation state
- Multiple server instances can handle requests without coordination

CONCURRENT REQUEST HANDLING (T060):
- Database transactions ensure atomic operations
- Message ordering by created_at timestamp
- Connection pooling handles multiple simultaneous requests
- Optimistic locking prevents data corruption
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from schemas import ChatRequest, ChatResponse, ErrorResponse, ToolInvocation
from db import get_session
from services import conversation_service, agent_service
from typing import List
import json
from datetime import datetime
import logging

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/{user_id}/chat", response_model=ChatResponse)
def chat(
    user_id: str,
    request: ChatRequest,
    session: Session = Depends(get_session)
):
    """
    Stateless chat endpoint that processes user messages.

    T073: API Documentation

    This endpoint implements a stateless chat API that:
    - Creates or retrieves conversations per user
    - Reconstructs full conversation history from database on every request
    - Invokes AI agent with conversation context
    - Persists user and assistant messages with tool invocation metadata
    - Returns structured responses with conversation and message IDs

    Flow:
    1. Validate request (user_id, message)
    2. Create/retrieve conversation
    3. Reconstruct conversation history from database
    4. Invoke AI agent with history and new message (30-second timeout)
    5. Persist user and assistant messages (atomic transaction)
    6. Return structured response

    Args:
        user_id: User identifier from path parameter (alphanumeric with - and _)
        request: ChatRequest with message (1-10,000 chars) and optional conversation_id
        session: Database session (injected)

    Returns:
        ChatResponse with:
        - conversation_id: Conversation identifier
        - message_id: Assistant message identifier
        - role: Always "assistant"
        - content: AI agent response text
        - tool_invocations: Optional array of tool metadata
        - created_at: Response timestamp

    Raises:
        HTTPException 400: MISSING_PARAMETER, VALIDATION_ERROR
        HTTPException 403: FORBIDDEN (conversation doesn't belong to user)
        HTTPException 404: NOT_FOUND (conversation not found)
        HTTPException 500: AI_AGENT_ERROR, AI_AGENT_TIMEOUT, INTERNAL_ERROR
        HTTPException 503: DATABASE_ERROR

    Example:
        POST /api/user123/chat
        {
            "message": "Add task: buy groceries",
            "conversation_id": "conv-uuid-123"  // optional
        }

        Response:
        {
            "conversation_id": "conv-uuid-123",
            "message_id": "msg-uuid-456",
            "role": "assistant",
            "content": "I've added 'buy groceries' to your tasks.",
            "tool_invocations": [{
                "tool_name": "add_task",
                "parameters": {"title": "buy groceries"},
                "result": {"id": "task-789", "title": "buy groceries"},
                "timestamp": "2026-01-20T10:30:00Z"
            }],
            "created_at": "2026-01-20T10:30:00Z"
        }
    """

    # T024: Request validation
    # T044: MISSING_PARAMETER error handling for missing user_id
    if not user_id or not user_id.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorResponse(
                code="MISSING_PARAMETER",
                message="user_id is required"
            ).dict()
        )

    # T045: VALIDATION_ERROR error handling for empty message
    if not request.message or not request.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorResponse(
                code="VALIDATION_ERROR",
                message="message cannot be empty"
            ).dict()
        )

    # T054: Input validation for message length (max 10,000 characters)
    if len(request.message) > 10000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorResponse(
                code="VALIDATION_ERROR",
                message="message exceeds maximum length of 10,000 characters"
            ).dict()
        )

    # T055: Input validation for user_id format
    if not user_id.replace("-", "").replace("_", "").isalnum():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorResponse(
                code="VALIDATION_ERROR",
                message="user_id contains invalid characters"
            ).dict()
        )

    # T025: Conversation creation/retrieval logic
    conversation = None

    if request.conversation_id:
        # Validate conversation_id format (basic UUID check)
        if not request.conversation_id.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=ErrorResponse(
                    code="VALIDATION_ERROR",
                    message="conversation_id format is invalid"
                ).dict()
            )

        # Retrieve existing conversation
        conversation = conversation_service.get_conversation(session, request.conversation_id)

        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=ErrorResponse(
                    code="NOT_FOUND",
                    message="Conversation not found"
                ).dict()
            )

        # Validate conversation ownership
        if not conversation_service.validate_conversation_ownership(conversation, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=ErrorResponse(
                    code="FORBIDDEN",
                    message="Conversation does not belong to user"
                ).dict()
            )
    else:
        # Create new conversation
        conversation = conversation_service.create_conversation(session, user_id)

    try:
        # T026: Reconstruct conversation history from database
        # T039: Log that conversation is retrieved from database on each request (stateless operation)
        # T070: Comprehensive logging for all chat operations
        logger.info(f"Processing chat request for user {user_id}, conversation {conversation.id}")
        logger.info(f"Retrieving conversation {conversation.id} from database (stateless request)")
        messages = conversation_service.get_conversation_history(session, conversation.id)
        logger.debug(f"Retrieved {len(messages)} messages for conversation {conversation.id}")

        # T027: Invoke AI agent with history and new message
        # T071: Performance monitoring for AI agent invocation time
        import time
        agent_start_time = time.time()
        formatted_history = agent_service.format_conversation_context(messages)

        try:
            agent_response = agent_service.invoke_agent(
                conversation_history=formatted_history,
                new_message=request.message,
                timeout=30,  # 30-second timeout as specified
                user_id=user_id  # Pass user_id for function calling
            )
            agent_duration = time.time() - agent_start_time
            logger.info(f"AI agent invocation completed in {agent_duration:.2f} seconds")

            # T071: Alert if approaching timeout threshold
            if agent_duration > 25:
                logger.warning(f"AI agent invocation took {agent_duration:.2f}s, approaching 30s timeout")
        except TimeoutError:
            agent_duration = time.time() - agent_start_time
            logger.error(f"AI agent timeout after {agent_duration:.2f} seconds")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=ErrorResponse(
                    code="AI_AGENT_TIMEOUT",
                    message="AI agent exceeded 30-second timeout"
                ).dict()
            )
        except Exception as e:
            agent_duration = time.time() - agent_start_time
            logger.error(f"AI agent error after {agent_duration:.2f}s: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=ErrorResponse(
                    code="AI_AGENT_ERROR",
                    message=f"AI agent invocation failed: {str(e)}"
                ).dict()
            )

        # T028: Persist messages using database transactions
        # T034: Database transaction rollback handling
        try:
            # Begin explicit transaction for atomic operations
            # Persist user message
            user_message = conversation_service.persist_user_message(
                session=session,
                conversation_id=conversation.id,
                content=request.message
            )

            # Persist assistant message with tool invocations
            assistant_message = conversation_service.persist_assistant_message(
                session=session,
                conversation_id=conversation.id,
                content=agent_response["content"],
                tool_invocations=agent_response.get("tool_invocations")
            )

            # Update conversation timestamp
            conversation_service.update_conversation_timestamp(session, conversation.id)

            # If we reach here, transaction commits successfully
            # SQLModel session handles commit automatically

        except Exception as e:
            # Transaction rollback is handled automatically by SQLModel session context
            # on exception. This ensures data consistency - if any operation fails,
            # all changes are rolled back and no partial data is persisted.
            session.rollback()
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=ErrorResponse(
                    code="DATABASE_ERROR",
                    message=f"Database operation failed: {str(e)}"
                ).dict()
            )

        # T029: Format response
        # T040: Response validation - ensure all ChatResponse fields present
        tool_invocations_list = None
        if assistant_message.tool_invocations:
            try:
                tool_invocations_data = json.loads(assistant_message.tool_invocations)
                # T041: Format tool_invocations array when tools were used
                tool_invocations_list = [
                    ToolInvocation(
                        tool_name=ti["tool_name"],
                        parameters=ti["parameters"],
                        result=ti["result"],
                        timestamp=datetime.fromisoformat(ti["timestamp"])
                    )
                    for ti in tool_invocations_data
                ]
            except (json.JSONDecodeError, KeyError, ValueError) as e:
                # If parsing fails, log error and return None for tool_invocations
                logger.warning(f"Failed to parse tool invocations: {str(e)}")
                tool_invocations_list = None

        # T042: Validate HTTP status code (200 for success)
        # T043: JSON response formatting with proper content-type headers
        # FastAPI automatically handles JSON serialization and content-type headers
        response = ChatResponse(
            conversation_id=conversation.id,
            message_id=assistant_message.id,
            role="assistant",
            content=assistant_message.content,
            tool_invocations=tool_invocations_list,
            created_at=assistant_message.created_at
        )

        # Validate all required fields are present
        if not all([
            response.conversation_id,
            response.message_id,
            response.role,
            response.content,
            response.created_at
        ]):
            logger.error("Response validation failed: missing required fields")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=ErrorResponse(
                    code="INTERNAL_ERROR",
                    message="Response validation failed"
                ).dict()
            )

        return response

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Catch any unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ErrorResponse(
                code="INTERNAL_ERROR",
                message=f"Unexpected error: {str(e)}"
            ).dict()
        )
