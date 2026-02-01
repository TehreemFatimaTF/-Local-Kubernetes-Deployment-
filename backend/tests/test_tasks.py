import pytest
from fastapi.testclient import TestClient


class TestTaskEndpoints:
    """Test task management endpoints"""

    def test_create_task_success(self, authenticated_client):
        """Test successful task creation"""
        client, token, user = authenticated_client

        task_data = {
            "title": "Test Task",
            "description": "Test Description",
            "completed": False
        }

        response = client.post("/api/tasks", json=task_data)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["task"]["title"] == task_data["title"]
        assert data["data"]["task"]["description"] == task_data["description"]
        assert data["data"]["task"]["completed"] is False

    def test_create_task_unauthorized(self, client: TestClient):
        """Test task creation without authentication"""
        task_data = {
            "title": "Test Task",
            "description": "Test Description"
        }

        response = client.post("/api/tasks", json=task_data)
        assert response.status_code == 403

    def test_get_tasks_success(self, authenticated_client):
        """Test getting all tasks for authenticated user"""
        client, token, user = authenticated_client

        # Create some tasks
        client.post("/api/tasks", json={"title": "Task 1", "description": "Desc 1"})
        client.post("/api/tasks", json={"title": "Task 2", "description": "Desc 2"})

        # Get all tasks
        response = client.get("/api/tasks")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["data"]["tasks"]) == 2

    def test_get_tasks_unauthorized(self, client: TestClient):
        """Test getting tasks without authentication"""
        response = client.get("/api/tasks")
        assert response.status_code == 403

    def test_get_task_by_id_success(self, authenticated_client):
        """Test getting a specific task by ID"""
        client, token, user = authenticated_client

        # Create a task
        create_response = client.post(
            "/api/tasks",
            json={"title": "Test Task", "description": "Test Description"}
        )
        task_id = create_response.json()["data"]["task"]["id"]

        # Get the task
        response = client.get(f"/api/tasks/{task_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["task"]["id"] == task_id

    def test_get_task_not_found(self, authenticated_client):
        """Test getting a non-existent task"""
        client, token, user = authenticated_client

        response = client.get("/api/tasks/nonexistent-id")
        assert response.status_code == 404

    def test_update_task_success(self, authenticated_client):
        """Test updating a task"""
        client, token, user = authenticated_client

        # Create a task
        create_response = client.post(
            "/api/tasks",
            json={"title": "Original Title", "description": "Original Description"}
        )
        task_id = create_response.json()["data"]["task"]["id"]

        # Update the task
        update_data = {
            "title": "Updated Title",
            "description": "Updated Description",
            "completed": True
        }
        response = client.put(f"/api/tasks/{task_id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["task"]["title"] == "Updated Title"
        assert data["data"]["task"]["completed"] is True

    def test_update_task_not_found(self, authenticated_client):
        """Test updating a non-existent task"""
        client, token, user = authenticated_client

        response = client.put(
            "/api/tasks/nonexistent-id",
            json={"title": "Updated Title"}
        )
        assert response.status_code == 404

    def test_delete_task_success(self, authenticated_client):
        """Test deleting a task"""
        client, token, user = authenticated_client

        # Create a task
        create_response = client.post(
            "/api/tasks",
            json={"title": "Task to Delete", "description": "Will be deleted"}
        )
        task_id = create_response.json()["data"]["task"]["id"]
        user_id = create_response.json()["data"]["task"]["userId"]

        # Delete the task
        response = client.delete(f"/api/{user_id}/tasks/{task_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

        # Verify task is deleted
        get_response = client.get(f"/api/tasks/{task_id}")
        assert get_response.status_code == 404

    def test_toggle_task_completion(self, authenticated_client):
        """Test toggling task completion status"""
        client, token, user = authenticated_client

        # Create a task
        create_response = client.post(
            "/api/tasks",
            json={"title": "Task to Toggle", "completed": False}
        )
        task_id = create_response.json()["data"]["task"]["id"]
        user_id = create_response.json()["data"]["task"]["userId"]

        # Toggle completion
        response = client.patch(f"/api/{user_id}/tasks/{task_id}/complete")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["task"]["completed"] is True

        # Toggle again
        response = client.patch(f"/api/{user_id}/tasks/{task_id}/complete")
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["task"]["completed"] is False

    def test_user_cannot_access_other_users_tasks(self, client: TestClient, test_user_data):
        """Test that users cannot access other users' tasks"""
        # Create first user and task
        response1 = client.post("/api/auth/signup", json=test_user_data)
        token1 = response1.json()["data"]["token"]
        client.headers = {"Authorization": f"Bearer {token1}"}

        create_response = client.post(
            "/api/tasks",
            json={"title": "User 1 Task"}
        )
        task_id = create_response.json()["data"]["task"]["id"]

        # Create second user
        response2 = client.post(
            "/api/auth/signup",
            json={"email": "user2@example.com", "password": "password123"}
        )
        token2 = response2.json()["data"]["token"]
        client.headers = {"Authorization": f"Bearer {token2}"}

        # Try to access first user's task
        response = client.get(f"/api/tasks/{task_id}")
        assert response.status_code == 404
