from sqlmodel import SQLModel, Field, Column
from datetime import datetime
from typing import Optional
import uuid

class TaskBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    user_id: str = Field(max_length=255)
    due_date: Optional[datetime] = Field(default=None)

class Task(TaskBase, table=True):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Ensure updated_at is refreshed on updates
    def __setattr__(self, name, value):
        if name == 'updated_at':
            value = datetime.utcnow()
        super().__setattr__(name, value)

class TaskCreate(SQLModel):
    """Model for creating a task - only includes fields the client should send"""
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    due_date: Optional[datetime] = Field(default=None)

class TaskUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    due_date: Optional[datetime] = None

class TaskPublic(TaskBase):
    id: str
    created_at: datetime
    updated_at: datetime

class UserBase(SQLModel):
    email: str = Field(unique=True, max_length=255)
    name: Optional[str] = Field(default=None, max_length=255)


class User(UserBase, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    hashed_password: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class UserCreate(UserBase):
    password: str


# Chat models for stateless conversation API
class Conversation(SQLModel, table=True):
    """Conversation model for chat sessions"""
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(max_length=255, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)


class Message(SQLModel, table=True):
    """Message model for conversation messages"""
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    conversation_id: str = Field(foreign_key="conversation.id", index=True)
    role: str = Field(max_length=20)  # "user" or "assistant"
    content: str
    tool_invocations: Optional[str] = Field(default=None)  # JSON string for tool metadata
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    # T031: Composite index on (conversation_id, created_at) for optimized history queries
    # This index significantly improves performance when retrieving conversation history
    # Database will automatically use this index for ORDER BY created_at queries
    # filtered by conversation_id
