# Quickstart Guide: Todo Web Application Frontend

## Prerequisites
- Node.js 18+ installed
- pnpm package manager (recommended) or npm/yarn
- Access to backend API (FastAPI server running)

## Setup Instructions

### 1. Clone and Navigate
```bash
cd frontend
```

### 2. Install Dependencies
```bash
pnpm install
# or
npm install
```

### 3. Environment Configuration
Create `.env.local` file in the frontend directory:
```env
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:8080
BETTER_AUTH_SECRET=your-super-secret-key-here
NEXT_PUBLIC_BETTER_AUTH_API_PATH=/api/auth
```

### 4. Run Development Server
```bash
pnpm dev
# or
npm run dev
```

Application will be available at http://localhost:3000

## Key Commands
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run linter
- `pnpm test` - Run tests (when implemented)

## Project Structure Overview
```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # Reusable UI components
│   ├── lib/              # Utilities and API client
│   └── hooks/            # Custom React hooks
├── public/               # Static assets
└── package.json
```

## Authentication Flow
1. User visits `/login` or `/signup`
2. Better Auth handles authentication
3. JWT token is stored securely
4. Protected routes check for valid session
5. API calls automatically include Authorization header

## API Integration
The centralized API client at `src/lib/api.ts` handles:
- Attaching JWT tokens to requests
- Error handling and loading states
- Type-safe API interactions