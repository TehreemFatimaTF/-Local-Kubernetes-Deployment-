"""
Test script to list available Gemini models
"""
import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("ERROR: GEMINI_API_KEY not found in .env file")
    exit(1)

print(f"Using API Key: {api_key[:20]}...")
genai.configure(api_key=api_key)

print("\n=== Available Gemini Models ===\n")

try:
    # List all available models
    models = genai.list_models()

    generate_content_models = []

    for model in models:
        print(f"Model: {model.name}")
        print(f"  Display Name: {model.display_name}")
        print(f"  Description: {model.description}")
        print(f"  Supported Methods: {model.supported_generation_methods}")
        print()

        # Check if it supports generateContent
        if 'generateContent' in model.supported_generation_methods:
            generate_content_models.append(model.name)

    print("\n=== Models that support generateContent ===")
    for model_name in generate_content_models:
        print(f"  - {model_name}")

    if generate_content_models:
        print(f"\n✓ Found {len(generate_content_models)} models that support chat")
        print(f"\nRecommended model to use: {generate_content_models[0]}")
    else:
        print("\n✗ No models found that support generateContent")

except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
