import requests
import sys

try:
    response = requests.get('http://localhost:8000')
    print(f"Server responded with status: {response.status_code}")
    print(f"Response: {response.json()}")
except requests.exceptions.ConnectionError:
    print("Connection error: Could not connect to the server")
    print("The server might not be running or not accessible on port 8000")
except Exception as e:
    print(f"An error occurred: {e}")