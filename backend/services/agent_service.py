"""
Agent Service

Handles AI agent integration using Google Gemini API.
Formats conversation context, invokes the agent, and parses tool invocation metadata.
"""

from typing import List, Dict, Optional
from datetime import datetime
import json
import asyncio
import os
import google.generativeai as genai


def format_conversation_context(messages: List) -> List[Dict]:
    """
    Format conversation history for OpenAI Agents SDK.
    Includes tool invocation metadata for complete context reconstruction.

    Args:
        messages: List of Message objects from database

    Returns:
        List of formatted message dicts for agent context
    """
    formatted_messages = []

    for message in messages:
        formatted_message = {
            "role": message.role,
            "content": message.content
        }

        # T032: Include tool invocation metadata if present for complete context
        if message.tool_invocations:
            try:
                tool_calls = json.loads(message.tool_invocations)
                # Include detailed tool call information in context
                formatted_message["tool_calls"] = tool_calls

                # Add tool results to content for better context understanding
                if tool_calls:
                    tool_summary = "\n[Tool invocations: " + ", ".join([
                        f"{tc.get('tool_name', 'unknown')}" for tc in tool_calls
                    ]) + "]"
                    formatted_message["content"] = message.content + tool_summary
            except json.JSONDecodeError:
                # If JSON parsing fails, skip tool calls but continue
                pass

        formatted_messages.append(formatted_message)

    return formatted_messages


def invoke_agent(
    conversation_history: List[Dict],
    new_message: str,
    timeout: int = 30,
    user_id: str = None
) -> Dict:
    """
    Invoke the AI agent with conversation history and new message using Google Gemini.
    Implements 30-second timeout and function calling for task management.

    Args:
        conversation_history: Formatted conversation history
        new_message: New user message
        timeout: Timeout in seconds (default 30)
        user_id: User ID for task operations

    Returns:
        Dict containing agent response with content and optional tool_invocations

    Raises:
        TimeoutError: If agent invocation exceeds timeout
        Exception: If agent invocation fails
    """
    try:
        # Configure Gemini API
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise Exception("GEMINI_API_KEY not found in environment variables")

        genai.configure(api_key=api_key)

        # Define function declarations for task management
        add_task_func = genai.protos.FunctionDeclaration(
            name="add_task",
            description="Add a new task to the user's todo list",
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    "title": genai.protos.Schema(
                        type=genai.protos.Type.STRING,
                        description="The title/name of the task"
                    ),
                    "description": genai.protos.Schema(
                        type=genai.protos.Type.STRING,
                        description="Optional description or details about the task"
                    )
                },
                required=["title"]
            )
        )

        list_tasks_func = genai.protos.FunctionDeclaration(
            name="list_tasks",
            description="Get all tasks from the user's todo list",
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={}
            )
        )

        complete_task_func = genai.protos.FunctionDeclaration(
            name="complete_task",
            description="Mark a task as completed. You can identify the task by its title (preferred) or ID. If user says 'complete buy groceries', use the title 'buy groceries'.",
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    "task_identifier": genai.protos.Schema(
                        type=genai.protos.Type.STRING,
                        description="The title or ID of the task to mark as complete. Use the task title from the user's message."
                    )
                },
                required=["task_identifier"]
            )
        )

        delete_task_func = genai.protos.FunctionDeclaration(
            name="delete_task",
            description="Delete a task from the user's todo list. You can identify the task by its title (preferred) or ID. If user says 'delete homework', use the title 'homework'.",
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    "task_identifier": genai.protos.Schema(
                        type=genai.protos.Type.STRING,
                        description="The title or ID of the task to delete. Use the task title from the user's message."
                    )
                },
                required=["task_identifier"]
            )
        )

        update_task_func = genai.protos.FunctionDeclaration(
            name="update_task",
            description="Update a task's title or description. You can identify the task by its title (preferred) or ID. If user says 'update homework to...', use the title 'homework'.",
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    "task_identifier": genai.protos.Schema(
                        type=genai.protos.Type.STRING,
                        description="The title or ID of the task to update. Use the task title from the user's message."
                    ),
                    "new_title": genai.protos.Schema(
                        type=genai.protos.Type.STRING,
                        description="New title for the task (optional)"
                    ),
                    "new_description": genai.protos.Schema(
                        type=genai.protos.Type.STRING,
                        description="New description for the task (optional)"
                    )
                },
                required=["task_identifier"]
            )
        )

        # Create tool config
        tools = genai.protos.Tool(
            function_declarations=[
                add_task_func,
                list_tasks_func,
                complete_task_func,
                delete_task_func,
                update_task_func
            ]
        )

        # Get model name from environment or use default
        model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        model = genai.GenerativeModel(
            model_name=model_name,
            tools=[tools]
        )

        # Format conversation history for Gemini
        gemini_history = []
        for msg in conversation_history:
            role = "model" if msg["role"] == "assistant" else "user"
            gemini_history.append({
                "role": role,
                "parts": [msg["content"]]
            })

        # Start chat with history
        chat = model.start_chat(history=gemini_history)

        # Send new message
        response = chat.send_message(new_message)

        # Check if function calls were made
        tool_invocations = []
        final_content = ""

        if response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
                # Check for function call
                if hasattr(part, 'function_call') and part.function_call:
                    func_call = part.function_call
                    func_name = func_call.name
                    func_args = dict(func_call.args)

                    # Execute the function
                    result = execute_function(func_name, func_args, user_id)

                    tool_invocations.append({
                        "tool_name": func_name,
                        "parameters": func_args,
                        "result": result,
                        "timestamp": datetime.utcnow().isoformat()
                    })

                    # Send function result back to model
                    function_response = genai.protos.Part(
                        function_response=genai.protos.FunctionResponse(
                            name=func_name,
                            response={"result": result}
                        )
                    )

                    # Get final response with function result
                    final_response = chat.send_message(function_response)
                    final_content = final_response.text

                # Regular text response
                elif hasattr(part, 'text') and part.text:
                    final_content = part.text

        if not final_content:
            final_content = response.text

        return {
            "content": final_content,
            "tool_invocations": tool_invocations if tool_invocations else None
        }

    except TimeoutError:
        raise TimeoutError("AI agent invocation exceeded 30-second timeout")
    except Exception as e:
        # Check for quota exceeded error
        error_str = str(e)
        if "429" in error_str or "quota" in error_str.lower() or "ResourceExhausted" in error_str:
            raise Exception(
                "API quota exceeded. The Gemini API free tier limit (20 requests/day) has been reached. "
                "Please wait for quota reset or upgrade your API plan. "
                "Visit https://ai.google.dev/gemini-api/docs/rate-limits for more information."
            )
        raise Exception(f"AI agent invocation failed: {str(e)}")


def execute_function(func_name: str, args: dict, user_id: str) -> dict:
    """
    Execute a function call from Gemini.

    Args:
        func_name: Name of the function to execute
        args: Function arguments
        user_id: User ID for database operations

    Returns:
        Dict with function execution result
    """
    from db import engine
    from sqlmodel import Session, select
    from models import Task
    import uuid

    try:
        if func_name == "add_task":
            # Create new task
            with Session(engine) as session:
                task = Task(
                    id=str(uuid.uuid4()),
                    title=args.get("title"),
                    description=args.get("description"),
                    completed=False,
                    user_id=user_id,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                session.add(task)
                session.commit()
                session.refresh(task)

                return {
                    "success": True,
                    "task": {
                        "id": task.id,
                        "title": task.title,
                        "description": task.description,
                        "completed": task.completed
                    }
                }

        elif func_name == "list_tasks":
            # Get all tasks
            with Session(engine) as session:
                statement = select(Task).where(Task.user_id == user_id)
                tasks = session.exec(statement).all()

                return {
                    "success": True,
                    "tasks": [
                        {
                            "id": task.id,
                            "title": task.title,
                            "description": task.description,
                            "completed": task.completed
                        }
                        for task in tasks
                    ]
                }

        elif func_name == "complete_task":
            # Mark task as complete - find by title or ID
            with Session(engine) as session:
                task_identifier = args.get("task_identifier")

                # Try to find by ID first
                statement = select(Task).where(
                    Task.id == task_identifier,
                    Task.user_id == user_id
                )
                task = session.exec(statement).first()

                # If not found by ID, try to find by title (case-insensitive, partial match)
                if not task:
                    statement = select(Task).where(
                        Task.user_id == user_id
                    )
                    all_tasks = session.exec(statement).all()

                    # Find task by partial title match
                    task_identifier_lower = task_identifier.lower()
                    for t in all_tasks:
                        if task_identifier_lower in t.title.lower():
                            task = t
                            break

                if task:
                    task.completed = True
                    task.updated_at = datetime.utcnow()
                    session.add(task)
                    session.commit()

                    return {
                        "success": True,
                        "message": f"Task '{task.title}' marked as complete"
                    }
                else:
                    return {
                        "success": False,
                        "error": f"Task '{task_identifier}' not found"
                    }

        elif func_name == "delete_task":
            # Delete a task - find by title or ID
            with Session(engine) as session:
                task_identifier = args.get("task_identifier")

                # Try to find by ID first
                statement = select(Task).where(
                    Task.id == task_identifier,
                    Task.user_id == user_id
                )
                task = session.exec(statement).first()

                # If not found by ID, try to find by title (case-insensitive, partial match)
                if not task:
                    statement = select(Task).where(
                        Task.user_id == user_id
                    )
                    all_tasks = session.exec(statement).all()

                    # Find task by partial title match
                    task_identifier_lower = task_identifier.lower()
                    for t in all_tasks:
                        if task_identifier_lower in t.title.lower():
                            task = t
                            break

                if task:
                    task_title = task.title
                    session.delete(task)
                    session.commit()

                    return {
                        "success": True,
                        "message": f"Task '{task_title}' has been deleted"
                    }
                else:
                    return {
                        "success": False,
                        "error": f"Task '{task_identifier}' not found"
                    }

        elif func_name == "update_task":
            # Update a task - find by title or ID
            with Session(engine) as session:
                task_identifier = args.get("task_identifier")

                # Try to find by ID first
                statement = select(Task).where(
                    Task.id == task_identifier,
                    Task.user_id == user_id
                )
                task = session.exec(statement).first()

                # If not found by ID, try to find by title (case-insensitive, partial match)
                if not task:
                    statement = select(Task).where(
                        Task.user_id == user_id
                    )
                    all_tasks = session.exec(statement).all()

                    # Find task by partial title match
                    task_identifier_lower = task_identifier.lower()
                    for t in all_tasks:
                        if task_identifier_lower in t.title.lower():
                            task = t
                            break

                if task:
                    # Update fields if provided
                    if args.get("new_title"):
                        task.title = args.get("new_title")
                    if args.get("new_description"):
                        task.description = args.get("new_description")

                    task.updated_at = datetime.utcnow()
                    session.add(task)
                    session.commit()

                    return {
                        "success": True,
                        "message": f"Task updated successfully",
                        "task": {
                            "id": task.id,
                            "title": task.title,
                            "description": task.description,
                            "completed": task.completed
                        }
                    }
                else:
                    return {
                        "success": False,
                        "error": f"Task '{task_identifier}' not found"
                    }

        return {"success": False, "error": f"Unknown function: {func_name}"}

    except Exception as e:
        return {"success": False, "error": str(e)}


def parse_tool_invocations(tool_calls) -> List[Dict]:
    """
    Parse tool invocation metadata from agent response.

    Args:
        tool_calls: Tool calls from agent response

    Returns:
        List of tool invocation metadata dicts
    """
    tool_invocations = []

    for tool_call in tool_calls:
        try:
            # Parse tool call details
            tool_invocation = {
                "tool_name": tool_call.function.name,
                "parameters": json.loads(tool_call.function.arguments),
                "result": {},  # Result would be populated after tool execution
                "timestamp": datetime.utcnow().isoformat()
            }
            tool_invocations.append(tool_invocation)
        except Exception as e:
            # Log error but continue processing other tool calls
            print(f"Error parsing tool call: {str(e)}")
            continue

    return tool_invocations
