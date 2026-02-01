# Multi-stage Dockerfile for Next.js Frontend
# Generated for: Todo Chatbot Phase IV
# Optimized for: Size, security, production deployment

# ============================================
# Stage 1: Dependencies and Build
# ============================================
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package.json package-lock.json ./

# Install production dependencies only
# --only=production excludes devDependencies
# --frozen-lockfile ensures reproducible builds
RUN npm ci --only=production --frozen-lockfile

# Copy source code
COPY . .

# Build Next.js application
# Generates optimized production build in .next/
RUN npm run build

# ============================================
# Stage 2: Production Runtime
# ============================================
FROM node:18-alpine AS runner

# Set working directory
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy built application from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

# Change ownership to non-root user
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose Next.js default port
EXPOSE 3000

# Start Next.js production server
CMD ["npm", "start"]

# ============================================
# Build Instructions:
# ============================================
# docker build -t todo-frontend:latest -f frontend/Dockerfile frontend/
# docker images | grep todo-frontend
# Expected size: < 500MB
#
# Run locally:
# docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://localhost:8080 todo-frontend:latest
#
# Load to Minikube:
# minikube image load todo-frontend:latest
