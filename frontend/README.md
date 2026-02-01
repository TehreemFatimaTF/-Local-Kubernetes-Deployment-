# Todo Frontend

Modern, responsive frontend for the Todo Web Application built with Next.js 16+, TypeScript, and Tailwind CSS.

## Features

- 🔐 JWT-based authentication with Better Auth
- ✨ Beautiful UI with Framer Motion animations
- 📱 Fully responsive design (mobile, tablet, desktop)
- ♿ Accessibility support with ARIA labels
- 🎨 Modern glassmorphism design with Tailwind CSS
- 🚀 Optimized performance with Next.js 16+
- 🧪 Comprehensive test coverage with Jest and React Testing Library

## Technology Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Authentication**: Better Auth (JWT)
- **Testing**: Jest, React Testing Library
- **HTTP Client**: Fetch API

## Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

## Running the Application

### Development Mode
```bash
npm run dev
```
The application will be available at http://localhost:3000

### Production Build
```bash
npm run build
npm start
```

## Testing

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test:watch
```

### Test Coverage
The test suite includes:
- Component unit tests
- Integration tests for authentication flow
- Error boundary tests
- Form validation tests

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── dashboard/    # Dashboard page
│   │   ├── login/        # Login page
│   │   ├── tasks/        # Tasks pages
│   │   └── layout.tsx    # Root layout
│   ├── components/       # Reusable components
│   │   ├── AuthForm.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── Navbar.tsx
│   │   └── __tests__/    # Component tests
│   ├── hooks/            # Custom React hooks
│   │   └── useAuth.ts
│   ├── lib/              # Utility libraries
│   │   └── api.ts        # API client
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
├── jest.config.js        # Jest configuration
├── jest.setup.js         # Jest setup file
└── package.json
```

## Available Pages

- `/` - Home page (redirects based on auth state)
- `/login` - Login/Signup page
- `/dashboard` - User dashboard with task overview
- `/tasks` - Task list and management
- `/tasks/[id]` - Individual task detail page

## API Integration

The frontend communicates with the backend API through a centralized API client (`src/lib/api.ts`) that handles:
- JWT token management
- Request/response formatting
- Error handling
- Automatic token refresh

## Authentication Flow

1. User signs up or logs in via `/login`
2. Backend returns JWT token
3. Token is stored in localStorage
4. Token is included in all API requests via Authorization header
5. Protected routes check authentication status
6. Expired tokens trigger automatic logout and redirect to login

## Styling

The application uses:
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for smooth animations
- **Glassmorphism** design pattern for modern UI
- **Gradient backgrounds** for visual appeal
- **Responsive breakpoints** for all screen sizes

## Error Handling

- Global error boundary catches React errors
- API errors are displayed with user-friendly messages
- Form validation provides real-time feedback
- Loading states prevent user confusion

## Accessibility

- Semantic HTML elements
- ARIA labels for screen readers
- Keyboard navigation support
- Focus management
- Color contrast compliance

## Performance Optimizations

- Next.js automatic code splitting
- Image optimization
- Lazy loading of components
- Efficient re-rendering with React hooks
- Optimized bundle size

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Port already in use
```bash
# Kill process on port 3000
npx kill-port 3000
```

### Clear cache and reinstall
```bash
rm -rf node_modules .next
npm install
```

### Authentication issues
- Clear localStorage in browser DevTools
- Check that backend is running on correct port
- Verify API_BASE_URL in .env.local

## Contributing

1. Follow TypeScript best practices
2. Write tests for new components
3. Use Tailwind CSS for styling
4. Ensure accessibility compliance
5. Test on multiple screen sizes

## License

MIT License
