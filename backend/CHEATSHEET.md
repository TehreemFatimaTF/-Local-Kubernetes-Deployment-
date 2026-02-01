# Docker Development Cheat Sheet

## 🚀 Quick Commands

### Start Development
```bash
# Option 1: Quick start script
.\start-dev.ps1              # Windows
./start-dev.sh               # Linux/Mac

# Option 2: Docker Compose
docker-compose -f docker-compose.dev.yml up -d

# Option 3: Make (if you have make installed)
make start

# Option 4: Manual
docker run -d --name fastapi-dev -p 8000:8000 -v "${PWD}:/app" --env-file .env fastapi-backend-dev
```

### View Logs
```bash
docker logs -f fastapi-dev
# or
make logs
```

### Stop/Start
```bash
docker stop fastapi-dev
docker start fastapi-dev
# or
make stop
make start
```

### Restart (after .env changes)
```bash
docker restart fastapi-dev
# or
make restart
```

### Access Container Shell
```bash
docker exec -it fastapi-dev bash
# or
make shell
```

### Remove Container
```bash
docker rm -f fastapi-dev
# or
make clean
```

---

## 🔧 When to Rebuild

### Rebuild Image (only when requirements.txt changes)
```bash
docker build -t fastapi-backend-dev .
docker rm -f fastapi-dev
.\start-dev.ps1
# or
make rebuild
```

### Don't Rebuild For:
- ✅ Python code changes (auto-reload)
- ✅ .env changes (just restart container)
- ✅ Adding new routes/files (auto-reload)

### Do Rebuild For:
- ❌ requirements.txt changes
- ❌ Dockerfile changes
- ❌ System dependencies changes

---

## 🐛 Debugging

### Check if container is running
```bash
docker ps | grep fastapi-dev
```

### Check container logs
```bash
docker logs fastapi-dev
```

### Check if files are mounted
```bash
docker exec fastapi-dev ls -la /app
```

### Check environment variables
```bash
docker exec fastapi-dev env | grep DATABASE_URL
```

### Test API manually
```bash
curl http://localhost:8000/health
```

### Check port usage
```powershell
# Windows
netstat -ano | findstr :8000

# Linux/Mac
lsof -i :8000
```

---

## 📝 Hot Reload Verification

1. Start container and watch logs:
   ```bash
   docker logs -f fastapi-dev
   ```

2. Edit any Python file (e.g., main.py)

3. Look for this in logs:
   ```
   INFO:     Detected file change in 'main.py'. Reloading...
   INFO:     Started server process
   ```

4. If you don't see reload messages:
   - Check bind mount: `docker exec fastapi-dev ls /app`
   - Restart container: `docker restart fastapi-dev`
   - Check Dockerfile has `--reload` flag

---

## 🔑 Environment Variables

### Create .env file
```bash
cp .env.example .env
# Edit .env with your values
```

### Important for Docker:
- Use `host.docker.internal` instead of `localhost` for database connections
- Example: `DATABASE_URL=postgresql://user:pass@host.docker.internal:5432/db`

### After changing .env:
```bash
docker restart fastapi-dev
```

---

## 🌐 Access Points

- **API Root**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

---

## 🎯 Common Workflows

### Daily Development
```bash
# Morning: Start container
docker start fastapi-dev

# Code all day (auto-reload works)

# Evening: Stop container
docker stop fastapi-dev
```

### Adding New Dependencies
```bash
# 1. Add to requirements.txt
# 2. Rebuild image
docker build -t fastapi-backend-dev .
# 3. Recreate container
docker rm -f fastapi-dev
.\start-dev.ps1
```

### Database Changes
```bash
# If database is in Docker, connect using host.docker.internal
# If database is local, it should work automatically
```

### Testing Changes
```bash
# 1. Edit code
# 2. Wait for reload (check logs)
# 3. Test: curl http://localhost:8000/your-endpoint
```

---

## 💡 Pro Tips

1. **Keep logs open**: `docker logs -f fastapi-dev` in a separate terminal
2. **Use .env.example**: Template for team members
3. **Don't commit .env**: Already in .gitignore
4. **Use Makefile**: Simplifies common commands
5. **Check mount**: If reload doesn't work, verify mount with `docker exec fastapi-dev ls /app`

---

## 🆘 Troubleshooting

### "Cannot find module 'routes'"
```bash
# Check if files are mounted
docker exec fastapi-dev ls /app
# Should show: main.py, routes/, db.py, etc.
```

### "Address already in use"
```bash
# Stop existing container
docker stop fastapi-dev
docker rm fastapi-dev
# Or use different port
docker run -d --name fastapi-dev -p 8001:8000 ...
```

### "No such file or directory: .env"
```bash
# Create .env from template
cp .env.example .env
# Edit with your values
```

### Hot reload not working
```bash
# 1. Check logs for "Detected file change"
docker logs fastapi-dev

# 2. Restart container
docker restart fastapi-dev

# 3. Verify mount
docker exec fastapi-dev ls /app
```

### Database connection fails
```bash
# Use host.docker.internal instead of localhost
# In .env:
DATABASE_URL=postgresql://user:pass@host.docker.internal:5432/db
```
