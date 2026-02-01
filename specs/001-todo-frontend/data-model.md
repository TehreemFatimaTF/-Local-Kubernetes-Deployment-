# Data Model: Phase II Frontend Todo Web Application

## Core Entities

### User
- **Fields**:
  - id: string (primary key, from Better Auth)
  - email: string (unique, required, from Better Auth)
  - created_at: timestamp (from Better Auth)
  - updated_at: timestamp (from Better Auth)

- **Validation Rules**:
  - Email must be valid email format
  - Email must be unique across all users

### Task
- **Fields**:
  - id: string (primary key)
  - user_id: string (foreign key, required, matches authenticated user)
  - title: string (1-200 characters, required)
  - description: text (optional, max 1000 characters)
  - completed: boolean (default false)
  - created_at: timestamp
  - updated_at: timestamp

- **Validation Rules**:
  - Title must be 1-200 characters
  - Description must be max 1000 characters if provided
  - user_id must match the authenticated user's ID from JWT token
  - Completed field must be boolean

## Relationships
- **User → Task**: One-to-many (one user can have many tasks)
- **Ownership**: Each task belongs to exactly one user
- **Access Control**: Users can only access tasks where user_id matches their authenticated ID

## State Transitions
### Task State Transitions
- Pending (completed: false) ↔ Completed (completed: true)
- Creation: New tasks start as pending (completed: false)
- Deletion: Tasks can be soft-deleted (marked as deleted but kept for 30 days)

## Frontend-Specific Data Models

### Session
- **Fields**:
  - user: User object (from Better Auth)
  - jwt_token: string (stored securely by Better Auth)
  - expires_at: timestamp

### API Response Models
#### TaskResponse
- **Structure**:
  - data: Task or Task[]
  - success: boolean
  - error?: string (only present on error)

#### AuthResponse
- **Structure**:
  - success: boolean
  - user?: User (on successful auth)
  - error?: string (only present on error)

## Component Data Models

### TaskForm Model
- **Fields**:
  - title: string (required, 1-200 chars)
  - description: string (optional, max 1000 chars)
  - completed: boolean (default false)

### Filter Model
- **Fields**:
  - status: 'all' | 'pending' | 'completed' (default 'all')
  - searchQuery: string (optional)

## Validation Rules
### Client-Side Validation
- Form inputs must be validated before submission
- Title must be 1-200 characters in TaskForm
- Error messages must be user-friendly
- Loading states must be displayed during API calls

### Error Handling
- Network errors: Display appropriate message to user
- Validation errors: Highlight invalid fields and show error messages
- Authentication errors: Redirect to login page
- Server errors: Display user-friendly error message