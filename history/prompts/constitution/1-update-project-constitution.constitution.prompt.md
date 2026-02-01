---
id: 1
title: "update-project-constitution"
stage: constitution
date_iso: 2026-01-11
surface: agent
model: claude-sonnet-4-5-20250929
feature: "todo-web-app"
branch: "001-todo-web-app"
user: "user"
command: "/sp.constitution"
labels: ["constitution", "governance", "spec-driven"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - ".specify/memory/constitution.md"
tests: []
---

# Update Project Constitution

## Summary

Updated the project constitution to reflect the detailed principles for the Phase II Full-Stack Multi-User Todo Web Application. The new constitution includes specific sections for core principles, technology standards, authentication requirements, database schema, and governance procedures.

## Outcome

The constitution has been updated from version 1.0.0 to 1.1.0, incorporating all the detailed requirements specified for the hackathon project. The new constitution provides clear guidance on spec-driven development, security requirements, technology stack, and project constraints.

## Evaluation

The updated constitution aligns with all specified requirements:
- ✅ Core principles for spec-first development
- ✅ Technology standards for frontend, backend, and database
- ✅ Authentication and authorization requirements
- ✅ Database schema specifications
- ✅ Monorepo structure and documentation rules
- ✅ Project constraints and governance procedures

## Prompt Text

```
Project: Phase II – Full-Stack Multi-User Todo Web Application (Spec-Driven)

Objective:
Transform an existing console-based Todo application into a modern, secure, multi-user
full-stack web application using spec-driven development. The system must support
persistent storage, authenticated users, and strict data isolation per user.

This project is part of Hackathon II and must strictly follow the provided specifications,
architecture, and security requirements.

────────────────────────────────
Core Principles
────────────────────────────────

- Spec-First Development:
  All implementation decisions must be driven by specifications located in /specs.
  No feature should be implemented without aligning with an existing or updated spec.

- Security by Default:
  All backend APIs must be protected via JWT-based authentication.
  No unauthenticated access is allowed to any task-related endpoint.

- User Data Isolation:
  Each user must only be able to access, modify, or delete their own tasks.
  Task ownership must be enforced at the database and API layer.

- Separation of Concerns:
  Frontend, backend, database, and authentication logic must be clearly separated
  while remaining interoperable within a monorepo structure.

- Deterministic Behavior:
  Given the same inputs (JWT, request payload), the system must behave predictably
  and consistently.

────────────────────────────────
Technology Standards
────────────────────────────────

Frontend:
- Next.js 16+ using App Router
- TypeScript
- Tailwind CSS
- Better Auth for authentication
- API access via a centralized API client

Backend:
- Python FastAPI
- SQLModel ORM
- JWT verification middleware
- RESTful API design

Database:
- Neon Serverless PostgreSQL
- Persistent storage for all tasks
- Indexed user-based filtering

Spec System:
- GitHub Spec-Kit Plus
- Claude Code for implementation
- Structured specs under /specs directory

────────────────────────────────
Authentication & Authorization Standards
────────────────────────────────

- Authentication is handled exclusively on the frontend using Better Auth.
- Better Auth must be configured to issue JWT tokens.
- JWT tokens must include user identity (user_id, email).

- All frontend API requests must include:
  Authorization: Bearer <JWT_TOKEN>

- Backend must:
  - Verify JWT signature using shared secret
  - Reject invalid or expired tokens with 401 Unauthorized
  - Extract authenticated user_id from JWT
  - Never trust user_id sent from frontend request body or URL

- Shared secret:
  - Environment variable: BETTER_AUTH_SECRET
  - Must be identical in frontend and backend environments

Database Schema Requirements:
- User Table:
  - id: string (primary key)
  - email: string (unique, required)
  - password_hash: string (required)
  - created_at: timestamp
  - updated_at: timestamp

- Task Table:
  - id: string (primary key)
  - user_id: string (foreign key, required)
  - title: string (1–200 chars, required)
  - description: text (optional, max 1000 chars)
  - completed: boolean (default false)
  - created_at: timestamp
  - updated_at: timestamp

Indexes:
- tasks.user_id
- tasks.completed

────────────────────────────────
Monorepo & Documentation Rules
────────────────────────────────

- The project must use a monorepo structure:
  - /frontend   → Next.js application
  - /backend    → FastAPI application
  - /specs      → All specifications
  - /.spec-kit  → Spec-Kit configuration
  - CLAUDE.md files at root, frontend, and backend levels

- Claude Code must:
  - Read Root CLAUDE.md for global context
  - Read feature-specific specs before implementation
  - Follow frontend and backend CLAUDE.md rules
```

## Response Text

Updated the project constitution file with all the specified principles, technology standards, authentication requirements, database schema, and governance procedures. The new constitution provides clear guidance for implementing the Phase II Full-Stack Multi-User Todo Web Application following spec-driven development practices.