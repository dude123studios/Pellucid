#!/usr/bin/env python3
"""
Test script to verify all Python services are working correctly
"""

import requests
import json
import time
import sys

# Service URLs
LABELING_URL = "http://localhost:8000"
PRIVACY_URL = "http://localhost:8001"
VISUALIZATION_URL = "http://localhost:8002"

def test_service_health(url, service_name):
    """Test if a service is running and healthy"""
    try:
        response = requests.get(f"{url}/health", timeout=5)
        if response.status_code == 200:
            print(f"✅ {service_name} is healthy")
            return True
        else:
            print(f"❌ {service_name} returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ {service_name} is not responding: {e}")
        return False

def test_privacy_service():
    """Test the privacy service with sample data"""
    print("\n🔒 Testing Privacy Service...")
    
    test_data = {
        "text": "My email is john.doe@example.com and my phone is (555) 123-4567. I live at 123 Main St, New York.",
        "privacy_level": "standard",
        "preserve_format": True
    }
    
    try:
        response = requests.post(f"{PRIVACY_URL}/anonymize", json=test_data, timeout=10)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Privacy service working - Privacy score: {result.get('privacy_score', 'N/A')}")
            print(f"   Sanitized text: {result.get('sanitized_text', 'N/A')[:100]}...")
            return True
        else:
            print(f"❌ Privacy service failed with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Privacy service error: {e}")
        return False

def test_embedding_service():
    """Test the embedding service"""
    print("\n🧠 Testing Embedding Service...")
    
    test_data = {
        "text": "This is a test sentence for embedding generation.",
        "data_id": "test_123",
        "model": "text-embedding-3-small"
    }
    
    try:
        response = requests.post(f"{PRIVACY_URL}/embed", json=test_data, timeout=15)
        if response.status_code == 200:
            result = response.json()
            embedding_length = len(result.get('embedding', []))
            print(f"✅ Embedding service working - Generated {embedding_length}D embedding")
            return True
        else:
            print(f"❌ Embedding service failed with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Embedding service error: {e}")
        return False

def test_labeling_service():
    """Test the labeling service"""
    print("\n🏷️ Testing Labeling Service...")
    
    test_data = {
        "text": "This AI response contains harmful content and shows poor reasoning.",
        "data_id": "test_123"
    }
    
    try:
        response = requests.post(f"{LABELING_URL}/label", json=test_data, timeout=10)
        if response.status_code == 200:
            result = response.json()
            label = result.get('label', 'Unknown')
            confidence = result.get('confidence', 0)
            print(f"✅ Labeling service working - Label: {label}, Confidence: {confidence}")
            return True
        else:
            print(f"❌ Labeling service failed with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Labeling service error: {e}")
        return False

def test_visualization_service():
    """Test the visualization service"""
    print("\n📊 Testing Visualization Service...")
    
    # Create sample data points
    sample_data = {
        "data_points": [
            {
                "id": "1",
                "payload": "Sample text 1",
                "category": "Hallucination",
                "label": "Test 1",
                "embedding": [0.1, 0.2, 0.3] * 512  # 1536 dimensions
            },
            {
                "id": "2", 
                "payload": "Sample text 2",
                "category": "Creativity Weakness",
                "label": "Test 2",
                "embedding": [0.4, 0.5, 0.6] * 512  # 1536 dimensions
            }
        ],
        "id": "test_submission"
    }
    
    try:
        response = requests.post(f"{VISUALIZATION_URL}/visualize-submission", json=sample_data, timeout=15)
        if response.status_code == 200:
            result = response.json()
            points_count = len(result.get('points', []))
            clusters_count = len(result.get('clusters', []))
            print(f"✅ Visualization service working - {points_count} points, {clusters_count} clusters")
            return True
        else:
            print(f"❌ Visualization service failed with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Visualization service error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Testing Pellucid Python Services")
    print("=" * 50)
    
    # Test service health
    print("\n📡 Checking Service Health...")
    labeling_healthy = test_service_health(LABELING_URL, "Labeling API")
    privacy_healthy = test_service_health(PRIVACY_URL, "Privacy Service")
    visualization_healthy = test_service_health(VISUALIZATION_URL, "Visualization Service")
    
    if not all([labeling_healthy, privacy_healthy, visualization_healthy]):
        print("\n❌ Some services are not healthy. Please check the logs.")
        sys.exit(1)
    
    # Test individual services
    privacy_working = test_privacy_service()
    embedding_working = test_embedding_service()
    labeling_working = test_labeling_service()
    visualization_working = test_visualization_service()
    
    # Summary
    print("\n" + "=" * 50)
    print("📋 Test Summary:")
    print(f"   Privacy Service: {'✅' if privacy_working else '❌'}")
    print(f"   Embedding Service: {'✅' if embedding_working else '❌'}")
    print(f"   Labeling Service: {'✅' if labeling_working else '❌'}")
    print(f"   Visualization Service: {'✅' if visualization_working else '❌'}")
    
    all_working = all([privacy_working, embedding_working, labeling_working, visualization_working])
    
    if all_working:
        print("\n🎉 All services are working correctly!")
        sys.exit(0)
    else:
        print("\n⚠️ Some services are not working. Check the logs above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
