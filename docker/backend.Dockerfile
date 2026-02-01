# Multi-stage Dockerfile for FastAPI Backend
# Stage 1: Dependencies
FROM python:3.9-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache gcc musl-dev libffi-dev postgresql-dev

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Runtime
FROM python:3.9-alpine AS runner
WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache libpq

# Copy installed packages from builder
COPY --from=builder /root/.local /root/.local

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S python && \
    adduser -S fastapi -u 1001 -G python

# Change ownership
RUN chown -R fastapi:python /app

# Switch to non-root user
USER fastapi

# Update PATH
ENV PATH=/root/.local/bin:$PATH

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:5000/health')" || exit 1

# Start application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "5000"]
