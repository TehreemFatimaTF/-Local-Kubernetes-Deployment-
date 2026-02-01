
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# Response wrappers to match frontend expectations
class APIResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None
    statusCode: int

# Task schemas
class TaskRequest(BaseModel):
    title: str
    description: Optional[str] = None
    dueDate: Optional[datetime] = None

class TaskResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    completed: bool
    userId: str
    createdAt: datetime
    updatedAt: datetime
    dueDate: Optional[datetime] = None

class TasksResponse(BaseModel):
    tasks: List[TaskResponse]

class TaskUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    dueDate: Optional[datetime] = None

# User schema (for compatibility with frontend expectations)
class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime


# Chat API schemas
class ChatRequest(BaseModel):
    """Request schema for chat endpoint"""
    message: str = Field(min_length=1, max_length=10000)
    conversation_id: Optional[str] = None


class ToolInvocation(BaseModel):
    """Schema for tool invocation metadata"""
    tool_name: str
    parameters: dict
    result: dict
    timestamp: datetime


class ChatResponse(BaseModel):
    """Response schema for chat endpoint"""
    conversation_id: str
    message_id: str
    role: str = "assistant"
    content: str
    tool_invocations: Optional[List[ToolInvocation]] = None
    created_at: datetime


class ErrorResponse(BaseModel):
    """Error response schema"""
    code: str
    message: str
    details: Optional[dict] = None