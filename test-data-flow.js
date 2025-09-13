#!/usr/bin/env node
/**
 * Comprehensive test script for the Pellucid data processing flow
 * Tests: Authentication -> Data Creation -> Privacy Sanitization -> Embedding -> Submission -> Visualization
 */

const fetch = require('node-fetch');

// Configuration
const BASE_URL = 'http://localhost:3000';
const PYTHON_SERVICES = {
  labeling: 'http://localhost:8000',
  privacy: 'http://localhost:8001', 
  visualization: 'http://localhost:8002'
};

// Test data
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123',
  confirmPassword: 'testpassword123'
};

const TEST_DATA = [
  {
    payload: "My email is john.doe@example.com and my phone is (555) 123-4567. This AI response contains harmful content and shows poor reasoning.",
    label: "Harmful AI Response",
    category: "Harmful Content"
  },
  {
    payload: "The capital of France is London. This is clearly wrong information that the AI provided.",
    label: "Factual Error",
    category: "Hallucination"
  },
  {
    payload: "Here are some generic ideas: 1. Make it better 2. Improve quality 3. Add features. This response lacks creativity.",
    label: "Uncreative Response", 
    category: "Creativity Weakness"
  }
];

class DataFlowTester {
  constructor() {
    this.authToken = null;
    this.dataIds = [];
    this.submissionId = null;
  }

  async log(message, status = 'INFO') {
    const timestamp = new Date().toISOString();
    const statusIcon = {
      'INFO': 'ℹ️',
      'SUCCESS': '✅',
      'ERROR': '❌',
      'WARNING': '⚠️'
    }[status] || 'ℹ️';
    
    console.log(`${statusIcon} [${timestamp}] ${message}`);
  }

  async testServiceHealth() {
    this.log('Testing service health...');
    
    const services = [
      { name: 'Next.js Frontend', url: BASE_URL },
      { name: 'Python Labeling API', url: PYTHON_SERVICES.labeling },
      { name: 'Python Privacy Service', url: PYTHON_SERVICES.privacy },
      { name: 'Python Visualization Service', url: PYTHON_SERVICES.visualization }
    ];

    for (const service of services) {
      try {
        const response = await fetch(`${service.url}/health`, { timeout: 5000 });
        if (response.ok) {
          this.log(`${service.name} is healthy`, 'SUCCESS');
        } else {
          this.log(`${service.name} returned status ${response.status}`, 'ERROR');
          return false;
        }
      } catch (error) {
        this.log(`${service.name} is not responding: ${error.message}`, 'ERROR');
        return false;
      }
    }
    
    return true;
  }

  async testAuthentication() {
    this.log('Testing authentication flow...');
    
    try {
      // Test signup
      const signupResponse = await fetch(`${BASE_URL}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signup',
          ...TEST_USER
        })
      });

      if (signupResponse.ok) {
        const signupData = await signupResponse.json();
        this.authToken = signupData.token;
        this.log('User signup successful', 'SUCCESS');
      } else {
        // Try login if signup fails (user might already exist)
        const loginResponse = await fetch(`${BASE_URL}/api/auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'login',
            email: TEST_USER.email,
            password: TEST_USER.password
          })
        });

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          this.authToken = loginData.token;
          this.log('User login successful', 'SUCCESS');
        } else {
          this.log('Authentication failed', 'ERROR');
          return false;
        }
      }

      return true;
    } catch (error) {
      this.log(`Authentication error: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async testDataCreation() {
    this.log('Testing data creation with privacy sanitization and embedding...');
    
    for (const data of TEST_DATA) {
      try {
        const response = await fetch(`${BASE_URL}/api/data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authToken}`
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          const result = await response.json();
          this.dataIds.push(result.dataId);
          this.log(`Data created: ${data.label} (ID: ${result.dataId})`, 'SUCCESS');
          this.log(`  - Sanitized: ${result.sanitized}`, 'INFO');
          this.log(`  - Embedding generated: ${result.embeddingGenerated}`, 'INFO');
          this.log(`  - Privacy score: ${result.privacyScore}`, 'INFO');
        } else {
          const error = await response.json();
          this.log(`Data creation failed: ${error.error}`, 'ERROR');
          return false;
        }
      } catch (error) {
        this.log(`Data creation error: ${error.message}`, 'ERROR');
        return false;
      }
    }

    return true;
  }

  async testSubmission() {
    this.log('Testing data submission...');
    
    try {
      const response = await fetch(`${BASE_URL}/api/contribute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({
          dataIds: this.dataIds
        })
      });

      if (response.ok) {
        const result = await response.json();
        this.submissionId = result.submissionId;
        this.log(`Submission created: ${this.submissionId}`, 'SUCCESS');
        this.log(`  - Status: ${result.status}`, 'INFO');
        this.log(`  - Data count: ${result.dataCount}`, 'INFO');
        this.log(`  - Privacy score: ${result.privacyScore}`, 'INFO');
        
        // Wait for background analysis
        this.log('Waiting for background analysis...', 'INFO');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        return true;
      } else {
        const error = await response.json();
        this.log(`Submission failed: ${error.error}`, 'ERROR');
        return false;
      }
    } catch (error) {
      this.log(`Submission error: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async testResults() {
    this.log('Testing submission results...');
    
    try {
      const response = await fetch(`${BASE_URL}/api/results/${this.submissionId}`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        this.log('Results retrieved successfully', 'SUCCESS');
        this.log(`  - Categories: ${result.categories.join(', ')}`, 'INFO');
        this.log(`  - Critiques: ${result.critiques.length}`, 'INFO');
        this.log(`  - Status: ${result.status}`, 'INFO');
        return true;
      } else {
        this.log('Failed to retrieve results', 'ERROR');
        return false;
      }
    } catch (error) {
      this.log(`Results error: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async testVisualization() {
    this.log('Testing visualization generation...');
    
    try {
      const response = await fetch(`${BASE_URL}/api/visualize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({
          dataIds: this.dataIds,
          visualizationType: 'submission'
        })
      });

      if (response.ok) {
        const result = await response.json();
        this.log('Visualization generated successfully', 'SUCCESS');
        this.log(`  - Points: ${result.points.length}`, 'INFO');
        this.log(`  - Clusters: ${result.clusters.length}`, 'INFO');
        this.log(`  - Processing time: ${result.processing_time_ms}ms`, 'INFO');
        return true;
      } else {
        this.log('Visualization generation failed', 'ERROR');
        return false;
      }
    } catch (error) {
      this.log(`Visualization error: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async testPythonServices() {
    this.log('Testing Python services directly...');
    
    // Test privacy service
    try {
      const privacyResponse = await fetch(`${PYTHON_SERVICES.privacy}/anonymize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: "My email is test@example.com",
          privacy_level: "standard"
        })
      });
      
      if (privacyResponse.ok) {
        this.log('Privacy service working', 'SUCCESS');
      } else {
        this.log('Privacy service failed', 'ERROR');
        return false;
      }
    } catch (error) {
      this.log(`Privacy service error: ${error.message}`, 'ERROR');
      return false;
    }

    // Test embedding service
    try {
      const embeddingResponse = await fetch(`${PYTHON_SERVICES.privacy}/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: "Test embedding generation",
          data_id: "test_123"
        })
      });
      
      if (embeddingResponse.ok) {
        this.log('Embedding service working', 'SUCCESS');
      } else {
        this.log('Embedding service failed', 'ERROR');
        return false;
      }
    } catch (error) {
      this.log(`Embedding service error: ${error.message}`, 'ERROR');
      return false;
    }

    return true;
  }

  async runAllTests() {
    this.log('🚀 Starting comprehensive data flow test...');
    this.log('=' * 60);
    
    const tests = [
      { name: 'Service Health', fn: () => this.testServiceHealth() },
      { name: 'Authentication', fn: () => this.testAuthentication() },
      { name: 'Data Creation', fn: () => this.testDataCreation() },
      { name: 'Submission', fn: () => this.testSubmission() },
      { name: 'Results', fn: () => this.testResults() },
      { name: 'Visualization', fn: () => this.testVisualization() },
      { name: 'Python Services', fn: () => this.testPythonServices() }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      this.log(`\n📋 Running ${test.name} test...`);
      try {
        const result = await test.fn();
        if (result) {
          passed++;
          this.log(`${test.name} test passed`, 'SUCCESS');
        } else {
          failed++;
          this.log(`${test.name} test failed`, 'ERROR');
        }
      } catch (error) {
        failed++;
        this.log(`${test.name} test error: ${error.message}`, 'ERROR');
      }
    }

    this.log('\n' + '=' * 60);
    this.log(`📊 Test Summary: ${passed} passed, ${failed} failed`);
    
    if (failed === 0) {
      this.log('🎉 All tests passed! Data processing flow is working correctly.', 'SUCCESS');
    } else {
      this.log('⚠️ Some tests failed. Check the logs above for details.', 'WARNING');
    }

    return failed === 0;
  }
}

// Run the tests
async function main() {
  const tester = new DataFlowTester();
  const success = await tester.runAllTests();
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test runner error:', error);
    process.exit(1);
  });
}

module.exports = DataFlowTester;
