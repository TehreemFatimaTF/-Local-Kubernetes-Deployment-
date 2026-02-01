#!/bin/bash
# Cleanup Script
# Removes all deployed resources and stops Minikube

set -e

echo "🧹 Cleaning up todo application deployment..."

# Ask for confirmation
read -p "This will delete all resources in todo-dev namespace and stop Minikube. Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cleanup cancelled"
    exit 0
fi

# Delete namespace (removes all resources)
if kubectl get namespace todo-dev &> /dev/null; then
    echo "🗑️  Deleting namespace todo-dev..."
    kubectl delete namespace todo-dev
    echo "✅ Namespace deleted"
else
    echo "⚠️  Namespace todo-dev not found"
fi

# Stop Minikube
echo "🛑 Stopping Minikube..."
minikube stop

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "To completely remove Minikube:"
echo "  minikube delete"
