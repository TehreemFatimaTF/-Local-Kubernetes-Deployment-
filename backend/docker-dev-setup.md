# FastAPI Docker Development Setup with Hot Reload

## Overview
This guide shows how to run your FastAPI backend in Docker with instant code reloading using bind mounts. No image rebuilds needed after code changes.

---

## 1. Build the Docker Image (One Time Only)

```bash
# Navigate to backend directory
cd backend

# Build the image
docker build -t fastapi-backend-dev .
```

**Note:** You only need to rebuild if `requirements.txt` changes.

---

## 2. Run Container with Bind Mount

### Linux / Mac / WSL

```bash
docker run -d \
  --name fastapi-dev \
  -p 8000:8000 \
  -v "$(pwd):/app" \
  -e DATABASE_URL="your_database_url" \
  -e GEMINI_API_KEY="your_api_key" \
  --env-file .env \
  fastapi-backend-dev
```

**With explicit path (if pwd doesn't work):**
```bash
docker run -d \
  --name fastapi-dev \
  -p 8000:8000 \
  -v "/absolute/path/to/backend:/app" \
  --env-file .env \
  fastapi-backend-dev
```

### Windows PowerShell

```powershell
docker run -d `
  --name fastapi-dev `
  -p 8000:8000 `
  -v "${PWD}:/app" `
  --env-file .env `
  fastapi-backend-dev
```

**Windows CMD:**
```cmd
docker run -d ^
  --name fastapi-dev ^
  -p 8000:8000 ^
  -v "%cd%:/app" ^
  --env-file .env ^
  fastapi-backend-dev
```

**Windows with absolute path:**
```powershell
docker run -d `
  --name fastapi-dev `
  -p 8000:8000 `
  -v "E:\QUARTER-04\CLAUDE-CODE\HACKATHON-PREPARATION\HACKATHON-02\PHASE-04\backend:/app" `
  --env-file .env `
  fastapi-backend-dev
```

---

## 3. Command Breakdown

| Flag | Purpose |
|------|---------|
| `-d` | Run container in detached mode (background) |
| `--name fastapi-dev` | Give container a friendly name |
| `-p 8000:8000` | Map host port 8000 to container port 8000 |
| `-v "$(pwd):/app"` | **Bind mount**: sync local code to container `/app` |
| `--env-file .env` | Load environment variables from `.env` file |
| `-e VAR=value` | Set individual environment variables |

---

## 4. How Bind Mounting Works (Simple Explanation)

### Traditional Docker (Slow)
```
1. Write code locally
2. Rebuild Docker image (copies code into image)
3. Stop old container
4. Start new container
5. Test changes
```

### With Bind Mount (Fast)
```
1. Write code locally
2. Changes instantly appear in running container
3. Uvicorn detects change and auto-reloads
4. Test changes immediately
```

**Technical Details:**
- Bind mount creates a **live link** between your local filesystem and container filesystem
- When you edit `main.py` locally, the container sees the change at `/app/main.py` instantly
- Uvicorn's `--reload` flag watches for file changes and restarts the server automatically
- No copying, no rebuilding - just direct filesystem access

**Analogy:** Think of it like a shared folder between your computer and the container, not a copy.

---

## 5. Useful Commands

### View Logs (Watch for reload messages)
```bash
docker logs -f fastapi-dev
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

After code change:
```
INFO:     Detected file change in 'main.py'. Reloading...
```

### Stop Container
```bash
docker stop fastapi-dev
```

### Start Existing Container
```bash
docker start fastapi-dev
```

### Remove Container
```bash
docker rm -f fastapi-dev
```

### Access Container Shell (for debugging)
```bash
docker exec -it fastapi-dev bash
```

### Rebuild Image (only when requirements.txt changes)
```bash
docker build -t fastapi-backend-dev .
docker rm -f fastapi-dev  # Remove old container
# Then run the docker run command again
```

---

## 6. Common Mistakes & Debugging

### ❌ Problem: "Cannot find module 'routes'"
**Cause:** Bind mount path is incorrect, container can't see your code

**Fix:**
```bash
# Verify mount is working
docker exec fastapi-dev ls -la /app

# Should show your Python files (main.py, routes/, etc.)
# If empty or missing files, your mount path is wrong
```

**Solution:** Use absolute path instead of `$(pwd)`:
```bash
docker run -d \
  --name fastapi-dev \
  -p 8000:8000 \
  -v "/full/absolute/path/to/backend:/app" \
  --env-file .env \
  fastapi-backend-dev
```

---

### ❌ Problem: Code changes don't trigger reload
**Cause:** Uvicorn not watching the right directory or file system events not propagating

**Fix 1 - Check logs:**
```bash
docker logs fastapi-dev
# Look for "Detected file change" messages
```

**Fix 2 - Use polling mode (slower but more reliable on Windows):**
```bash
# Rebuild with this CMD in Dockerfile:
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--reload-delay", "0.5"]
```

**Fix 3 - Restart container:**
```bash
docker restart fastapi-dev
```

---

### ❌ Problem: "Address already in use" (port 8000)
**Cause:** Another process or container is using port 8000

**Fix:**
```bash
# Find what's using port 8000
# Linux/Mac:
lsof -i :8000

# Windows PowerShell:
netstat -ano | findstr :8000

# Stop the old container
docker stop fastapi-dev
docker rm fastapi-dev

# Or use a different port
docker run -d --name fastapi-dev -p 8001:8000 -v "$(pwd):/app" fastapi-backend-dev
```

---

### ❌ Problem: Permission denied errors (Linux/Mac)
**Cause:** Container runs as root, creates files owned by root

**Fix - Run container as your user:**
```bash
docker run -d \
  --name fastapi-dev \
  -p 8000:8000 \
  -v "$(pwd):/app" \
  -u "$(id -u):$(id -g)" \
  --env-file .env \
  fastapi-backend-dev
```

---

### ❌ Problem: Environment variables not loading
**Cause:** `.env` file not found or not mounted

**Fix:**
```bash
# Verify .env exists
ls -la .env

# Check if variables are loaded in container
docker exec fastapi-dev env | grep DATABASE_URL

# If missing, pass explicitly:
docker run -d \
  --name fastapi-dev \
  -p 8000:8000 \
  -v "$(pwd):/app" \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e GEMINI_API_KEY="your_key" \
  fastapi-backend-dev
```

---

### ❌ Problem: Database connection fails
**Cause:** Container can't reach `localhost` database on host

**Fix - Use host.docker.internal (Mac/Windows):**
```bash
# In .env file, change:
# DATABASE_URL=postgresql://user:pass@localhost:5432/db
# To:
DATABASE_URL=postgresql://user:pass@host.docker.internal:5432/db
```

**Fix - Use host network (Linux):**
```bash
docker run -d \
  --name fastapi-dev \
  --network host \
  -v "$(pwd):/app" \
  --env-file .env \
  fastapi-backend-dev
```

---

## 7. Production vs Development

### Development (Current Setup)
- ✅ Bind mount for instant code sync
- ✅ `--reload` enabled for auto-restart
- ✅ Verbose logging
- ✅ No code copied into image

### Production (Different Dockerfile)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .  # ← Copy code into image
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
# ← No --reload, multiple workers
```

---

## 8. Quick Reference

### Daily Workflow
```bash
# 1. Start container (first time or after stopping)
docker start fastapi-dev

# 2. Watch logs
docker logs -f fastapi-dev

# 3. Edit code in your IDE
# Changes auto-reload!

# 4. Stop when done
docker stop fastapi-dev
```

### When requirements.txt Changes
```bash
# Rebuild image
docker build -t fastapi-backend-dev .

# Recreate container
docker rm -f fastapi-dev
docker run -d --name fastapi-dev -p 8000:8000 -v "$(pwd):/app" --env-file .env fastapi-backend-dev
```

---

## 9. Verification Checklist

After running the container, verify everything works:

- [ ] Container is running: `docker ps | grep fastapi-dev`
- [ ] Logs show "Application startup complete": `docker logs fastapi-dev`
- [ ] API responds: `curl http://localhost:8000/health`
- [ ] Files are mounted: `docker exec fastapi-dev ls /app`
- [ ] Hot reload works: Edit `main.py`, check logs for "Detected file change"

---

## 10. Alternative: Docker Compose (Recommended)

For easier management, create `docker-compose.dev.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: .
    container_name: fastapi-dev
    ports:
      - "8000:8000"
    volumes:
      - .:/app
    env_file:
      - .env
    environment:
      - PYTHONUNBUFFERED=1
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Usage:**
```bash
# Start
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop
docker-compose -f docker-compose.dev.yml down
```

---

## Support

If you encounter issues:
1. Check logs: `docker logs fastapi-dev`
2. Verify mount: `docker exec fastapi-dev ls /app`
3. Test API: `curl http://localhost:8000/health`
4. Check this guide's debugging section
