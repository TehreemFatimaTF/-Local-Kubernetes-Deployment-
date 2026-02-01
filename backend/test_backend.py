"""
Simple test script to check backend health
"""
import sys
sys.path.insert(0, '.')

print("Testing imports...")
try:
    from fastapi import FastAPI
    print("✓ FastAPI imported")
except Exception as e:
    print(f"✗ FastAPI error: {e}")

try:
    from sqlmodel import Session, select
    print("✓ SQLModel imported")
except Exception as e:
    print(f"✗ SQLModel error: {e}")

try:
    import bcrypt
    print("✓ bcrypt imported")
except Exception as e:
    print(f"✗ bcrypt error: {e}")

try:
    from jose import jwt
    print("✓ jose imported")
except Exception as e:
    print(f"✗ jose error: {e}")

print("\nTesting database...")
try:
    from db import engine, create_db_and_tables
    from models import User

    # Create tables
    create_db_and_tables()
    print("✓ Database tables created")

    # Test query
    with Session(engine) as session:
        users = session.exec(select(User)).all()
        print(f"✓ Database query works - {len(users)} users found")

except Exception as e:
    print(f"✗ Database error: {e}")
    import traceback
    traceback.print_exc()

print("\nAll checks complete!")
