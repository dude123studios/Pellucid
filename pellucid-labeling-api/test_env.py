#!/usr/bin/env python3
"""
Test script to verify environment variables are loaded correctly
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_env_variables():
    """Test if environment variables are loaded correctly"""
    print("🔍 Testing environment variables...")
    
    # Check OpenAI API key
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        print(f"✅ OPENAI_API_KEY found: {api_key[:10]}...{api_key[-4:]}")
        return True
    else:
        print("❌ OPENAI_API_KEY not found")
        return False

if __name__ == "__main__":
    success = test_env_variables()
    if success:
        print("\n🎉 Environment variables loaded successfully!")
    else:
        print("\n⚠️  Environment variables not loaded. Make sure .env file exists with OPENAI_API_KEY")
