# Todo Web Application - Specification

## Overview
A secure, multi-user todo application with authentication and authorization.

## Core Features

### Authentication
- User registration (email + password)
- User login
- JWT-based session management
- Protected routes

### Task Management
- Create tasks with title (required, 1-200 chars) and description (optional, max 1000 chars)
- View all user tasks
- Update task details
- Delete tasks
- Toggle task completion status
- Filter tasks by completion status

### User Experience
- Responsive design (mobile, tablet, desktop)
- Clean, modern UI with Tailwind CSS
- Loading states
- Error handling
- Empty states

## Technical Requirements

### Frontend
- Next.js 16+ with App Router
- TypeScript
- Tailwind CSS
- Better Auth for authentication
- API client for backend communication

### Backend
- Python FastAPI
- SQLModel ORM
- PostgreSQL database
- JWT verification middleware
- RESTful API design

### Database Schema

#### User Table
- id: string (primary key)
- email: string (unique, required)
- password_hash: string (required)
- created_at: timestamp
- updated_at: timestamp

#### Task Table
- id: string (primary key)
- user_id: string (foreign key, required)
- title: string (1–200 chars, required)
- description: text (optional, max 1000 chars)
- completed: boolean (default false)
- created_at: timestamp
- updated_at: timestamp

### Indexes
- tasks.user_id
- tasks.completed

## API Endpoints

### Authentication
- POST /api/auth/login
- POST /api/auth/register

### Tasks
- GET /api/tasks - Get user's tasks
- POST /api/tasks - Create new task
- GET /api/tasks/{id} - Get specific task
- PUT /api/tasks/{id} - Update task
- PATCH /api/tasks/{id}/toggle - Toggle task completion
- DELETE /api/tasks/{id} - Delete task

All task endpoints require JWT authentication.

## Security Requirements
- JWT tokens must be verified on all task endpoints
- Users can only access their own tasks
- Passwords must be hashed
- Input validation required
- Proper error handling without information disclosure

## UI/UX Requirements
- Responsive design supporting mobile, tablet, and desktop
- Clean, modern interface with consistent styling
- Clear navigation between pages
- Intuitive task management interface
- Proper loading and error states