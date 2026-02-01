import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
from main import app
from db import get_session
import os

# Set test environment
os.environ["BETTER_AUTH_SECRET"] = "test_secret_key_for_testing"


@pytest.fixture(name="session")
def session_fixture():
    """Create a fresh database session for each test"""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    """Create a test client with overridden database session"""
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user_data():
    """Sample user data for testing"""
    return {
        "email": "test@example.com",
        "password": "testpassword123"
    }


@pytest.fixture
def authenticated_client(client: TestClient, test_user_data):
    """Create an authenticated test client"""
    # Register user
    response = client.post("/api/auth/signup", json=test_user_data)
    assert response.status_code == 200

    data = response.json()
    token = data["data"]["token"]

    # Return client with auth headers
    client.headers = {
        **client.headers,
        "Authorization": f"Bearer {token}"
    }
    return client, token, data["data"]["user"]
