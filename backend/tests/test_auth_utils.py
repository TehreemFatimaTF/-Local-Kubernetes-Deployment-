import pytest
from auth import verify_jwt_token, extract_user_id_from_token
from jose import jwt
from datetime import datetime, timedelta
import os


class TestAuthUtilities:
    """Test authentication utility functions"""

    def test_verify_valid_token(self):
        """Test verifying a valid JWT token"""
        secret = os.getenv("BETTER_AUTH_SECRET", "test_secret_key_for_testing")

        # Create a valid token
        payload = {
            "id": "test-user-id",
            "email": "test@example.com",
            "exp": datetime.utcnow() + timedelta(days=7)
        }
        token = jwt.encode(payload, secret, algorithm="HS256")

        # Verify token
        result = verify_jwt_token(token)
        assert result is not None
        assert result["id"] == "test-user-id"
        assert result["email"] == "test@example.com"

    def test_verify_expired_token(self):
        """Test verifying an expired JWT token"""
        secret = os.getenv("BETTER_AUTH_SECRET", "test_secret_key_for_testing")

        # Create an expired token
        payload = {
            "id": "test-user-id",
            "email": "test@example.com",
            "exp": datetime.utcnow() - timedelta(days=7)  # Expired yesterday
        }
        token = jwt.encode(payload, secret, algorithm="HS256")

        # Verify token should return None
        result = verify_jwt_token(token)
        assert result is None

    def test_verify_invalid_token(self):
        """Test verifying an invalid JWT token"""
        result = verify_jwt_token("invalid.token.here")
        assert result is None

    def test_verify_token_wrong_secret(self):
        """Test verifying a token with wrong secret"""
        # Create token with different secret
        payload = {
            "id": "test-user-id",
            "email": "test@example.com",
            "exp": datetime.utcnow() + timedelta(days=7)
        }
        token = jwt.encode(payload, "wrong_secret", algorithm="HS256")

        # Verify should fail
        result = verify_jwt_token(token)
        assert result is None

    def test_extract_user_id_from_valid_token(self):
        """Test extracting user ID from valid token"""
        secret = os.getenv("BETTER_AUTH_SECRET", "test_secret_key_for_testing")

        # Create a valid token
        payload = {
            "id": "test-user-id-123",
            "email": "test@example.com",
            "exp": datetime.utcnow() + timedelta(days=7)
        }
        token = jwt.encode(payload, secret, algorithm="HS256")

        # Extract user ID
        user_id = extract_user_id_from_token(token)
        assert user_id == "test-user-id-123"

    def test_extract_user_id_from_invalid_token(self):
        """Test extracting user ID from invalid token"""
        user_id = extract_user_id_from_token("invalid.token.here")
        assert user_id is None

    def test_extract_user_id_with_different_field_names(self):
        """Test extracting user ID with different payload field names"""
        secret = os.getenv("BETTER_AUTH_SECRET", "test_secret_key_for_testing")

        # Test with 'userId' field
        payload = {
            "userId": "user-id-from-userId",
            "exp": datetime.utcnow() + timedelta(days=7)
        }
        token = jwt.encode(payload, secret, algorithm="HS256")
        user_id = extract_user_id_from_token(token)
        assert user_id == "user-id-from-userId"

        # Test with 'sub' field
        payload = {
            "sub": "user-id-from-sub",
            "exp": datetime.utcnow() + timedelta(days=7)
        }
        token = jwt.encode(payload, secret, algorithm="HS256")
        user_id = extract_user_id_from_token(token)
        assert user_id == "user-id-from-sub"
