#!/usr/bin/env node
/**
 * Verification script to ensure all components are properly set up
 */

const fs = require('fs');
const path = require('path');

class SetupVerifier {
  constructor() {
    this.issues = [];
    this.warnings = [];
  }

  log(message, type = 'info') {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    console.log(`${icons[type]} ${message}`);
  }

  checkFile(filePath, description) {
    if (fs.existsSync(filePath)) {
      this.log(`${description} found`, 'success');
      return true;
    } else {
      this.log(`${description} missing: ${filePath}`, 'error');
      this.issues.push(`Missing file: ${filePath}`);
      return false;
    }
  }

  checkDirectory(dirPath, description) {
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      this.log(`${description} found`, 'success');
      return true;
    } else {
      this.log(`${description} missing: ${dirPath}`, 'error');
      this.issues.push(`Missing directory: ${dirPath}`);
      return false;
    }
  }

  checkPackageJson() {
    const packageJsonPath = path.join(__dirname, 'package.json');
    if (this.checkFile(packageJsonPath, 'Root package.json')) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const requiredScripts = ['start', 'test', 'build', 'clean'];
        const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);
        
        if (missingScripts.length === 0) {
          this.log('All required scripts present in package.json', 'success');
        } else {
          this.log(`Missing scripts: ${missingScripts.join(', ')}`, 'warning');
          this.warnings.push(`Missing scripts: ${missingScripts.join(', ')}`);
        }
      } catch (error) {
        this.log(`Error reading package.json: ${error.message}`, 'error');
        this.issues.push('Invalid package.json');
      }
    }
  }

  checkNextJsProject() {
    const nextDir = path.join(__dirname, 'pellucid-marketplace');
    if (this.checkDirectory(nextDir, 'Next.js project directory')) {
      const nextPackageJson = path.join(nextDir, 'package.json');
      const nextConfig = path.join(nextDir, 'next.config.mjs');
      const envLocal = path.join(nextDir, '.env.local');
      
      this.checkFile(nextPackageJson, 'Next.js package.json');
      this.checkFile(nextConfig, 'Next.js config');
      
      if (fs.existsSync(envLocal)) {
        this.log('Environment file (.env.local) found', 'success');
      } else {
        this.log('Environment file (.env.local) missing - you may need to create it', 'warning');
        this.warnings.push('Missing .env.local file');
      }
    }
  }

  checkPythonProject() {
    const pythonDir = path.join(__dirname, 'pellucid-labeling-api');
    if (this.checkDirectory(pythonDir, 'Python project directory')) {
      const requirements = path.join(pythonDir, 'requirements.txt');
      const mainPy = path.join(pythonDir, 'main.py');
      const privacyPy = path.join(pythonDir, 'privacy_service.py');
      const visualizationPy = path.join(pythonDir, 'visualization_service.py');
      const venvDir = path.join(pythonDir, 'venv');
      
      this.checkFile(requirements, 'Python requirements.txt');
      this.checkFile(mainPy, 'Python labeling API');
      this.checkFile(privacyPy, 'Python privacy service');
      this.checkFile(visualizationPy, 'Python visualization service');
      
      if (fs.existsSync(venvDir)) {
        this.log('Python virtual environment found', 'success');
      } else {
        this.log('Python virtual environment missing - run "npm run install:all"', 'warning');
        this.warnings.push('Missing Python virtual environment');
      }
    }
  }

  checkStartupScripts() {
    const startScript = path.join(__dirname, 'start-all.sh');
    const startBat = path.join(__dirname, 'start-all.bat');
    
    this.checkFile(startScript, 'Unix startup script');
    this.checkFile(startBat, 'Windows startup script');
    
    // Check if scripts are executable (Unix only)
    if (process.platform !== 'win32' && fs.existsSync(startScript)) {
      try {
        fs.accessSync(startScript, fs.constants.X_OK);
        this.log('Unix startup script is executable', 'success');
      } catch (error) {
        this.log('Unix startup script is not executable - run "chmod +x start-all.sh"', 'warning');
        this.warnings.push('Unix startup script not executable');
      }
    }
  }

  checkTestScripts() {
    const testScript = path.join(__dirname, 'test-data-flow.js');
    const pythonTest = path.join(__dirname, 'pellucid-labeling-api', 'test_services.py');
    
    this.checkFile(testScript, 'Data flow test script');
    this.checkFile(pythonTest, 'Python services test script');
  }

  checkDocumentation() {
    const readme = path.join(__dirname, 'README.md');
    const setupGuide = path.join(__dirname, 'SETUP_GUIDE.md');
    const quickStart = path.join(__dirname, 'QUICK_START.md');
    
    this.checkFile(readme, 'Main README');
    this.checkFile(setupGuide, 'Setup guide');
    this.checkFile(quickStart, 'Quick start guide');
  }

  checkNodeModules() {
    const nextNodeModules = path.join(__dirname, 'pellucid-marketplace', 'node_modules');
    if (fs.existsSync(nextNodeModules)) {
      this.log('Next.js node_modules found', 'success');
    } else {
      this.log('Next.js node_modules missing - run "npm install" in pellucid-marketplace', 'warning');
      this.warnings.push('Missing Next.js node_modules');
    }
  }

  checkEnvironmentVariables() {
    const envPath = path.join(__dirname, 'pellucid-marketplace', '.env.local');
    if (fs.existsSync(envPath)) {
      try {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const requiredVars = [
          'MONGODB_URI',
          'JWT_SECRET',
          'OPENAI_API_KEY',
          'PYTHON_SERVICE_URL'
        ];
        
        const missingVars = requiredVars.filter(varName => 
          !envContent.includes(`${varName}=`) || 
          envContent.includes(`${varName}=your-`) ||
          envContent.includes(`${varName}=sk-your-`)
        );
        
        if (missingVars.length === 0) {
          this.log('All required environment variables configured', 'success');
        } else {
          this.log(`Missing or placeholder environment variables: ${missingVars.join(', ')}`, 'warning');
          this.warnings.push(`Missing env vars: ${missingVars.join(', ')}`);
        }
      } catch (error) {
        this.log(`Error reading .env.local: ${error.message}`, 'error');
        this.issues.push('Error reading environment file');
      }
    }
  }

  async runVerification() {
    console.log('🔍 Verifying Pellucid AI Marketplace Setup...\n');
    
    this.checkPackageJson();
    this.checkNextJsProject();
    this.checkPythonProject();
    this.checkStartupScripts();
    this.checkTestScripts();
    this.checkDocumentation();
    this.checkNodeModules();
    this.checkEnvironmentVariables();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Verification Summary:');
    
    if (this.issues.length === 0 && this.warnings.length === 0) {
      this.log('🎉 Setup is complete and ready to use!', 'success');
      console.log('\n🚀 Next steps:');
      console.log('   1. Run "npm start" to start all services');
      console.log('   2. Visit http://localhost:3000/visualization-demo');
      console.log('   3. Run "npm run test" to verify everything works');
    } else {
      if (this.issues.length > 0) {
        console.log('\n❌ Critical Issues:');
        this.issues.forEach(issue => console.log(`   - ${issue}`));
      }
      
      if (this.warnings.length > 0) {
        console.log('\n⚠️ Warnings:');
        this.warnings.forEach(warning => console.log(`   - ${warning}`));
      }
      
      console.log('\n🔧 To fix issues:');
      console.log('   1. Run "npm run install:all" to install dependencies');
      console.log('   2. Create .env.local with required environment variables');
      console.log('   3. Run "chmod +x start-all.sh" to make script executable');
    }
    
    return this.issues.length === 0;
  }
}

// Run verification
async function main() {
  const verifier = new SetupVerifier();
  const success = await verifier.runVerification();
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Verification error:', error);
    process.exit(1);
  });
}

module.exports = SetupVerifier;
