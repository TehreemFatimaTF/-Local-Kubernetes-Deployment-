# FastAPI Docker Development - Quick Start

## 🚀 Three Ways to Run

### Option 1: Quick Start Script (Recommended)

**Windows PowerShell:**
```powershell
cd backend
.\start-dev.ps1
```

**Linux/Mac:**
```bash
cd backend
chmod +x start-dev.sh
./start-dev.sh
```

### Option 2: Docker Compose
```bash
cd backend
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml logs -f
```

### Option 3: Manual Docker Run

**Windows PowerShell:**
```powershell
cd backend
docker build -t fastapi-backend-dev .
docker run -d --name fastapi-dev -p 8000:8000 -v "${PWD}:/app" --env-file .env fastapi-backend-dev
docker logs -f fastapi-dev
```

**Linux/Mac:**
```bash
cd backend
docker build -t fastapi-backend-dev .
docker run -d --name fastapi-dev -p 8000:8000 -v "$(pwd):/app" --env-file .env fastapi-backend-dev
docker logs -f fastapi-dev
```

---

## ✅ What You Get

- **Instant hot reload**: Edit code → Save → Auto-reload (no rebuild!)
- **One-time build**: Only rebuild when `requirements.txt` changes
- **Production-ready**: Separate `Dockerfile.prod` for deployment
- **Easy management**: Scripts handle everything automatically

---

## 📝 Daily Workflow

1. **Start**: Run `start-dev.ps1` (Windows) or `start-dev.sh` (Linux/Mac)
2. **Code**: Edit your Python files in your IDE
3. **Test**: Changes reflect instantly at `http://localhost:8000`
4. **Stop**: `docker stop fastapi-dev`

---

## 🔧 When to Rebuild

Only rebuild when you modify `requirements.txt`:

```bash
docker build -t fastapi-backend-dev .
docker rm -f fastapi-dev
# Then run start script again
```

---

## 📚 Full Documentation

See `docker-dev-setup.md` for:
- Detailed explanations
- Troubleshooting guide
- Common mistakes
- Production deployment

---

## 🌐 Access Points

- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

---

## 🆘 Quick Troubleshooting

**Container won't start?**
```bash
docker logs fastapi-dev
```

**Code not reloading?**
```bash
docker restart fastapi-dev
```

**Port already in use?**
```bash
docker stop fastapi-dev
docker rm fastapi-dev
```

**Need to access container?**
```bash
docker exec -it fastapi-dev bash
```
