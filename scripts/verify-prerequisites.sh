#!/bin/bash
# Prerequisite verification script for Cloud Native Todo Chatbot Deployment
# This script checks if all required tools are installed and properly configured

set -e

echo "=========================================="
echo "Cloud Native Deployment Prerequisites Check"
echo "=========================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Function to check if a command exists
check_command() {
    local cmd=$1
    local name=$2
    local version_cmd=$3

    echo -n "Checking $name... "
    if command -v $cmd &> /dev/null; then
        version=$($version_cmd 2>&1 | head -1)
        echo -e "${GREEN}✓ INSTALLED${NC}"
        echo "  Version: $version"
        return 0
    else
        echo -e "${RED}✗ NOT FOUND${NC}"
        echo "  Please install $name"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

# Check Docker
echo ""
echo "1. Docker Desktop"
check_command "docker" "Docker" "docker --version"
if command -v docker &> /dev/null; then
    if docker ps &> /dev/null; then
        echo -e "  ${GREEN}✓ Docker daemon is running${NC}"
    else
        echo -e "  ${RED}✗ Docker daemon is not running${NC}"
        echo "  Please start Docker Desktop"
        ERRORS=$((ERRORS + 1))
    fi
fi

# Check Minikube
echo ""
echo "2. Minikube"
check_command "minikube" "Minikube" "minikube version"

# Check kubectl
echo ""
echo "3. kubectl"
check_command "kubectl" "kubectl" "kubectl version --client"

# Check Helm
echo ""
echo "4. Helm"
check_command "helm" "Helm" "helm version"

# Check system resources
echo ""
echo "5. System Resources"
echo -n "Checking available resources... "
if command -v docker &> /dev/null && docker info &> /dev/null; then
    echo -e "${GREEN}✓ OK${NC}"
    echo "  Note: Minikube requires minimum 4GB RAM and 2 CPU cores"
else
    echo -e "${YELLOW}⚠ UNABLE TO CHECK${NC}"
fi

# Summary
echo ""
echo "=========================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All prerequisites are satisfied!${NC}"
    echo ""
    echo "You can now proceed with deployment:"
    echo "  1. Build container images: ./scripts/build-images.sh"
    echo "  2. Setup Minikube cluster: ./scripts/setup-minikube.sh"
    echo "  3. Deploy application: ./scripts/deploy-app.sh"
    echo "=========================================="
    exit 0
else
    echo -e "${RED}✗ $ERRORS prerequisite(s) missing or not configured${NC}"
    echo ""
    echo "Please install missing tools and try again."
    echo "See README-deployment.md for installation instructions."
    echo "=========================================="
    exit 1
fi
