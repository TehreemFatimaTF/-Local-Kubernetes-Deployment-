from sqlmodel import create_engine, Session, SQLModel
from models import Task, Conversation, Message
import os

# Database URL from environment variable
# Use SQLite for local development, PostgreSQL in production
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todo_app.db")

# Create engine with optimized settings
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

# CRITICAL FIX: echo=False to prevent RAM filling with SQL logs
# T056: Configure database transaction isolation level for concurrent access
# T057: Database connection pooling configuration
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Disable SQL query logging to prevent RAM issues
    connect_args=connect_args,
    pool_size=10,  # Maximum number of connections to keep open
    max_overflow=20,  # Maximum overflow connections
    pool_pre_ping=True,  # Verify connections before using them
    pool_recycle=3600,  # Recycle connections after 1 hour
    # Transaction isolation level for concurrent access
    # READ COMMITTED: Prevents dirty reads, allows concurrent transactions
    isolation_level="READ COMMITTED" if not DATABASE_URL.startswith("sqlite") else None
)

def create_db_and_tables():
    """Create database tables"""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Get database session"""
    with Session(engine) as session:
        yield session