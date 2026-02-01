# Todo Web Application

A secure, full-stack todo application with user authentication, task management, and responsive UI built for Hackathon Phase II.

[![Status](https://img.shields.io/badge/status-production--ready-green)]()
[![Completion](https://img.shields.io/badge/completion-89.6%25-brightgreen)]()

---

## 🎯 Overview

A modern, production-ready todo application demonstrating full-stack development best practices. Built with Next.js 16+ and FastAPI, featuring JWT authentication, comprehensive input validation, rate limiting, and a responsive UI with accessibility support.

**Documentation**: See [READINESS_CHECKLIST.md](READINESS_CHECKLIST.md) for detailed status

---

## ✨ Features

### Core Functionality
- ✅ User Authentication (JWT-based registration and login)
- ✅ Task Management (Full CRUD operations)
- ✅ Task Completion Toggle
- ✅ Task Filtering (All, Active, Completed)
- ✅ User Data Isolation

### User Experience
- ✅ Responsive Design (Mobile, Tablet, Desktop)
- ✅ Modern UI with Tailwind CSS
- ✅ Smooth Animations and Transitions
- ✅ Accessibility (ARIA labels, keyboard navigation)
- ✅ Loading States and Error Handling

### Security & Performance
- ✅ Password Hashing (Bcrypt)
- ✅ Input Validation (Frontend & Backend)
- ✅ Rate Limiting (100 req/min per IP)
- ✅ Database Indexes
- ✅ Comprehensive Error Logging

---

## 🛠 Tech Stack

**Frontend**: Next.js 16+, TypeScript, Tailwind CSS
**Backend**: FastAPI, SQLModel, PostgreSQL
**Authentication**: JWT (python-jose)

---

## 📦 Prerequisites

- Node.js 18.x or higher
- Python 3.9 or higher
- PostgreSQL 12.x or higher

---

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd hackathon-2-phase-2
```

### 2. Setup Database
```bash
createdb todo_db
```

### 3. Configure Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials and JWT secret
pip install -r requirements.txt
python src/database/create_indexes.py
uvicorn main:app --reload --port 8080
```

### 4. Configure Frontend
```bash
cd frontend
cp .env.local.example .env.local
# Edit .env.local with API URL
npm install
npm run dev
```

### 5. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- API Docs: http://localhost:8080/docs

---

## 📖 Documentation

- [DATABASE_SETUP.md](DATABASE_SETUP.md) - Database configuration guide
- [VERIFICATION_GUIDE.md](VERIFICATION_GUIDE.md) - Manual testing checklist
- [READINESS_CHECKLIST.md](READINESS_CHECKLIST.md) - Production readiness status

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Tasks (Requires Authentication)
- `GET /api/tasks` - Get all user tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/{id}` - Get specific task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `PATCH /api/tasks/{id}/toggle` - Toggle completion

---

## 🧪 Testing

Follow the comprehensive testing guide in [VERIFICATION_GUIDE.md](VERIFICATION_GUIDE.md).

**Test Coverage**:
- Authentication flow
- Task CRUD operations
- User data isolation
- Responsive design
- Accessibility
- Security (rate limiting, validation)

---

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- User data isolation
- Input validation and sanitization
- Rate limiting (100 req/min)
- SQL injection protection
- XSS protection

---

## 📊 Project Status

**Completion**: 89.6% (60/67 tasks)
**Status**: ✅ Production-Ready for Hackathon Phase II
**Last Updated**: 2026-01-12

---

## 📄 License

MIT License

---

**Made with 💻 for Hackathon Phase II**
