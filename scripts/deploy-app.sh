#!/bin/bash
# Deploy Application Script
# Deploys the todo application to Kubernetes using kubectl

set -e

echo "🚀 Deploying todo application to Kubernetes..."

# Check if namespace exists
if ! kubectl get namespace todo-dev &> /dev/null; then
    echo "📦 Creating namespace..."
    kubectl apply -f kubernetes/manifests/namespace.yaml
else
    echo "✅ Namespace todo-dev already exists"
fi

# Apply ConfigMap and Secrets
echo "🔧 Applying configuration..."
kubectl apply -f kubernetes/manifests/configmap.yaml
kubectl apply -f kubernetes/manifests/secrets.yaml

# Deploy database
echo "💾 Deploying database..."
kubectl apply -f kubernetes/manifests/database-statefulset.yaml
kubectl apply -f kubernetes/manifests/database-service.yaml

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
kubectl wait --for=condition=ready pod -l component=database -n todo-dev --timeout=120s

# Deploy backend
echo "⚙️  Deploying backend..."
kubectl apply -f kubernetes/manifests/backend-deployment.yaml
kubectl apply -f kubernetes/manifests/backend-service.yaml

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
kubectl wait --for=condition=ready pod -l component=backend -n todo-dev --timeout=120s

# Deploy frontend
echo "🎨 Deploying frontend..."
kubectl apply -f kubernetes/manifests/frontend-deployment.yaml
kubectl apply -f kubernetes/manifests/frontend-service.yaml

# Wait for frontend to be ready
echo "⏳ Waiting for frontend to be ready..."
kubectl wait --for=condition=ready pod -l component=frontend -n todo-dev --timeout=120s

# Display deployment status
echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Deployment status:"
kubectl get all -n todo-dev

echo ""
echo "🌐 Access the application:"
echo "  Frontend URL: $(minikube service todo-frontend -n todo-dev --url)"
echo ""
echo "Next steps:"
echo "  1. Test the application: curl \$(minikube service todo-frontend -n todo-dev --url)"
echo "  2. View logs: kubectl logs -f deployment/todo-backend -n todo-dev"
echo "  3. Check health: ./scripts/health-check.sh"
