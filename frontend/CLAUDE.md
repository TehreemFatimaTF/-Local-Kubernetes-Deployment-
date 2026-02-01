# Frontend CLAUDE.md

## Frontend Technology Standards

- Next.js 16+ using App Router
- TypeScript
- Tailwind CSS
- Better Auth for authentication
- API access via a centralized API client

## Frontend Structure

- All pages should use the App Router structure
- Authentication-protected routes
- Centralized API client for backend communication
- TypeScript interfaces for all data models

## Authentication Requirements

- Implement Signup page (email + password)
- Implement Signin page
- Implement Logout functionality
- Handle JWT-based session via Better Auth
- Redirect unauthenticated users from protected routes

## UI/UX Standards

- Clean, modern, professional UI
- Responsive design (mobile, tablet, desktop)
- Clear empty states (no tasks, loading, errors)
- Accessible form inputs and buttons
- Consistent layout and spacing

## Required Pages (App Router)

- /login
- /signup
- /dashboard
- /tasks
- /tasks/[id]
- / (redirects based on auth state)

All task-related pages must be protected by authentication.