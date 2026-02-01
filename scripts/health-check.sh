#!/bin/bash
# Health Check Script
# Verifies the health of all deployed components

set -e

echo "🏥 Running health checks..."

# Check namespace
echo "📦 Checking namespace..."
if kubectl get namespace todo-dev &> /dev/null; then
    echo "✅ Namespace todo-dev exists"
else
    echo "❌ Namespace todo-dev not found"
    exit 1
fi

# Check pods
echo ""
echo "🔍 Checking pod status..."
kubectl get pods -n todo-dev

# Count running pods
TOTAL_PODS=$(kubectl get pods -n todo-dev --no-headers 2>/dev/null | wc -l)
RUNNING_PODS=$(kubectl get pods -n todo-dev --field-selector=status.phase=Running --no-headers 2>/dev/null | wc -l)

echo ""
echo "📊 Pod summary: $RUNNING_PODS/$TOTAL_PODS running"

# Check each component
echo ""
echo "🔍 Checking component health..."

# Database
if kubectl get pod -l component=database -n todo-dev &> /dev/null; then
    DB_STATUS=$(kubectl get pod -l component=database -n todo-dev -o jsonpath='{.items[0].status.phase}')
    if [ "$DB_STATUS" == "Running" ]; then
        echo "✅ Database: Running"
    else
        echo "❌ Database: $DB_STATUS"
    fi
else
    echo "❌ Database: Not found"
fi

# Backend
if kubectl get pod -l component=backend -n todo-dev &> /dev/null; then
    BACKEND_STATUS=$(kubectl get pod -l component=backend -n todo-dev -o jsonpath='{.items[0].status.phase}')
    if [ "$BACKEND_STATUS" == "Running" ]; then
        echo "✅ Backend: Running"

        # Test backend health endpoint
        BACKEND_POD=$(kubectl get pod -l component=backend -n todo-dev -o jsonpath='{.items[0].metadata.name}')
        if kubectl exec -n todo-dev $BACKEND_POD -- wget -q -O- http://localhost:8000/health &> /dev/null; then
            echo "✅ Backend health endpoint: OK"
        else
            echo "⚠️  Backend health endpoint: Not responding"
        fi
    else
        echo "❌ Backend: $BACKEND_STATUS"
    fi
else
    echo "❌ Backend: Not found"
fi

# Frontend
if kubectl get pod -l component=frontend -n todo-dev &> /dev/null; then
    FRONTEND_COUNT=$(kubectl get pod -l component=frontend -n todo-dev --field-selector=status.phase=Running --no-headers | wc -l)
    echo "✅ Frontend: $FRONTEND_COUNT replicas running"
else
    echo "❌ Frontend: Not found"
fi

# Check services
echo ""
echo "🌐 Checking services..."
kubectl get svc -n todo-dev

# Check resource usage
echo ""
echo "📊 Resource usage:"
kubectl top pods -n todo-dev 2>/dev/null || echo "⚠️  Metrics not available (metrics-server may not be ready)"

echo ""
if [ "$RUNNING_PODS" -eq "$TOTAL_PODS" ] && [ "$TOTAL_PODS" -gt 0 ]; then
    echo "✅ All health checks passed!"
else
    echo "⚠️  Some components are not healthy"
    exit 1
fi
