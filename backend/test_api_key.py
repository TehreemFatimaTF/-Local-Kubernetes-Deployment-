
"""
Test Gemini API key and list available models
"""
import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key: {api_key[:20]}...")

try:
    genai.configure(api_key=api_key)
    print("\nAPI Key configured successfully")

    print("\n=== Attempting to list models ===")
    try:
        models = genai.list_models()
        print("\nAvailable models:")
        for model in models:
            print(f"  - {model.name}")
            if hasattr(model, 'supported_generation_methods'):
                print(f"    Supported methods: {model.supported_generation_methods}")
    except Exception as e:
        print(f"Error listing models: {e}")
        print("\nThis might be a network issue or API key problem")

    print("\n=== Testing with REST API approach ===")
    import requests

    # Try REST API directly
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
    response = requests.get(url)

    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("\nModels from REST API:")
        if 'models' in data:
            for model in data['models']:
                print(f"  - {model.get('name', 'unknown')}")
        else:
            print("No models found in response")
    else:
        print(f"Error: {response.text}")

except Exception as e:
    print(f"Error: {e}")
