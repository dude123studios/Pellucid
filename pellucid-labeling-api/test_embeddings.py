#!/usr/bin/env python3
"""
Test script for the Embedding Service
"""

import requests
import json
import time

# Test data
TEST_TEXTS = [
    "John Doe called from 555-123-4567 about his email john@example.com",
    "My SSN is 123-45-6789 and my credit card is 4532-1234-5678-9012",
    "I live at 123 Main Street, New York, NY 10001",
    "The meeting is scheduled for March 15, 2024 at 2:30 PM",
    "Apple Inc. reported $100,000 in revenue, a 15% increase"
]

def test_embedding_service():
    """Test the embedding service"""
    base_url = "http://localhost:8001"
    
    print("🔍 Testing Pellucid Embedding Service")
    print("=" * 50)
    
    # Test health check
    print("\n1. Testing health check...")
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            print(f"✅ Service is healthy")
            print(f"   - spaCy loaded: {health_data.get('spacy_loaded', False)}")
            print(f"   - Status: {health_data.get('status', 'unknown')}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to service: {e}")
        print("   Make sure the service is running: python privacy_service.py")
        return False
    
    # Test single embedding generation
    print("\n2. Testing single embedding generation...")
    test_text = TEST_TEXTS[0]
    test_data_id = "test_data_001"
    print(f"   Text: {test_text}")
    print(f"   Data ID: {test_data_id}")
    
    try:
        response = requests.post(
            f"{base_url}/embed",
            json={
                "text": test_text,
                "data_id": test_data_id,
                "model": "text-embedding-3-small"
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Embedding generated successfully")
            print(f"   - Data ID: {result['data_id']}")
            print(f"   - Model: {result['model']}")
            print(f"   - Dimensions: {result['dimensions']}")
            print(f"   - Processing Time: {result['processing_time_ms']:.1f}ms")
            print(f"   - Text Length: {result['text_length']} characters")
            print(f"   - First 5 embedding values: {result['embedding'][:5]}")
        else:
            print(f"❌ Embedding generation failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False
    
    # Test batch embedding generation
    print("\n3. Testing batch embedding generation...")
    try:
        batch_requests = [
            {
                "text": text,
                "data_id": f"test_data_{i:03d}",
                "model": "text-embedding-3-small"
            }
            for i, text in enumerate(TEST_TEXTS)
        ]
        
        start_time = time.time()
        response = requests.post(
            f"{base_url}/batch-embed",
            json=batch_requests,
            timeout=60
        )
        end_time = time.time()
        
        if response.status_code == 200:
            results = response.json()['results']
            print(f"✅ Processed {len(results)} embeddings in {end_time - start_time:.2f}s")
            
            for i, result in enumerate(results):
                print(f"   Text {i+1}: {result['dimensions']} dimensions, {result['processing_time_ms']:.1f}ms")
        else:
            print(f"❌ Batch processing failed: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Batch request failed: {e}")
        return False
    
    # Test embedding models endpoint
    print("\n4. Testing embedding models endpoint...")
    try:
        response = requests.get(f"{base_url}/embed/models", timeout=5)
        
        if response.status_code == 200:
            models = response.json()
            print(f"✅ Available embedding models:")
            for model, dimensions in models['models'].items():
                print(f"   - {model}: {dimensions} dimensions")
            print(f"   - Default model: {models['default_model']}")
            print(f"   - Recommended model: {models['recommended_model']}")
        else:
            print(f"❌ Models request failed: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Models request failed: {e}")
    
    # Test service stats
    print("\n5. Testing service statistics...")
    try:
        response = requests.get(f"{base_url}/stats", timeout=5)
        
        if response.status_code == 200:
            stats = response.json()
            print(f"✅ Service Statistics:")
            print(f"   - Total Mappings: {stats['total_mappings']}")
            print(f"   - spaCy Model Loaded: {stats['spacy_model_loaded']}")
            print(f"   - Supported Entities: {len(stats['supported_entities'])}")
            print(f"   - Privacy Levels: {', '.join(stats['privacy_levels'])}")
            print(f"   - Embedding Models: {', '.join(stats['embedding_models'])}")
            print(f"   - Default Embedding Model: {stats['default_embedding_model']}")
        else:
            print(f"❌ Stats request failed: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Stats request failed: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Embedding service testing completed!")
    return True

if __name__ == "__main__":
    test_embedding_service()
