#!/usr/bin/env python3
"""
Test script for the Privacy Preservation Service
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

def test_privacy_service():
    """Test the privacy preservation service"""
    base_url = "http://localhost:8001"
    
    print("🔒 Testing Pellucid Privacy Preservation Service")
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
    
    # Test single text anonymization
    print("\n2. Testing single text anonymization...")
    test_text = TEST_TEXTS[0]
    print(f"   Original: {test_text}")
    
    try:
        response = requests.post(
            f"{base_url}/anonymize",
            json={
                "text": test_text,
                "privacy_level": "standard",
                "preserve_format": True
            },
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"   Sanitized: {result['sanitized_text']}")
            print(f"   Privacy Score: {result['privacy_score']:.2f}")
            print(f"   Processing Time: {result['processing_time_ms']:.1f}ms")
            print(f"   Entities Found: {len(result['entities_found'])}")
            
            for entity in result['entities_found']:
                print(f"     - {entity['entity_type']}: '{entity['original']}' → '{entity['replacement']}'")
        else:
            print(f"❌ Anonymization failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False
    
    # Test batch anonymization
    print("\n3. Testing batch anonymization...")
    try:
        batch_requests = [
            {"text": text, "privacy_level": "standard", "preserve_format": True}
            for text in TEST_TEXTS
        ]
        
        start_time = time.time()
        response = requests.post(
            f"{base_url}/batch-anonymize",
            json=batch_requests,
            timeout=30
        )
        end_time = time.time()
        
        if response.status_code == 200:
            results = response.json()['results']
            print(f"✅ Processed {len(results)} texts in {end_time - start_time:.2f}s")
            
            for i, result in enumerate(results):
                if 'error' not in result:
                    print(f"   Text {i+1}: {result['privacy_score']:.2f} privacy score")
                else:
                    print(f"   Text {i+1}: Error - {result['error']}")
        else:
            print(f"❌ Batch processing failed: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Batch request failed: {e}")
        return False
    
    # Test entity detection
    print("\n4. Testing entity detection...")
    try:
        response = requests.get(
            f"{base_url}/entities/detected",
            params={
                "text": "John Doe's email is john@example.com and phone is 555-123-4567",
                "privacy_level": "standard"
            },
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Detected {result['count']} entities:")
            for entity in result['entities']:
                print(f"   - {entity['entity_type']}: '{entity['text']}' (confidence: {entity['confidence']:.2f})")
        else:
            print(f"❌ Entity detection failed: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Entity detection request failed: {e}")
    
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
        else:
            print(f"❌ Stats request failed: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Stats request failed: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Privacy service testing completed!")
    return True

if __name__ == "__main__":
    test_privacy_service()
