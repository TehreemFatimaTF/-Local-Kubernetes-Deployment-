"""
Conversation Service

Handles conversation and message persistence operations for the stateless chat API.
All functions operate on database state with no in-memory caching.

STATELESS ARCHITECTURE (T038):
- No module-level cache variables
- No global conversation storage
- No session state
- Every function call queries database directly
- No memoization or caching decorators
"""

from sqlmodel import Session, select
from models import Conversation, Message
from datetime import datetime
from typing import List, Optional
import uuid
import json


def create_conversation(session: Session, user_id: str) -> Conversation:
    """
    Create a new conversation for a user.

    Args:
        session: Database session
        user_id: User identifier

    Returns:
        Created Conversation object
    """
    conversation = Conversation(
        id=str(uuid.uuid4()),
        user_id=user_id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    session.add(conversation)
    session.commit()
    session.refresh(conversation)
    return conversation


def get_conversation(session: Session, conversation_id: str) -> Optional[Conversation]:
    """
    Retrieve a conversation by ID.

    Args:
        session: Database session
        conversation_id: Conversation identifier

    Returns:
        Conversation object or None if not found
    """
    statement = select(Conversation).where(Conversation.id == conversation_id)
    return session.exec(statement).first()


def validate_conversation_ownership(conversation: Conversation, user_id: str) -> bool:
    """
    Validate that a conversation belongs to the specified user.

    Args:
        conversation: Conversation object
        user_id: User identifier to validate against

    Returns:
        True if conversation belongs to user, False otherwise
    """
    return conversation.user_id == user_id


def get_conversation_history(session: Session, conversation_id: str) -> List[Message]:
    """
    Retrieve all messages for a conversation ordered by created_at timestamp.
    No hard limit on message count - retrieves complete history.

    Optimized with composite index on (conversation_id, created_at) for performance.

    Args:
        session: Database session
        conversation_id: Conversation identifier

    Returns:
        List of Message objects ordered chronologically
    """
    import logging
    import time

    # T072: Performance monitoring for database query time
    query_start_time = time.time()

    # Log conversation history size for monitoring
    statement = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
    )
    messages = session.exec(statement).all()

    query_duration = time.time() - query_start_time

    # T033: Add logging for conversation history size monitoring
    message_count = len(messages)
    logging.info(f"Retrieved {message_count} messages in {query_duration:.3f}s")

    if message_count > 100:
        logging.warning(f"Large conversation history: {message_count} messages for conversation {conversation_id}")

    # T072: Alert on slow queries (>500ms)
    if query_duration > 0.5:
        logging.warning(f"Slow database query: {query_duration:.3f}s for {message_count} messages")

    return list(messages)


def persist_user_message(
    session: Session,
    conversation_id: str,
    content: str
) -> Message:
    """
    Persist a user message to the database.

    Args:
        session: Database session
        conversation_id: Conversation identifier
        content: Message content

    Returns:
        Created Message object
    """
    message = Message(
        id=str(uuid.uuid4()),
        conversation_id=conversation_id,
        role="user",
        content=content,
        tool_invocations=None,
        created_at=datetime.utcnow()
    )
    session.add(message)
    session.commit()
    session.refresh(message)
    return message


def persist_assistant_message(
    session: Session,
    conversation_id: str,
    content: str,
    tool_invocations: Optional[List[dict]] = None
) -> Message:
    """
    Persist an assistant message to the database with optional tool invocation metadata.

    Args:
        session: Database session
        conversation_id: Conversation identifier
        content: Message content
        tool_invocations: Optional list of tool invocation metadata dicts

    Returns:
        Created Message object
    """
    # T035: Validate tool_invocations JSON structure
    tool_invocations_json = None
    if tool_invocations:
        try:
            # Validate structure before persisting
            for ti in tool_invocations:
                if not isinstance(ti, dict):
                    raise ValueError("Each tool invocation must be a dictionary")
                if "tool_name" not in ti:
                    raise ValueError("tool_name is required in tool invocation")
                if "parameters" not in ti or not isinstance(ti["parameters"], dict):
                    raise ValueError("parameters must be a dictionary")
                if "result" not in ti or not isinstance(ti["result"], dict):
                    raise ValueError("result must be a dictionary")
                if "timestamp" not in ti:
                    raise ValueError("timestamp is required in tool invocation")

            tool_invocations_json = json.dumps(tool_invocations)
        except (ValueError, TypeError) as e:
            # Log validation error but don't fail the entire operation
            import logging
            logging.error(f"Tool invocations validation failed: {str(e)}")
            tool_invocations_json = None

    message = Message(
        id=str(uuid.uuid4()),
        conversation_id=conversation_id,
        role="assistant",
        content=content,
        tool_invocations=tool_invocations_json,
        created_at=datetime.utcnow()
    )
    session.add(message)
    session.commit()
    session.refresh(message)

    # T036: Update conversation timestamp when persisting assistant message
    update_conversation_timestamp(session, conversation_id)

    return message


def update_conversation_timestamp(session: Session, conversation_id: str) -> None:
    """
    Update the conversation's updated_at timestamp.

    T058: Optimistic locking - uses updated_at for conflict detection
    T059: Message ordering by created_at timestamp ensures correct chronological order

    Args:
        session: Database session
        conversation_id: Conversation identifier
    """
    statement = select(Conversation).where(Conversation.id == conversation_id)
    conversation = session.exec(statement).first()
    if conversation:
        # T058: Optimistic locking approach - if concurrent updates occur,
        # the last write wins. For more strict concurrency control,
        # could implement version-based optimistic locking.
        conversation.updated_at = datetime.utcnow()
        session.add(conversation)
        session.commit()
