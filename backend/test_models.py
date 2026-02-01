
"""
Simple test to check available Gemini models
"""
import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"Using API Key: {api_key[:20]}...")

genai.configure(api_key=api_key)

print("\n=== Testing Different Model Names ===\n")

# Try different model name variations
model_names_to_try = [
    "gemini-pro",
    "models/gemini-pro",
    "gemini-1.0-pro",
    "models/gemini-1.0-pro",
    "gemini-1.5-flash",
    "models/gemini-1.5-flash",
    "gemini-1.5-pro",
    "models/gemini-1.5-pro",
]

for model_name in model_names_to_try:
    try:
        print(f"Trying: {model_name}")
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Say 'test successful'")
        print(f"  ✓ SUCCESS: {model_name} works!")
        print(f"  Response: {response.text[:50]}")
        break
    except Exception as e:
        error_msg = str(e)
        if "404" in error_msg:
            print(f"  ✗ Not found: {model_name}")
        elif "quota" in error_msg.lower() or "429" in error_msg:
            print(f"  ⚠ Quota exceeded")
            break
        else:
            print(f"  ✗ Error: {error_msg[:100]}")
