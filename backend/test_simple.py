"""
Minimal backend test - no unicode characters
"""
import sys
sys.path.insert(0, '.')

print("=== Testing Backend Dependencies ===")

# Test 1: Basic imports
print("\n1. Testing imports...")
try:
    from fastapi import FastAPI
    print("OK: FastAPI imported")
except Exception as e:
    print(f"ERROR: FastAPI - {e}")
    sys.exit(1)

try:
    from sqlmodel import Session, select
    print("OK: SQLModel imported")
except Exception as e:
    print(f"ERROR: SQLModel - {e}")
    sys.exit(1)

try:
    import bcrypt
    print("OK: bcrypt imported")
except Exception as e:
    print(f"ERROR: bcrypt - {e}")
    sys.exit(1)

try:
    from jose import jwt
    print("OK: jose imported")
except Exception as e:
    print(f"ERROR: jose - {e}")
    sys.exit(1)

# Test 2: Database connection
print("\n2. Testing database...")
try:
    from db import engine, create_db_and_tables
    from models import User

    create_db_and_tables()
    print("OK: Database tables created")

    with Session(engine) as session:
        statement = select(User)
        users = session.exec(statement).all()
        print(f"OK: Found {len(users)} users in database")

except Exception as e:
    print(f"ERROR: Database - {e}")
    import traceback
    traceback.print_exc()

# Test 3: Bcrypt performance
print("\n3. Testing bcrypt performance...")
import time
try:
    start = time.time()
    test_password = "test123"
    hashed = bcrypt.hashpw(test_password.encode('utf-8'), bcrypt.gensalt())
    elapsed = time.time() - start
    print(f"OK: Bcrypt hash took {elapsed:.3f} seconds")

    if elapsed > 1.0:
        print("WARNING: Bcrypt is slow! This might cause auth delays.")

    # Test verification
    start = time.time()
    result = bcrypt.checkpw(test_password.encode('utf-8'), hashed)
    elapsed = time.time() - start
    print(f"OK: Bcrypt verify took {elapsed:.3f} seconds, result={result}")

except Exception as e:
    print(f"ERROR: Bcrypt test - {e}")

# Test 4: JWT creation
print("\n4. Testing JWT...")
try:
    from datetime import datetime, timedelta

    payload = {
        "id": "test-id",
        "email": "test@test.com",
        "exp": datetime.utcnow() + timedelta(days=1)
    }

    secret = "test-secret"
    token = jwt.encode(payload, secret, algorithm="HS256")
    print(f"OK: JWT created: {token[:50]}...")

    decoded = jwt.decode(token, secret, algorithms=["HS256"])
    print(f"OK: JWT decoded: {decoded['email']}")

except Exception as e:
    print(f"ERROR: JWT test - {e}")

print("\n=== All Tests Complete ===")
