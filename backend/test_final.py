"""
Quick test to verify gemini-2.5-flash works
"""
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

print(f"Testing model: {model_name}")
print(f"API Key: {api_key[:20]}...")

try:
    genai.configure(api_key=api_key)

    # Test with function calling (same as in agent_service.py)
    add_task_func = genai.protos.FunctionDeclaration(
        name="add_task",
        description="Add a new task to the user's todo list",
        parameters=genai.protos.Schema(
            type=genai.protos.Type.OBJECT,
            properties={
                "title": genai.protos.Schema(
                    type=genai.protos.Type.STRING,
                    description="The title/name of the task"
                )
            },
            required=["title"]
        )
    )

    tools = genai.protos.Tool(function_declarations=[add_task_func])

    model = genai.GenerativeModel(
        model_name=model_name,
        tools=[tools]
    )

    print("\nModel initialized successfully!")

    # Test a simple generation
    chat = model.start_chat(history=[])
    response = chat.send_message("Say hello")

    print(f"\nTest successful!")
    print(f"Response: {response.text}")

except Exception as e:
    print(f"\nError: {e}")
    import traceback
    traceback.print_exc()
