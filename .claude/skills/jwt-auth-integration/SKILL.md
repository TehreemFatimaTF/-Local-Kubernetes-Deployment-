---
name: jwt-auth-integration
description: Implement and manage JWT-based authentication and authorization for Todo App
owner: Security Developer
tags: [jwt, authentication, authorization, security, tokens, phase-2]
---

## Purpose

Implement and manage JWT-based authentication and authorization for the Todo App by:
- Creating JWT token generation and validation mechanisms
- Implementing user registration and login endpoints
- Adding authentication middleware for protected routes
- Managing token refresh and expiration
- Securing API endpoints with proper authorization checks
- Implementing logout and token invalidation

## When to Use

Invoke this skill when:
- Setting up user authentication system with JWT tokens
- Securing API endpoints that require authentication
- Implementing user registration and login functionality
- Adding role-based or permission-based access control
- Managing token refresh and session management
- Implementing logout and token invalidation

**Trigger phrases:**
- "Implement JWT authentication for [feature]"
- "Secure [endpoint] with JWT auth"
- "Add user registration/login system"
- "Create auth middleware for [route]"
- "Implement token refresh for [service]"

## Inputs

**Required:**
- `feature_name` - The feature to secure with authentication (must have corresponding spec file)

**Optional:**
- `auth_type` - Type of auth: "bearer", "cookie", "both" (default: "bearer")
- `token_strategy` - Token approach: "stateless", "stateful", "hybrid" (default: "stateless")
- `security_level` - Security requirements: "basic", "standard", "enterprise" (default: "standard")

**Example invocations:**
```
Implement JWT authentication for task-api
Secure /api/tasks endpoint with JWT auth
Add user registration/login system
Create auth middleware for protected routes
Implement token refresh for mobile app
```

## Step-by-Step Process

### 1. Load Security Specification

**Locate and read auth spec file:**
```bash
# Identify auth spec
SPEC_FILE="specs/security/${feature_name}/auth-spec.md"

# Verify spec exists
if [ ! -f "$SPEC_FILE" ]; then
    echo "❌ ERROR: Auth spec not found at $SPEC_FILE"
    exit 1
fi
```

**Extract from spec:**
- Authentication requirements and flow
- JWT token structure and claims
- Security requirements (expiration, algorithms)
- User roles and permissions
- Protected endpoints list
- Error handling requirements
- Token storage strategy

**Parse auth requirements:**
```
Example spec section:
## Authentication Requirements

- JWT Token: HS256 algorithm
- Expiration: 15 minutes access token, 7 days refresh token
- Claims: id, email, role, exp
- Protected endpoints: /api/tasks/*, /api/profile
- Error: 401 for invalid token, 403 for insufficient permissions
```

Create implementation checklist:
```markdown
## Auth Implementation Checklist
- [ ] JWT token generation implemented
- [ ] Token validation middleware created
- [ ] User registration endpoint built
- [ ] User login endpoint built
- [ ] Protected routes secured
- [ ] Token refresh mechanism implemented
- [ ] Error handling configured
```

### 2. Identify Implementation Structure

**Determine auth architecture:**
```bash
# Backend auth files (Python FastAPI)
AUTH_DIR="backend/auth"
MODELS_DIR="backend/models"
UTILS_DIR="backend/utils"
ROUTES_DIR="backend/routes"

# Frontend auth files (Next.js)
FRONTEND_AUTH_DIR="frontend/lib/auth"
FRONTEND_HOOKS_DIR="frontend/hooks"
```

**Expected locations for JWT Auth:**
- `backend/auth/` - Authentication services and middleware
- `backend/models/user.py` - User model and schema
- `backend/utils/jwt.py` - JWT utilities and helpers
- `backend/routes/auth.py` - Auth endpoints
- `frontend/lib/auth/` - Frontend auth utilities
- `frontend/hooks/useAuth.js` - Authentication hook

### 3. Create JWT Utilities

**Implement JWT token management:**

For Python backend:
```python
# backend/utils/jwt.py
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = "your-secret-key-here"  # Should be in environment
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create an access token with optional expiration."""
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: Dict[str, Any]) -> str:
    """Create a refresh token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
```

**For Next.js frontend:**
```ts
// frontend/lib/auth.ts
import { jwtDecode } from 'jwt-decode';

export interface TokenPayload {
  id: number;
  email: string;
  role: string;
  exp: number;
  type: string;
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
}

export function getTokenPayload(token: string): TokenPayload | null {
  try {
    return jwtDecode<TokenPayload>(token);
  } catch {
    return null;
  }
}

export function setAuthTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
}

export function getAccessToken(): string | null {
  return localStorage.getItem('access_token');
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('refresh_token');
}

export function clearAuthTokens(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}
```

**JWT utilities checklist:**
- [ ] Token generation with proper expiration
- [ ] Token validation with error handling
- [ ] Password hashing utilities
- [ ] Token refresh mechanisms
- [ ] Frontend token management
- [ ] Secure token storage

### 4. Create User Models and Schemas

**Implement user data models:**

Python models:
```python
# backend/models/user.py
from sqlmodel import SQLModel, Field, Column, DateTime
from typing import Optional
from datetime import datetime
import uuid

class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    username: str = Field(unique=True, index=True)
    full_name: Optional[str] = Field(default=None)
    is_active: bool = Field(default=True)
    role: str = Field(default="user")

class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str = Field()
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True)))
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True)))

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int
    created_at: datetime

class UserUpdate(SQLModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    username: Optional[str] = None
    is_active: Optional[bool] = None

class UserLogin(SQLModel):
    email: str
    password: str

class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: str

class TokenData(SQLModel):
    email: Optional[str] = None
    user_id: Optional[int] = None
```

**Frontend type definitions:**
```ts
// frontend/types/auth.ts
export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  role: string;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  full_name?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
```

**User model checklist:**
- [ ] User model with proper fields
- [ ] Create/Read/Update schemas
- [ ] Authentication schemas
- [ ] Frontend TypeScript types
- [ ] Database relationships
- [ ] Validation rules

### 5. Implement Authentication Endpoints

**Create auth routes:**

Python FastAPI endpoints:
```python
# backend/routes/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from typing import Optional
from datetime import timedelta
from ..database import get_session
from ..models.user import User, UserCreate, UserLogin, Token, UserRead
from ..utils.jwt import verify_password, get_password_hash, create_access_token, create_refresh_token
from ..utils.dependencies import get_current_user

router = APIRouter()
security = HTTPBearer()

@router.post("/register", response_model=UserRead)
async def register(user_data: UserCreate, session: Session = Depends(get_session)):
    """Register a new user."""
    # Check if user already exists
    existing_user = session.exec(
        select(User).where((User.email == user_data.email) | (User.username == user_data.username))
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or username already exists"
        )

    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=hashed_password
    )

    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    return db_user

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, session: Session = Depends(get_session)):
    """Authenticate user and return JWT tokens."""
    # Find user by email
    user = session.exec(
        select(User).where(User.email == user_credentials.email)
    ).first()

    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create tokens
    access_token_expires = timedelta(minutes=15)  # From settings
    access_token = create_access_token(
        data={"user_id": user.id, "email": user.email, "role": user.role},
        expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(
        data={"user_id": user.id, "email": user.email}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": refresh_token
    }

@router.post("/refresh", response_model=Token)
async def refresh_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Refresh access token using refresh token."""
    from ..utils.jwt import verify_token

    token_payload = verify_token(credentials.credentials)

    if token_payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create new access token
    access_token_expires = timedelta(minutes=15)
    new_access_token = create_access_token(
        data={"user_id": token_payload["user_id"], "email": token_payload["email"], "role": token_payload["role"]},
        expires_delta=access_token_expires
    )

    # Generate new refresh token (optional - rotate refresh tokens)
    new_refresh_token = create_refresh_token(
        data={"user_id": token_payload["user_id"], "email": token_payload["email"]}
    )

    return {
        "access_token": new_access_token,
        "token_type": "bearer",
        "refresh_token": new_refresh_token
    }

@router.post("/logout")
async def logout():
    """Logout user (client-side token removal)."""
    # For stateless JWT, logout is handled on client side
    # In stateful implementations, this would invalidate the token
    return {"message": "Logged out successfully"}
```

**Authentication endpoints checklist:**
- [ ] User registration endpoint
- [ ] User login endpoint
- [ ] Token refresh endpoint
- [ ] Logout endpoint
- [ ] Proper error handling
- [ ] Input validation
- [ ] Rate limiting (if specified)

### 6. Implement Authentication Middleware

**Create middleware for protected routes:**

Python dependency:
```python
# backend/utils/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from typing import Optional
from ..database import get_session
from ..models.user import User
from ..utils.jwt import verify_token

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
) -> User:
    """Get current user from JWT token."""
    token_payload = verify_token(credentials.credentials)

    user_id = token_payload.get("user_id")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = session.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Get current active user (convenience function)."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user

def require_role(required_role: str):
    """Dependency to check user role."""
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user
    return role_checker
```

**Using middleware in protected routes:**
```python
# backend/routes/tasks.py
from fastapi import APIRouter, Depends
from ..utils.dependencies import get_current_user, get_current_active_user, require_role
from ..models.user import User

router = APIRouter()

@router.get("/tasks")
async def get_tasks(current_user: User = Depends(get_current_active_user)):
    """Get tasks for current user."""
    # Implementation here
    pass

@router.post("/tasks")
async def create_task(current_user: User = Depends(get_current_active_user)):
    """Create task for current user."""
    # Implementation here
    pass

@router.delete("/tasks/{task_id}")
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_active_user)
):
    """Delete task (user must own the task)."""
    # Implementation here
    pass

# Admin-only endpoint
@router.get("/admin/users")
async def get_all_users(current_user: User = Depends(require_role("admin"))):
    """Get all users (admin only)."""
    # Implementation here
    pass
```

**Middleware checklist:**
- [ ] JWT token validation dependency
- [ ] Current user retrieval
- [ ] Role-based access control
- [ ] Permission checking functions
- [ ] Proper error responses
- [ ] Integration with existing routes

### 7. Implement Frontend Authentication Hook

**Create authentication hook:**

```ts
// frontend/hooks/useAuth.ts
import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import {
  getAccessToken,
  getRefreshToken,
  clearAuthTokens,
  setAuthTokens,
  isTokenExpired,
  getTokenPayload
} from '@/lib/auth';
import { User, LoginCredentials, RegisterData, AuthTokens } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state on component mount
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = getAccessToken();
      if (token && !isTokenExpired(token)) {
        // Get user info from token
        const payload = getTokenPayload(token);
        if (payload) {
          // Optionally fetch user details from API
          // const userData = await fetchUserDetails(payload.user_id);
          setUser({
            id: payload.user_id,
            email: payload.email,
            username: '', // fetch from API if needed
            full_name: '', // fetch from API if needed
            is_active: true,
            role: payload.role || 'user',
            created_at: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }

      const tokens: AuthTokens = await response.json();
      setAuthTokens(tokens.access_token, tokens.refresh_token);

      // Set user from token
      const payload = getTokenPayload(tokens.access_token);
      if (payload) {
        setUser({
          id: payload.user_id,
          email: payload.email,
          username: '', // fetch from API if needed
          full_name: '', // fetch from API if needed
          is_active: true,
          role: payload.role || 'user',
          created_at: new Date().toISOString()
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    clearAuthTokens();
    setUser(null);
  };

  const refreshAuth = async () => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${refreshToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const tokens: AuthTokens = await response.json();
      setAuthTokens(tokens.access_token, tokens.refresh_token);
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      throw error;
    }
  };

  const isAuthenticated = !!user && !isTokenExpired(getAccessToken() || '');

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshAuth,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

**Frontend auth integration:**
```tsx
// frontend/components/LoginForm.tsx
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login({ email, password });
      // Redirect to dashboard or previous page
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <div className="error">{error}</div>}
      <button type="submit">Login</button>
    </form>
  );
}
```

**Frontend auth checklist:**
- [ ] Authentication context provider
- [ ] Login function with token storage
- [ ] Register function
- [ ] Logout function
- [ ] Token refresh mechanism
- [ ] Protected route components
- [ ] Auth state management

### 8. Implement Authorization Checks

**Add role-based access control:**

```python
# backend/utils/authorization.py
from enum import Enum
from typing import List, Optional
from fastapi import HTTPException, status
from ..models.user import User

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    MODERATOR = "moderator"

class Permission(str, Enum):
    READ_TASKS = "read:tasks"
    CREATE_TASKS = "create:tasks"
    UPDATE_TASKS = "update:tasks"
    DELETE_TASKS = "delete:tasks"

def has_role(user: User, required_role: UserRole) -> bool:
    """Check if user has required role."""
    return user.role == required_role

def has_permission(user: User, permission: Permission) -> bool:
    """Check if user has required permission."""
    # Define role-permission mapping
    role_permissions = {
        UserRole.USER: [
            Permission.READ_TASKS,
            Permission.CREATE_TASKS,
            Permission.UPDATE_TASKS,
        ],
        UserRole.ADMIN: [
            Permission.READ_TASKS,
            Permission.CREATE_TASKS,
            Permission.UPDATE_TASKS,
            Permission.DELETE_TASKS,
        ],
        UserRole.MODERATOR: [
            Permission.READ_TASKS,
            Permission.UPDATE_TASKS,
            Permission.DELETE_TASKS,
        ],
    }

    user_permissions = role_permissions.get(user.role, [])
    return permission in user_permissions

def require_permission(permission: Permission):
    """Dependency to check user permission."""
    async def permission_checker(current_user: User = Depends(get_current_user)) -> User:
        if not has_permission(current_user, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user
    return permission_checker
```

**Using authorization in routes:**
```python
from ..utils.authorization import require_permission, Permission

@router.post("/tasks")
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Create task - requires create permission."""
    # Check if user has permission to create tasks
    # (This would be handled by the permission system)
    pass

@router.delete("/tasks/{task_id}")
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_active_user)
):
    """Delete task - requires delete permission."""
    # Check if user owns the task or has admin privileges
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Check ownership or admin role
    if task.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this task"
        )

    # Delete task
    session.delete(task)
    session.commit()
```

**Authorization checklist:**
- [ ] Role definitions
- [ ] Permission system
- [ ] Role-permission mapping
- [ ] Authorization dependencies
- [ ] Resource ownership checks
- [ ] Admin override capabilities

### 9. Generate Implementation Report

**Create detailed implementation report:**

```markdown
# JWT Auth Integration Report: [Feature Name]

## Specification Reference
- **Spec File:** specs/security/[feature-name]/auth-spec.md
- **Implementation Date:** 2025-12-24
- **Developer:** Security Developer

## Component Implementation Results

### JWT Utilities
- **Status:** ✅ COMPLETE
- **Evidence:** Token generation, validation, and refresh implemented
- **Features:** HS256 algorithm, proper expiration, password hashing
- **Security:** Strong secret key, secure algorithms

### User Models
- **Status:** ✅ COMPLETE
- **Evidence:** Complete user model with validation
- **Features:** Email/username uniqueness, password hashing
- **Database:** Proper indexing and constraints

### Authentication Endpoints
- **Status:** ✅ COMPLETE
- **Evidence:** Register, login, refresh, logout endpoints
- **Features:** Input validation, error handling, rate limiting
- **Security:** Password hashing, token generation

### Authorization Middleware
- **Status:** ✅ COMPLETE
- **Evidence:** JWT validation, user retrieval, role checking
- **Features:** Dependency injection, error responses
- **Integration:** Applied to protected routes

### Frontend Authentication
- **Status:** ⚠️ PARTIAL
- **Evidence:** Auth context and basic functions implemented
- **Missing:** Token refresh automation
- **Impact:** MEDIUM (users need to re-login after token expiry)

## Security Implementation

### Token Security
- ✅ JWT tokens with proper expiration
- ✅ Secure secret key management
- ✅ Password hashing with bcrypt
- ✅ Token type validation (access vs refresh)

### Endpoint Protection
- ✅ Authentication middleware applied
- ✅ Role-based access control
- ✅ Permission checking system
- ✅ Error responses with proper status codes

## API Integration

### Auth Endpoints
- ✅ POST /api/auth/register: User registration
- ✅ POST /api/auth/login: User authentication
- ✅ POST /api/auth/refresh: Token refresh
- ✅ POST /api/auth/logout: User logout

### Protected Endpoints
- ✅ GET /api/tasks: Requires authentication
- ✅ POST /api/tasks: Requires authentication
- ✅ DELETE /api/tasks/{id}: Ownership check

## State Management

### Backend State
- ✅ Stateless JWT implementation
- ✅ Token validation without server-side storage
- ✅ Proper error handling for invalid tokens

### Frontend State
- ✅ Auth context with user state
- ✅ Token storage in localStorage
- ✅ Loading and error states
- ✅ Authentication status tracking

## Security Considerations

### Token Security
- ✅ Short-lived access tokens (15 min)
- ✅ Long-lived refresh tokens (7 days)
- ✅ Secure token storage
- ✅ Token rotation (if implemented)

### Input Validation
- ✅ Email format validation
- ✅ Password strength requirements
- ✅ SQL injection protection
- ✅ XSS prevention

## Summary

### Overall Status: ✅ COMPLETE

**Components Created:** 6/6 major components
**Security Features:** 12/12 implemented
**API Endpoints:** 4/4 authentication endpoints
**Authorization:** 8/10 requirements met
**Frontend Integration:** 7/10 features implemented

### Security Score: 9.5/10
- Strong password hashing: ✅
- Proper token expiration: ✅
- Secure algorithms: ✅
- Input validation: ✅
- Error handling: ✅
- Session management: ⚠️ (refresh automation pending)

### Recommendations
1. Implement automatic token refresh in frontend
2. Add rate limiting to auth endpoints
3. Consider implementing refresh token rotation
4. Add account lockout after failed attempts
5. Implement secure password reset functionality

### Next Steps
- [ ] Test token refresh flow
- [ ] Security penetration testing
- [ ] Performance testing under load
- [ ] User acceptance testing
```

## Output

**Success case (all auth features implemented):**
```
✅ JWT AUTH INTEGRATION COMPLETE: [Feature Name]

📋 Security Components: 6/6 created (100%)
✅ Authentication: Register/login endpoints
✅ Authorization: Middleware and role checks
✅ Token Management: Generation and validation
✅ Frontend Integration: Auth context and hooks
✅ Security: Proper encryption and validation

🎯 AUTHENTICATION SYSTEM READY
✅ SECURE FOR PRODUCTION

[Link to detailed implementation report]
```

**Partial completion (missing security features):**
```
⚠️ JWT AUTH INTEGRATION: [Feature Name]

📋 Security Components: 5/6 created, 1/6 pending
✅ Authentication: Register/login working
⚠️ Authorization: Basic roles implemented, advanced permissions pending
✅ Token Management: Working but refresh automation missing
✅ Frontend Integration: Basic functionality
✅ Security: Core features implemented

Pending:
1. Advanced role permissions (MEDIUM priority)
2. Token refresh automation (HIGH priority)

🎯 CONDITIONAL READY
✅ Can deploy with basic auth, advanced features will be added

[Link to detailed implementation report]
```

**Failure case (security vulnerabilities):**
```
❌ JWT AUTH INTEGRATION FAILED: [Feature Name]

📋 Security Components: 3/6 created, 3/6 FAILED
❌ Critical Issues Found:
   1. Weak password hashing algorithm (HIGH)
   2. Tokens never expire (CRITICAL)
   3. No input validation on auth endpoints (HIGH)

🔒 SECURITY VULNERABILITIES PREVENT DEPLOYMENT

Required fixes:
1. Implement proper password hashing
2. Add token expiration
3. Add input validation and sanitization
4. Security audit before proceeding

📋 Return to implementation
🔒 Critical security fixes required

[Link to detailed implementation report]
```

## Failure Handling

### Security Spec Not Found
- Check if feature name is correct
- Verify security spec exists in `specs/security/[feature-name]/auth-spec.md`
- If spec missing: BLOCK and require security specification
- Cannot implement secure auth without security requirements

### Implementation Not Found
- Check if auth project structure exists
- Verify backend and frontend directories
- If missing: Report as incomplete project setup
- Cannot implement without proper project structure

### Token Secret Undefined
- Flag missing security configuration in report
- Require environment variable setup
- Document security risk if proceeds without proper secrets
- Recommend updating deployment spec for security

### Algorithm Requirements Ambiguous
**If security_level = "enterprise":**
- FAIL if enterprise-grade security not implemented
- Require advanced encryption and security measures

**If security_level = "standard" (default):**
- PASS if standard security practices implemented
- FLAG if basic security measures missing
- Recommend security enhancement for production

### Authorization Requirements Missing
- Flag any authorization features not implemented
- Document current access control state
- Recommend adding authorization to spec if intentional
- Consider as potential security gap

## Quality Gates

**PASS (approved for production):**
- ✅ All auth endpoints functional
- ✅ JWT tokens properly implemented
- ✅ Password hashing secure
- ✅ Authorization checks working
- ✅ Input validation complete
- ✅ No security vulnerabilities

**CONDITIONAL PASS (deploy with monitoring):**
- ⚠️ ≥90% security features implemented
- ⚠️ Basic auth working
- ⚠️ Core authorization functional
- ✅ No critical vulnerabilities
- ✅ Can be monitored in production

**FAIL (blocking, cannot deploy):**
- ❌ <90% security features implemented
- ❌ Critical security vulnerabilities
- ❌ Weak encryption or hashing
- ❌ Missing authentication
- ❌ Authorization completely broken

## Integration with SDD Workflow

**After implementation:**
1. If PASS: Proceed to security testing, create PHR (stage: green)
2. If CONDITIONAL: Document security limitations, proceed with monitoring
3. If FAIL: Block deployment, create security fix tasks, create PHR (stage: red)

**Traceability:**
- Link implementation report to security spec file
- Reference security requirements in results
- Create tasks for missing security features
- Document security decisions in ADR if significant

## Examples

### Example 1: Complete Implementation
```
Input: "Implement JWT authentication for task-api"

Output:
✅ IMPLEMENTATION COMPLETE: task-api auth
📋 All 6 security components created
✅ Auth endpoints: register, login, refresh, logout
✅ JWT: HS256 with proper expiration
✅ Authorization: Role-based access control
✅ Frontend: Auth context and hooks
✅ Security: Password hashing, input validation

Implemented:
- JWT utilities: ✅ Token generation/validation
- User models: ✅ Complete user schema
- Auth endpoints: ✅ Register/login/refresh
- Middleware: ✅ JWT validation
- Authorization: ✅ Role-based access
- Frontend: ✅ Auth context integration

🎯 SECURITY READY FOR PRODUCTION
```

### Example 2: Partial Implementation
```
Input: "Secure /api/tasks endpoint with JWT auth"

Output:
⚠️ IMPLEMENTATION: /api/tasks security
📋 4/6 security components implemented

Completed:
- JWT validation: ✅ Middleware applied
- User authentication: ✅ Token verification
- Basic authorization: ✅ Auth required
- Error handling: ✅ 401/403 responses

Pending:
- Advanced permissions: ⚠️ Role-based access not implemented
  Reason: Permission matrix not specified
  Impact: MEDIUM (all authenticated users have same access)

✅ CAN SECURE ENDPOINT with basic auth
📝 Will add advanced permissions later
```

### Example 3: Critical Security Issues
```
Input: "Implement token refresh for mobile app"

Output:
❌ IMPLEMENTATION FAILED: token refresh
📋 1/4 security components working, 3/4 FAILED

CRITICAL SECURITY ISSUES:
- Refresh tokens stored in plain text (CRITICAL)
  Evidence: Tokens not encrypted in storage
  Impact: CRITICAL (complete account compromise)

- No refresh token invalidation (HIGH)
  Evidence: Stolen refresh tokens never expire
  Impact: HIGH (persistent unauthorized access)

- Weak token secrets (CRITICAL)
  Evidence: Default secret in code
  Impact: CRITICAL (tokens can be forged)

Partially working:
- Basic refresh endpoint: ✅ Token generation

🔒 BLOCKED: Cannot deploy security system
📋 Required fixes:
   1. Encrypt stored refresh tokens
   2. Implement token invalidation
   3. Use secure secret management
   4. Security audit required
```