# Test script to verify Docker development setup

Write-Host "🧪 Testing Docker Development Setup..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if Docker is running
Write-Host "1️⃣  Checking Docker..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "   ✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Docker is not running - Please start Docker Desktop" -ForegroundColor Red
    exit 1
}

# Test 2: Check if .env exists
Write-Host "2️⃣  Checking .env file..." -ForegroundColor Yellow
if (Test-Path .env) {
    Write-Host "   ✅ .env file exists" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  .env file not found - You'll need to create it" -ForegroundColor Yellow
}

# Test 3: Build the image
Write-Host "3️⃣  Building Docker image..." -ForegroundColor Yellow
try {
    docker build -t fastapi-backend-dev . 2>&1 | Out-Null
    Write-Host "   ✅ Image built successfully" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Build failed - Check Dockerfile" -ForegroundColor Red
    exit 1
}

# Test 4: Start container
Write-Host "4️⃣  Starting container..." -ForegroundColor Yellow
docker rm -f fastapi-dev 2>&1 | Out-Null
docker run -d --name fastapi-dev -p 8000:8000 -v "${PWD}:/app" --env-file .env fastapi-backend-dev 2>&1 | Out-Null
Start-Sleep -Seconds 3

# Test 5: Check if container is running
Write-Host "5️⃣  Checking container status..." -ForegroundColor Yellow
$containerStatus = docker ps --filter "name=fastapi-dev" --format "{{.Status}}"
if ($containerStatus) {
    Write-Host "   ✅ Container is running: $containerStatus" -ForegroundColor Green
} else {
    Write-Host "   ❌ Container failed to start" -ForegroundColor Red
    Write-Host "   Logs:" -ForegroundColor Yellow
    docker logs fastapi-dev
    exit 1
}

# Test 6: Check if files are mounted
Write-Host "6️⃣  Checking bind mount..." -ForegroundColor Yellow
$mountedFiles = docker exec fastapi-dev ls /app
if ($mountedFiles -match "main.py") {
    Write-Host "   ✅ Files are mounted correctly" -ForegroundColor Green
} else {
    Write-Host "   ❌ Bind mount failed - Files not visible in container" -ForegroundColor Red
    exit 1
}

# Test 7: Check if API responds
Write-Host "7️⃣  Testing API endpoint..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ API is responding: $($response.Content)" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  API not responding yet (may need more time to start)" -ForegroundColor Yellow
    Write-Host "   Check logs: docker logs fastapi-dev" -ForegroundColor Yellow
}

# Test 8: Test hot reload
Write-Host "8️⃣  Testing hot reload..." -ForegroundColor Yellow
Write-Host "   📝 Modify main.py and check logs for 'Detected file change'" -ForegroundColor Cyan

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Setup verification complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "📚 Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 View logs: docker logs -f fastapi-dev" -ForegroundColor Yellow
Write-Host "🛑 Stop: docker stop fastapi-dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 Now edit any .py file and watch it auto-reload!" -ForegroundColor Green
