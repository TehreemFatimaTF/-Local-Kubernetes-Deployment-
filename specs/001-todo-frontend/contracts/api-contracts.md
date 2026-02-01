# API Contracts: Frontend-Backend Communication

## Authentication Endpoints

### POST /api/auth/signup
**Purpose**: Create a new user account
**Request**:
- Headers: Content-Type: application/json
- Body:
  ```json
  {
    "email": "string (valid email format)",
    "password": "string (min 8 chars with uppercase, lowercase, number, special char)"
  }
  ```

**Response**:
- Success (200):
  ```json
  {
    "success": true,
    "user": {
      "id": "string",
      "email": "string"
    }
  }
  ```
- Error (400, 409, 500):
  ```json
  {
    "success": false,
    "error": "string (user-friendly message)"
  }
  ```

### POST /api/auth/login
**Purpose**: Authenticate user and return session
**Request**:
- Headers: Content-Type: application/json
- Body:
  ```json
  {
    "email": "string (valid email format)",
    "password": "string"
  }
  ```

**Response**:
- Success (200):
  ```json
  {
    "success": true,
    "user": {
      "id": "string",
      "email": "string"
    }
  }
  ```
- Error (400, 401, 500):
  ```json
  {
    "success": false,
    "error": "string (user-friendly message)"
  }
  ```

### POST /api/auth/logout
**Purpose**: Terminate user session
**Request**:
- Headers:
  - Content-Type: application/json
  - Authorization: Bearer <JWT_TOKEN>

**Response**:
- Success (200):
  ```json
  {
    "success": true
  }
  ```
- Error (401, 500):
  ```json
  {
    "success": false,
    "error": "string (user-friendly message)"
  }
  ```

## Task Management Endpoints

### GET /api/tasks
**Purpose**: Retrieve all tasks for authenticated user
**Request**:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>

**Response**:
- Success (200):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "string",
        "user_id": "string",
        "title": "string",
        "description": "string (optional)",
        "completed": "boolean",
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    ]
  }
  ```
- Error (401, 500):
  ```json
  {
    "success": false,
    "error": "string (user-friendly message)"
  }
  ```

### POST /api/tasks
**Purpose**: Create a new task for authenticated user
**Request**:
- Headers:
  - Content-Type: application/json
  - Authorization: Bearer <JWT_TOKEN>
- Body:
  ```json
  {
    "title": "string (1-200 chars)",
    "description": "string (optional, max 1000 chars)",
    "completed": "boolean (default false)"
  }
  ```

**Response**:
- Success (201):
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "user_id": "string",
      "title": "string",
      "description": "string (optional)",
      "completed": "boolean",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  }
  ```
- Error (400, 401, 500):
  ```json
  {
    "success": false,
    "error": "string (user-friendly message)"
  }
  ```

### GET /api/tasks/{id}
**Purpose**: Retrieve a specific task for authenticated user
**Request**:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>
- Path: /api/tasks/{id}

**Response**:
- Success (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "user_id": "string",
      "title": "string",
      "description": "string (optional)",
      "completed": "boolean",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  }
  ```
- Error (401, 404, 500):
  ```json
  {
    "success": false,
    "error": "string (user-friendly message)"
  }
  ```

### PUT /api/tasks/{id}
**Purpose**: Update a specific task for authenticated user
**Request**:
- Headers:
  - Content-Type: application/json
  - Authorization: Bearer <JWT_TOKEN>
- Path: /api/tasks/{id}
- Body:
  ```json
  {
    "title": "string (1-200 chars)",
    "description": "string (optional, max 1000 chars)",
    "completed": "boolean"
  }
  ```

**Response**:
- Success (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "user_id": "string",
      "title": "string",
      "description": "string (optional)",
      "completed": "boolean",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  }
  ```
- Error (400, 401, 404, 500):
  ```json
  {
    "success": false,
    "error": "string (user-friendly message)"
  }
  ```

### PATCH /api/tasks/{id}/complete
**Purpose**: Toggle completion status of a task
**Request**:
- Headers:
  - Content-Type: application/json
  - Authorization: Bearer <JWT_TOKEN>
- Path: /api/tasks/{id}/complete
- Body:
  ```json
  {
    "completed": "boolean"
  }
  ```

**Response**:
- Success (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "user_id": "string",
      "title": "string",
      "description": "string (optional)",
      "completed": "boolean",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  }
  ```
- Error (400, 401, 404, 500):
  ```json
  {
    "success": false,
    "error": "string (user-friendly message)"
  }
  ```

### DELETE /api/tasks/{id}
**Purpose**: Delete a specific task for authenticated user
**Request**:
- Headers:
  - Authorization: Bearer <JWT_TOKEN>
- Path: /api/tasks/{id}

**Response**:
- Success (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "string"
    }
  }
  ```
- Error (401, 404, 500):
  ```json
  {
    "success": false,
    "error": "string (user-friendly message)"
  }
  ```

## Error Handling Standards

### HTTP Status Codes
- 200: Success for GET, PUT, PATCH, DELETE operations
- 201: Success for POST operations (resource created)
- 400: Bad Request (validation errors)
- 401: Unauthorized (invalid/expired JWT)
- 404: Not Found (resource doesn't exist)
- 500: Internal Server Error

### Error Response Format
All error responses follow the format:
```json
{
  "success": false,
  "error": "User-friendly error message"
}
```

### JWT Token Handling
- All authenticated endpoints require `Authorization: Bearer <JWT_TOKEN>` header
- JWT tokens are obtained during login/signup via Better Auth
- Expired tokens result in 401 responses, triggering redirect to login