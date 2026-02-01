# Data Model: Todo Web Application

## User Entity
- **id**: string (primary identifier from Better Auth)
- **email**: string (unique, required, validated format)
- **password**: string (encrypted, validated per security requirements)
- **created_at**: timestamp (automatically set on creation)
- **updated_at**: timestamp (automatically updated on changes)

**Validation rules**:
- Email must follow standard email format
- Password must be at least 8 characters with uppercase, lowercase, number, and special character
- Email must be unique across all users

## Task Entity
- **id**: string (unique identifier)
- **user_id**: string (foreign key linking to user, required)
- **title**: string (required, 1-200 characters)
- **description**: string (optional, max 1000 characters)
- **completed**: boolean (default: false)
- **created_at**: timestamp (automatically set on creation)
- **updated_at**: timestamp (automatically updated on changes)

**Validation rules**:
- Title is required and must be between 1-200 characters
- Description is optional and limited to 1000 characters
- Completed defaults to false
- user_id must correspond to an existing user

## Session Entity (Handled by Better Auth)
- **jwt_token**: string (JWT containing user identity)
- **expires_at**: timestamp (token expiration based on 7-day policy)
- **user_id**: string (extracted from JWT, linked to user entity)

## Relationships
- **User → Task**: One-to-many (one user can have many tasks)
- **Task → User**: Many-to-one (each task belongs to one user)

## State Transitions
- **Task completion**: pending (completed: false) ↔ completed (completed: true)
- **Task deletion**: active → soft_deleted (deleted_at timestamp set, kept for 30 days)
- **User session**: authenticated ↔ unauthenticated (based on JWT validity)

## Indexes
- **tasks.user_id**: Optimizes queries for retrieving user-specific tasks
- **tasks.completed**: Optimizes queries for filtering completed vs pending tasks
- **users.email**: Optimizes login queries by email