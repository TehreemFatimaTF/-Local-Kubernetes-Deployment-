#!/bin/bash
# Minikube Setup Script
# Creates and configures a local Kubernetes cluster for todo-app deployment

set -e

echo "🚀 Starting Minikube cluster setup..."

# Check if Minikube is installed
if ! command -v minikube &> /dev/null; then
    echo "❌ Error: Minikube is not installed"
    echo "Please install Minikube: https://minikube.sigs.k8s.io/docs/start/"
    exit 1
fi

# Check if Docker is running
if ! docker ps &> /dev/null; then
    echo "❌ Error: Docker is not running"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

# Start Minikube with specified resources
echo "📦 Starting Minikube cluster (2 CPUs, 4GB RAM)..."
minikube start --driver=docker --cpus=2 --memory=4096

# Enable required addons
echo "🔧 Enabling Minikube addons..."
minikube addons enable metrics-server
minikube addons enable dashboard

# Verify cluster is running
echo "✅ Verifying cluster status..."
minikube status

# Display cluster info
echo "📊 Cluster information:"
kubectl cluster-info

echo "✅ Minikube cluster setup complete!"
echo ""
echo "Next steps:"
echo "  1. Create namespace: kubectl create namespace todo-dev"
echo "  2. Deploy application: ./scripts/deploy-app.sh"
echo "  3. Access dashboard: minikube dashboard"
