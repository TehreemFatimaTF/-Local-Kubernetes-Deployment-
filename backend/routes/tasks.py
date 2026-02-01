from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from models import Task, TaskCreate, TaskUpdate
from auth import get_current_user, extract_user_id_from_token
from db import get_session
from datetime import datetime
import uuid

router = APIRouter()

@router.get("/tasks", response_model=dict)
def get_tasks(
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Extract user_id from the decoded JWT payload
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not extract user ID from token"
        )

    # Query tasks for the authenticated user
    statement = select(Task).where(Task.user_id == user_id)
    tasks = session.exec(statement).all()

    # Convert to the format expected by the frontend
    tasks_response = []
    for task in tasks:
        tasks_response.append({
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "completed": task.completed,
            "userId": task.user_id,
            "createdAt": task.created_at,
            "updatedAt": task.updated_at,
            "dueDate": task.due_date
        })

    return {"success": True, "data": {"tasks": tasks_response}, "error": None, "statusCode": 200}


@router.post("/tasks", response_model=dict)
def create_task(
    task_data: TaskCreate,
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Extract user_id from the decoded JWT payload
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not extract user ID from token"
        )

    # Create a new task
    task = Task(
        title=task_data.title,
        description=task_data.description,
        completed=task_data.completed,
        user_id=user_id,
        due_date=task_data.due_date
    )

    session.add(task)
    session.commit()
    session.refresh(task)

    # Return the created task in the format expected by the frontend
    task_response = {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "completed": task.completed,
        "userId": task.user_id,
        "createdAt": task.created_at,
        "updatedAt": task.updated_at,
        "dueDate": task.due_date
    }

    return {"success": True, "data": {"task": task_response}, "error": None, "statusCode": 200}


@router.get("/tasks/{task_id}", response_model=dict)
def get_task_by_id(
    task_id: str,
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Extract user_id from the decoded JWT payload
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not extract user ID from token"
        )

    # Get the specific task
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == user_id
    )
    task = session.exec(statement).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Return the task in the format expected by the frontend
    task_response = {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "completed": task.completed,
        "userId": task.user_id,
        "createdAt": task.created_at,
        "updatedAt": task.updated_at,
        "dueDate": task.due_date
    }

    return {"success": True, "data": {"task": task_response}, "error": None, "statusCode": 200}


@router.put("/tasks/{task_id}", response_model=dict)
def update_task(
    task_id: str,
    task_data: TaskUpdate,
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Extract user_id from the decoded JWT payload
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not extract user ID from token"
        )

    # Get the task to update
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == user_id
    )
    task = session.exec(statement).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Update the task with provided data
    if task_data.title is not None:
        task.title = task_data.title
    if task_data.description is not None:
        task.description = task_data.description
    if task_data.completed is not None:
        task.completed = task_data.completed
    if task_data.due_date is not None:
        task.due_date = task_data.due_date

    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)

    # Return the updated task in the format expected by the frontend
    task_response = {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "completed": task.completed,
        "userId": task.user_id,
        "createdAt": task.created_at,
        "updatedAt": task.updated_at,
        "dueDate": task.due_date
    }

    return {"success": True, "data": {"task": task_response}, "error": None, "statusCode": 200}


@router.delete("/tasks/{task_id}", response_model=dict)
def delete_task(
    task_id: str,
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Extract user_id from the decoded JWT payload
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not extract user ID from token"
        )

    # Get the task to delete
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == user_id
    )
    task = session.exec(statement).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    session.delete(task)
    session.commit()

    return {"success": True, "data": {"message": "Task deleted successfully"}, "error": None, "statusCode": 200}


@router.patch("/tasks/{task_id}/toggle", response_model=dict)
def toggle_task_completion(
    task_id: str,
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Extract user_id from the decoded JWT payload
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not extract user ID from token"
        )

    # Get the task to update completion status
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == user_id
    )
    task = session.exec(statement).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Toggle the completion status
    task.completed = not task.completed
    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    # Return the updated task in the format expected by the frontend
    task_response = {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "completed": task.completed,
        "userId": task.user_id,
        "createdAt": task.created_at,
        "updatedAt": task.updated_at,
        "dueDate": task.due_date
    }

    return {"success": True, "data": {"task": task_response}, "error": None, "statusCode": 200}