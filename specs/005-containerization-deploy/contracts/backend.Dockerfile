# Multi-stage Dockerfile for FastAPI Backend
# Generated for: Todo Chatbot Phase IV
# Optimized for: Size, security, production deployment

# ============================================
# Stage 1: Build Dependencies
# ============================================
FROM python:3.9-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies required for Python packages
# gcc, musl-dev: C compiler for building Python extensions
# libffi-dev: Foreign function interface library
RUN apk add --no-cache gcc musl-dev libffi-dev postgresql-dev

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies to user directory
# --user: Install to user site-packages (~/.local)
# --no-cache-dir: Don't cache downloaded packages (reduces image size)
RUN pip install --no-cache-dir --user -r requirements.txt

# ============================================
# Stage 2: Production Runtime
# ============================================
FROM python:3.9-alpine AS runner

# Set working directory
WORKDIR /app

# Install runtime dependencies only (no build tools)
RUN apk add --no-cache libpq

# Copy installed Python packages from builder stage
COPY --from=builder /root/.local /root/.local

# Copy application code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S python && \
    adduser -S fastapi -u 1001 -G python

# Change ownership to non-root user
RUN chown -R fastapi:python /app

# Switch to non-root user
USER fastapi

# Update PATH to include user-installed packages
ENV PATH=/root/.local/bin:$PATH

# Expose FastAPI default port
EXPOSE 8080

# Health check endpoint
# Checks /health endpoint every 30 seconds
# Starts checking after 5 seconds (start-period)
# Fails after 3 consecutive failures
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Start uvicorn server
# --host 0.0.0.0: Listen on all interfaces
# --port 8080: Listen on port 8080
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]

# ============================================
# Build Instructions:
# ============================================
# docker build -t todo-backend:latest -f backend/Dockerfile backend/
# docker images | grep todo-backend
# Expected size: < 300MB
#
# Run locally:
# docker run -p 8080:8080 \
#   -e DATABASE_URL=postgresql://user:pass@host:5432/db \
#   -e JWT_SECRET=secret \
#   todo-backend:latest
#
# Load to Minikube:
# minikube image load todo-backend:latest
