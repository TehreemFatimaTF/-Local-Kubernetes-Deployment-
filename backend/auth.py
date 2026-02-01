from fastapi.security import HTTPBearer
from fastapi import HTTPException, status, Depends
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
from typing import Optional, Dict, Any

# Initialize the security scheme
oauth2_scheme = HTTPBearer()

# Get the secret key from environment variable
BETTER_AUTH_SECRET = os.getenv("BETTER_AUTH_SECRET")
if not BETTER_AUTH_SECRET:
    # For development purposes, use a default secret if not set
    print("WARNING: BETTER_AUTH_SECRET not set, using default development key")
    BETTER_AUTH_SECRET = "dev_secret_key_for_local_development"

def verify_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify JWT token issued by Better Auth and return the payload
    """
    try:
        print(f"[DEBUG] Verifying token: {token[:50]}...")
        print(f"[DEBUG] Using secret: {BETTER_AUTH_SECRET[:10]}...")

        # Decode the JWT token using the Better Auth secret
        payload = jwt.decode(
            token,
            BETTER_AUTH_SECRET,
            algorithms=["HS256"]
        )

        print(f"[DEBUG] Token decoded successfully. Payload: {payload}")

        # Check if token is expired
        exp = payload.get("exp")
        if exp and datetime.fromtimestamp(exp) < datetime.utcnow():
            print("[DEBUG] Token is expired")
            return None

        return payload
    except JWTError as e:
        # Token is invalid
        print(f"[DEBUG] JWT Error: {e}")
        return None
    except Exception as e:
        # Other error occurred
        print(f"[DEBUG] Other error: {e}")
        return None

def extract_user_id_from_token(token: str) -> Optional[str]:
    """
    Extract user_id from JWT token
    """
    payload = verify_jwt_token(token)
    if payload:
        # Better Auth typically stores user ID in 'id' or 'userId' field
        return payload.get("id") or payload.get("userId") or payload.get("sub")
    return None

async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    Dependency to get current user from JWT
    """
    print(f"[DEBUG] get_current_user called with token: {token.credentials[:50] if token.credentials else 'None'}...")

    user_payload = verify_jwt_token(token.credentials)
    if not user_payload:
        print("[DEBUG] Token verification failed - returning 401")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    print(f"[DEBUG] User authenticated: {user_payload.get('email')}")
    return user_payload

