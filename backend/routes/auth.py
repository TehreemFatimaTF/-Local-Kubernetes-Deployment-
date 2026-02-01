from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from sqlmodel import Session, select
from typing import Optional
from auth import verify_jwt_token, extract_user_id_from_token
from db import get_session
from models import User, UserCreate
from datetime import datetime, timedelta
import uuid
import bcrypt
import os
from jose import jwt

router = APIRouter()
security = HTTPBearer()

class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    email: str
    password: str
    name: Optional[str] = None

class LoginResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None
    statusCode: int

class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    createdAt: str
    updatedAt: str

@router.post("/auth/login", response_model=LoginResponse)
def login(
    login_data: LoginRequest,
    session: Session = Depends(get_session)
):
    # Find user by email
    statement = select(User).where(User.email == login_data.email)
    user = session.exec(statement).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Verify password
    if not bcrypt.checkpw(login_data.password.encode('utf-8'), user.hashed_password.encode('utf-8')):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Create JWT token (using user info as payload)
    BETTER_AUTH_SECRET = os.getenv("BETTER_AUTH_SECRET", "dev_secret_key_for_local_development")

    # Create payload with user info
    payload = {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "exp": datetime.utcnow() + timedelta(days=30)  # Token expires in 30 days
    }

    token = jwt.encode(payload, BETTER_AUTH_SECRET, algorithm="HS256")

    # Prepare user response
    user_response = UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        createdAt=user.created_at.isoformat(),
        updatedAt=user.updated_at.isoformat()
    )

    return LoginResponse(
        success=True,
        data={
            "user": user_response.dict(),
            "token": token
        },
        error=None,
        statusCode=200
    )


@router.post("/auth/signup", response_model=LoginResponse)
def signup(
    signup_data: SignupRequest,
    session: Session = Depends(get_session)
):
    # Check if user already exists
    statement = select(User).where(User.email == signup_data.email)
    existing_user = session.exec(statement).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )

    # Hash the password
    hashed_password = bcrypt.hashpw(signup_data.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    # Create new user
    user = User(
        id=str(uuid.uuid4()),
        email=signup_data.email,
        name=signup_data.name,
        hashed_password=hashed_password
    )

    session.add(user)
    session.commit()
    session.refresh(user)

    # Create JWT token
    BETTER_AUTH_SECRET = os.getenv("BETTER_AUTH_SECRET", "dev_secret_key_for_local_development")

    # Create payload with user info
    payload = {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "exp": datetime.utcnow() + timedelta(days=30)  # Token expires in 30 days
    }

    token = jwt.encode(payload, BETTER_AUTH_SECRET, algorithm="HS256")

    # Prepare user response
    user_response = UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        createdAt=user.created_at.isoformat(),
        updatedAt=user.updated_at.isoformat()
    )

    return LoginResponse(
        success=True,
        data={
            "user": user_response.dict(),
            "token": token
        },
        error=None,
        statusCode=200
    )


@router.post("/auth/logout", response_model=dict)
def logout():
    # For JWT tokens, logout is typically handled client-side by removing the token
    # We can still have an endpoint for consistency
    return {
        "success": True,
        "data": {"message": "Logged out successfully"},
        "error": None,
        "statusCode": 200
    }


@router.get("/auth/me", response_model=dict)
def get_current_user_info(
    token_data: dict = Depends(security)
):
    # Extract user info from the token
    token = token_data.credentials
    user_payload = verify_jwt_token(token)

    if not user_payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Prepare user response
    user_response = UserResponse(
        id=user_payload.get("id"),
        email=user_payload.get("email"),
        name=user_payload.get("name"),
        createdAt="",  # Could be retrieved from DB if needed
        updatedAt=""   # Could be retrieved from DB if needed
    )

    return {
        "success": True,
        "data": {"user": user_response.dict()},
        "error": None,
        "statusCode": 200
    }