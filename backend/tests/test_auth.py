import pytest
from fastapi.testclient import TestClient


class TestAuthEndpoints:
    """Test authentication endpoints"""

    def test_signup_success(self, client: TestClient):
        """Test successful user registration"""
        response = client.post(
            "/api/auth/signup",
            json={"email": "newuser@example.com", "password": "password123"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "token" in data["data"]
        assert data["data"]["user"]["email"] == "newuser@example.com"

    def test_signup_duplicate_email(self, client: TestClient, test_user_data):
        """Test registration with duplicate email"""
        # First registration
        client.post("/api/auth/signup", json=test_user_data)

        # Second registration with same email
        response = client.post("/api/auth/signup", json=test_user_data)
        assert response.status_code == 400

    def test_signup_invalid_email(self, client: TestClient):
        """Test registration with invalid email"""
        response = client.post(
            "/api/auth/signup",
            json={"email": "invalid-email", "password": "password123"}
        )
        # Should fail validation
        assert response.status_code in [400, 422]

    def test_login_success(self, client: TestClient, test_user_data):
        """Test successful login"""
        # Register user first
        client.post("/api/auth/signup", json=test_user_data)

        # Login
        response = client.post("/api/auth/login", json=test_user_data)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "token" in data["data"]
        assert data["data"]["user"]["email"] == test_user_data["email"]

    def test_login_wrong_password(self, client: TestClient, test_user_data):
        """Test login with wrong password"""
        # Register user first
        client.post("/api/auth/signup", json=test_user_data)

        # Login with wrong password
        response = client.post(
            "/api/auth/login",
            json={"email": test_user_data["email"], "password": "wrongpassword"}
        )
        assert response.status_code == 401

    def test_login_nonexistent_user(self, client: TestClient):
        """Test login with non-existent user"""
        response = client.post(
            "/api/auth/login",
            json={"email": "nonexistent@example.com", "password": "password123"}
        )
        assert response.status_code == 401

    def test_logout(self, client: TestClient):
        """Test logout endpoint"""
        response = client.post("/api/auth/logout")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    def test_get_current_user(self, authenticated_client):
        """Test getting current user info"""
        client, token, user = authenticated_client

        response = client.get("/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["user"]["email"] == user["email"]

    def test_get_current_user_invalid_token(self, client: TestClient):
        """Test getting current user with invalid token"""
        client.headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/api/auth/me")
        assert response.status_code == 401
