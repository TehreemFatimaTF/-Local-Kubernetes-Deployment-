#!/bin/bash
# Build container images for Todo Chatbot application
# This script builds both frontend and backend images with proper tagging

set -e

echo "=========================================="
echo "Building Todo Chatbot Container Images"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REGISTRY="localhost:5000"
VERSION="1.0.0"
FRONTEND_IMAGE="${REGISTRY}/todo-frontend:${VERSION}"
BACKEND_IMAGE="${REGISTRY}/todo-backend:${VERSION}"

# Build frontend image
echo -e "${YELLOW}Building frontend image...${NC}"
docker build -t ${FRONTEND_IMAGE} -f docker/frontend/Dockerfile .
docker tag ${FRONTEND_IMAGE} ${REGISTRY}/todo-frontend:latest
echo -e "${GREEN}✓ Frontend image built: ${FRONTEND_IMAGE}${NC}"
echo ""

# Build backend image
echo -e "${YELLOW}Building backend image...${NC}"
docker build -t ${BACKEND_IMAGE} -f docker/backend/Dockerfile .
docker tag ${BACKEND_IMAGE} ${REGISTRY}/todo-backend:latest
echo -e "${GREEN}✓ Backend image built: ${BACKEND_IMAGE}${NC}"
echo ""

# Display images
echo "=========================================="
echo "Built Images:"
echo "=========================================="
docker images | grep "todo-frontend\|todo-backend"
echo ""

echo -e "${GREEN}✓ All images built successfully!${NC}"
echo ""
echo "Next steps:"
echo "  1. Test locally: docker-compose up"
echo "  2. Load into Minikube: minikube image load ${FRONTEND_IMAGE}"
echo "  3. Deploy to Kubernetes: ./scripts/deploy-app.sh"
