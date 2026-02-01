# Makefile for FastAPI Docker Development
# Usage: make <target>

.PHONY: help build start stop restart logs shell test clean rebuild

# Default target
help:
	@echo "FastAPI Docker Development Commands"
	@echo "===================================="
	@echo "make build      - Build Docker image"
	@echo "make start      - Start development container"
	@echo "make stop       - Stop container"
	@echo "make restart    - Restart container"
	@echo "make logs       - View container logs (follow)"
	@echo "make shell      - Access container shell"
	@echo "make test       - Run tests inside container"
	@echo "make clean      - Remove container and image"
	@echo "make rebuild    - Rebuild image and restart container"
	@echo "make status     - Show container status"
	@echo "make health     - Check API health"

# Build Docker image
build:
	@echo "📦 Building Docker image..."
	docker build -t fastapi-backend-dev .
	@echo "✅ Build complete"

# Start container with bind mount
start:
	@echo "🚀 Starting development container..."
	@docker rm -f fastapi-dev 2>/dev/null || true
	docker run -d \
		--name fastapi-dev \
		-p 8000:8000 \
		-v "$$(pwd):/app" \
		--env-file .env \
		fastapi-backend-dev
	@echo "✅ Container started"
	@echo "🌐 API: http://localhost:8000"
	@echo "📚 Docs: http://localhost:8000/docs"

# Stop container
stop:
	@echo "🛑 Stopping container..."
	docker stop fastapi-dev
	@echo "✅ Container stopped"

# Restart container
restart:
	@echo "🔄 Restarting container..."
	docker restart fastapi-dev
	@echo "✅ Container restarted"

# View logs
logs:
	@echo "📋 Viewing logs (Ctrl+C to exit)..."
	docker logs -f fastapi-dev

# Access container shell
shell:
	@echo "🐚 Accessing container shell..."
	docker exec -it fastapi-dev bash

# Run tests
test:
	@echo "🧪 Running tests..."
	docker exec fastapi-dev pytest

# Clean up
clean:
	@echo "🧹 Cleaning up..."
	docker rm -f fastapi-dev 2>/dev/null || true
	docker rmi fastapi-backend-dev 2>/dev/null || true
	@echo "✅ Cleanup complete"

# Rebuild everything
rebuild: clean build start
	@echo "✅ Rebuild complete"

# Show container status
status:
	@echo "📊 Container Status:"
	@docker ps -a --filter "name=fastapi-dev" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Check API health
health:
	@echo "🏥 Checking API health..."
	@curl -s http://localhost:8000/health | python -m json.tool || echo "❌ API not responding"

# Docker Compose commands
compose-up:
	@echo "🚀 Starting with Docker Compose..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "✅ Services started"

compose-down:
	@echo "🛑 Stopping Docker Compose services..."
	docker-compose -f docker-compose.dev.yml down
	@echo "✅ Services stopped"

compose-logs:
	@echo "📋 Viewing Docker Compose logs..."
	docker-compose -f docker-compose.dev.yml logs -f
