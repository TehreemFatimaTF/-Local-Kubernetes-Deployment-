# Quickstart Guide: Frontend Development

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Access to backend API (FastAPI server running)
- Better Auth configuration details

## Setup Instructions

### 1. Clone and Navigate
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Configuration
Create `.env.local` file in the frontend directory:
```env
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:8000
NEXT_PUBLIC_BETTER_AUTH_TOKEN=your_better_auth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### 4. Run Development Server
```bash
npm run dev
# or
yarn dev
```

The application will be available at http://localhost:3000

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes (login, signup)
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (app)/             # Main application routes (dashboard, tasks)
│   │   ├── layout.tsx     # Main app layout with navbar
│   │   ├── dashboard/page.tsx
│   │   ├── tasks/
│   │   │   ├── page.tsx   # Task list page
│   │   │   └── [id]/page.tsx # Task detail page
│   │   └── loading.tsx    # Global loading state
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (buttons, modals, etc.)
│   ├── Navbar.tsx        # Navigation bar with user info
│   ├── TaskList.tsx      # Task listing component
│   ├── TaskCard.tsx      # Individual task display
│   ├── TaskForm.tsx      # Task creation/editing form
│   ├── CompletionToggle.tsx # Task completion toggle
│   └── LoadingState.tsx  # Loading state component
├── lib/                  # Utility functions and libraries
│   └── api.ts            # Centralized API client
├── hooks/                # Custom React hooks
│   └── useAuth.ts        # Authentication state management
└── types/                # Type definitions
    └── index.ts          # Shared TypeScript types
```

## Key Development Patterns

### 1. Component Organization
- Server components by default (for data fetching and layout)
- Client components only for interactivity (forms, buttons, state)
- Use 'use client' directive when needed

### 2. API Integration
- All API calls go through the centralized client in `/lib/api.ts`
- Automatic JWT token attachment
- Consistent error handling

### 3. Authentication Flow
- Use Better Auth for session management
- Protect routes using server-side session checking
- Redirect unauthorized users to login

## Common Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build production version
npm run start        # Start production server
npm run lint         # Run linter
```

### Testing
```bash
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| NEXT_PUBLIC_BETTER_AUTH_URL | Better Auth server URL | http://localhost:8000 |
| NEXT_PUBLIC_BETTER_AUTH_TOKEN | Better Auth secret token | your-secret-token |
| NEXTAUTH_URL | Next.js application URL | http://localhost:3000 |

## Troubleshooting

### Common Issues
1. **JWT Token Not Attached**: Verify Better Auth is properly configured and session exists
2. **Route Protection Not Working**: Check server-side session validation implementation
3. **API Calls Failing**: Ensure backend server is running and CORS is configured

### Development Tips
- Use server components for data fetching to avoid unnecessary client-side requests
- Leverage Next.js Image optimization for better performance
- Use TypeScript interfaces for all data structures
- Implement proper loading and error states for better UX