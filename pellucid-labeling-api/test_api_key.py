#!/usr/bin/env python3

import os
from pathlib import Path
from dotenv import load_dotenv

# Get the directory where this script is located
script_dir = Path(__file__).parent
env_path = script_dir / '.env'

print(f"Looking for .env file at: {env_path}")
print(f".env file exists: {env_path.exists()}")

load_dotenv(env_path, override=True)

# Debug: Check if environment variables are loaded
print(f"OPENAI_API_KEY loaded: {'Yes' if os.getenv('OPENAI_API_KEY') else 'No'}")
if os.getenv('OPENAI_API_KEY'):
    print(f"OPENAI_API_KEY starts with: {os.getenv('OPENAI_API_KEY')[:10]}...")
    print(f"OPENAI_API_KEY length: {len(os.getenv('OPENAI_API_KEY'))}")
else:
    print("OPENAI_API_KEY is not loaded!")

# Test OpenAI import
try:
    from langchain_openai import ChatOpenAI
    print("langchain_openai imported successfully")
    
    if os.getenv('OPENAI_API_KEY'):
        llm = ChatOpenAI(
            openai_api_key=os.getenv('OPENAI_API_KEY'),
            model="gpt-4",
            temperature=0.7,
            max_tokens=1000
        )
        print("ChatOpenAI initialized successfully")
    else:
        print("Cannot initialize ChatOpenAI without API key")
        
except Exception as e:
    print(f"Error importing or initializing OpenAI: {e}")
