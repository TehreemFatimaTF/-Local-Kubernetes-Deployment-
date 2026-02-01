"""
Database optimization script for Todo Web Application

This script creates indexes on frequently queried columns to improve performance.
Run this after initial database setup or when deploying to production.
"""

from sqlmodel import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todo_app.db")
engine = create_engine(DATABASE_URL, echo=True)


def create_indexes():
    """Create database indexes for optimized query performance"""

    with engine.connect() as conn:
        print("Creating database indexes...")

        # Index on tasks.user_id for fast user task lookups
        # Most common query: SELECT * FROM tasks WHERE user_id = ?
        try:
            conn.execute(text(
                "CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON task(user_id)"
            ))
            print("✓ Created index on tasks.user_id")
        except Exception as e:
            print(f"✗ Index on tasks.user_id: {e}")

        # Index on tasks.completed for filtering by completion status
        # Common query: SELECT * FROM tasks WHERE user_id = ? AND completed = ?
        try:
            conn.execute(text(
                "CREATE INDEX IF NOT EXISTS idx_tasks_completed ON task(completed)"
            ))
            print("✓ Created index on tasks.completed")
        except Exception as e:
            print(f"✗ Index on tasks.completed: {e}")

        # Composite index on (user_id, completed) for filtered user queries
        # Optimizes: SELECT * FROM tasks WHERE user_id = ? AND completed = ?
        try:
            conn.execute(text(
                "CREATE INDEX IF NOT EXISTS idx_tasks_user_completed ON task(user_id, completed)"
            ))
            print("✓ Created composite index on tasks(user_id, completed)")
        except Exception as e:
            print(f"✗ Composite index on tasks(user_id, completed): {e}")

        # Index on tasks.created_at for sorting by creation date
        # Common query: SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC
        try:
            conn.execute(text(
                "CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON task(created_at)"
            ))
            print("✓ Created index on tasks.created_at")
        except Exception as e:
            print(f"✗ Index on tasks.created_at: {e}")

        # Index on tasks.due_date for filtering by due date
        # Useful for future features like "tasks due today"
        try:
            conn.execute(text(
                "CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON task(due_date)"
            ))
            print("✓ Created index on tasks.due_date")
        except Exception as e:
            print(f"✗ Index on tasks.due_date: {e}")

        # Index on users.email for fast login lookups
        # Most common auth query: SELECT * FROM users WHERE email = ?
        try:
            conn.execute(text(
                "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON user(email)"
            ))
            print("✓ Created unique index on users.email")
        except Exception as e:
            print(f"✗ Index on users.email: {e}")

        conn.commit()
        print("\n✓ All indexes created successfully!")


def analyze_query_performance():
    """Analyze query performance with EXPLAIN"""

    with engine.connect() as conn:
        print("\n" + "="*60)
        print("Query Performance Analysis")
        print("="*60)

        # Test query 1: Get all tasks for a user
        print("\n1. Query: Get all tasks for a user")
        print("   SELECT * FROM task WHERE user_id = ?")
        try:
            result = conn.execute(text(
                "EXPLAIN QUERY PLAN SELECT * FROM task WHERE user_id = 'test-user-id'"
            ))
            for row in result:
                print(f"   {row}")
        except Exception as e:
            print(f"   Analysis not available: {e}")

        # Test query 2: Get completed tasks for a user
        print("\n2. Query: Get completed tasks for a user")
        print("   SELECT * FROM task WHERE user_id = ? AND completed = true")
        try:
            result = conn.execute(text(
                "EXPLAIN QUERY PLAN SELECT * FROM task WHERE user_id = 'test-user-id' AND completed = 1"
            ))
            for row in result:
                print(f"   {row}")
        except Exception as e:
            print(f"   Analysis not available: {e}")

        # Test query 3: Get user by email
        print("\n3. Query: Get user by email (login)")
        print("   SELECT * FROM user WHERE email = ?")
        try:
            result = conn.execute(text(
                "EXPLAIN QUERY PLAN SELECT * FROM user WHERE email = 'test@example.com'"
            ))
            for row in result:
                print(f"   {row}")
        except Exception as e:
            print(f"   Analysis not available: {e}")


def show_index_info():
    """Display information about created indexes"""

    with engine.connect() as conn:
        print("\n" + "="*60)
        print("Database Indexes")
        print("="*60)

        try:
            # SQLite specific query to show indexes
            result = conn.execute(text(
                "SELECT name, tbl_name, sql FROM sqlite_master WHERE type = 'index' AND tbl_name IN ('task', 'user')"
            ))

            for row in result:
                print(f"\nIndex: {row[0]}")
                print(f"Table: {row[1]}")
                if row[2]:
                    print(f"SQL: {row[2]}")
        except Exception as e:
            print(f"Could not retrieve index information: {e}")


if __name__ == "__main__":
    print("="*60)
    print("Database Optimization Script")
    print("="*60)
    print(f"Database: {DATABASE_URL}")
    print()

    # Create indexes
    create_indexes()

    # Show index information
    show_index_info()

    # Analyze query performance
    analyze_query_performance()

    print("\n" + "="*60)
    print("Optimization Complete!")
    print("="*60)
    print("\nRecommendations:")
    print("1. Run this script after initial database setup")
    print("2. Re-run after significant schema changes")
    print("3. Monitor query performance in production")
    print("4. Consider additional indexes based on usage patterns")
