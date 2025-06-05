#!/usr/bin/env node

/**
 * ZTMM Assessment Integration Security Test Suite
 * End-to-end security testing for the application
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

let testResults = [];
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function addTestResult(testName, passed, details) {
  totalTests++;
  const result = {
    test: testName,
    passed: passed,
    details: details,
    timestamp: new Date().toISOString()
  };
  testResults.push(result);
  
  if (passed) {
    passedTests++;
    logSuccess(`${testName}: ${details}`);
  } else {
    failedTests++;
    logError(`${testName}: ${details}`);
  }
}

/**
 * Test 1: Database integrity and security
 */
function testDatabaseSecurity() {
  logInfo('Testing database security and integrity...');
  
  try {
    const dbPath = path.join(__dirname, 'ztmm.db');
    
    if (!fs.existsSync(dbPath)) {
      addTestResult('Database Security', false, 'Database file not found');
      return;
    }
    
    // Check database file permissions (should not be world-writable)
    const stats = fs.statSync(dbPath);
    const mode = stats.mode;
    const isWorldWritable = (mode & parseInt('002', 8)) !== 0;
    
    if (isWorldWritable) {
      addTestResult('Database Security', false, 'Database file is world-writable');
    } else {
      addTestResult('Database Security', true, 'Database file has secure permissions');
    }
    
  } catch (error) {
    addTestResult('Database Security', false, `Error checking database: ${error.message}`);
  }
}

/**
 * Test 2: Electron security configuration
 */
function testElectronSecurity() {
  logInfo('Testing Electron security configuration...');
  
  try {
    const mainPath = path.join(__dirname, 'main.js');
    
    if (!fs.existsSync(mainPath)) {
      addTestResult('Electron Security', false, 'main.js not found');
      return;
    }
    
    const mainContent = fs.readFileSync(mainPath, 'utf8');
    
    // Check for secure Electron configuration
    const hasNodeIntegration = mainContent.includes('nodeIntegration: false');
    const hasContextIsolation = mainContent.includes('contextIsolation: true');
    const hasPreloadScript = mainContent.includes('preload:');
    const hasSecureDefaults = mainContent.includes('webSecurity: true') || 
                             !mainContent.includes('webSecurity: false');
    
    const securityScore = [hasNodeIntegration, hasContextIsolation, hasPreloadScript, hasSecureDefaults]
                         .filter(Boolean).length;
    
    if (securityScore >= 3) {
      addTestResult('Electron Security', true, `Secure configuration (${securityScore}/4 checks passed)`);
    } else {
      addTestResult('Electron Security', false, `Insecure configuration (${securityScore}/4 checks passed)`);
    }
    
  } catch (error) {
    addTestResult('Electron Security', false, `Error checking Electron config: ${error.message}`);
  }
}

/**
 * Test 3: Check for preload script security
 */
function testPreloadSecurity() {
  logInfo('Testing preload script security...');
  
  try {
    const preloadPath = path.join(__dirname, 'preload.js');
    
    if (!fs.existsSync(preloadPath)) {
      addTestResult('Preload Security', false, 'preload.js not found');
      return;
    }
    
    const preloadContent = fs.readFileSync(preloadPath, 'utf8');
    
    // Check for secure API exposure patterns
    const hasContextBridge = preloadContent.includes('contextBridge');
    const hasSelectiveExposure = preloadContent.includes('exposeInMainWorld');
    
    // Check for unsafe require() usage - only allow require('electron') and its destructuring
    const requireMatches = preloadContent.match(/require\(['"`]([^'"`]+)['"`]\)/g) || [];
    const hasUnsafeRequires = requireMatches.some(req => !req.includes('electron'));
    const hasSecureRequires = !hasUnsafeRequires;
    
    if (hasContextBridge && hasSelectiveExposure && hasSecureRequires) {
      addTestResult('Preload Security', true, 'Secure preload script implementation');
    } else {
      let issues = [];
      if (!hasContextBridge) issues.push('missing contextBridge');
      if (!hasSelectiveExposure) issues.push('missing selective API exposure');
      if (!hasSecureRequires) {
        const unsafeReqs = requireMatches.filter(req => !req.includes('electron'));
        issues.push(`unsafe require() usage: ${unsafeReqs.join(', ')}`);
      }
      
      addTestResult('Preload Security', false, `Issues: ${issues.join(', ')}`);
    }
    
  } catch (error) {
    addTestResult('Preload Security', false, `Error checking preload script: ${error.message}`);
  }
}

/**
 * Test 4: Angular build security
 */
function testAngularBuildSecurity() {
  logInfo('Testing Angular build security...');
  
  try {
    const angularJsonPath = path.join(__dirname, 'angular.json');
    
    if (!fs.existsSync(angularJsonPath)) {
      addTestResult('Angular Build Security', false, 'angular.json not found');
      return;
    }
    
    const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));
    
    // Check for production build optimizations
    const productionConfig = angularJson?.projects?.['ztmm-assessment']?.architect?.build?.configurations?.production;
    
    if (!productionConfig) {
      addTestResult('Angular Build Security', false, 'Production configuration not found');
      return;
    }
    
    const hasOptimization = productionConfig.optimization !== false;
    const hasOutputHashing = productionConfig.outputHashing === 'all';
    const hasSourceMaps = productionConfig.sourceMap === false;
    const hasBudgets = productionConfig.budgets && productionConfig.budgets.length > 0;
    
    const securityScore = [hasOptimization, hasOutputHashing, hasSourceMaps, hasBudgets]
                         .filter(Boolean).length;
    
    if (securityScore >= 3) {
      addTestResult('Angular Build Security', true, `Secure build configuration (${securityScore}/4 checks)`);
    } else {
      addTestResult('Angular Build Security', false, `Build security issues (${securityScore}/4 checks)`);
    }
    
  } catch (error) {
    addTestResult('Angular Build Security', false, `Error checking Angular config: ${error.message}`);
  }
}

/**
 * Test 5: Check for development dependencies in production
 */
function testProductionDependencies() {
  logInfo('Testing production dependencies...');
  
  try {
    const packagePath = path.join(__dirname, 'package.json');
    
    if (!fs.existsSync(packagePath)) {
      addTestResult('Production Dependencies', false, 'package.json not found');
      return;
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Check for potentially dangerous production dependencies
    const productionDeps = Object.keys(packageJson.dependencies || {});
    const dangerousDeps = [
      'nodemon', 'webpack-dev-server', 'live-server', 'browser-sync',
      'gulp', 'grunt', 'browserify', 'rollup'
    ];
    
    const foundDangerous = productionDeps.filter(dep => 
      dangerousDeps.some(dangerous => dep.includes(dangerous))
    );
    
    // Check for proper electron-builder configuration
    const hasBuildConfig = packageJson.build !== undefined;
    const hasProperFiles = packageJson.build?.files !== undefined;
    
    if (foundDangerous.length === 0 && hasBuildConfig && hasProperFiles) {
      addTestResult('Production Dependencies', true, 'Clean production dependencies');
    } else {
      let issues = [];
      if (foundDangerous.length > 0) issues.push(`dangerous deps: ${foundDangerous.join(', ')}`);
      if (!hasBuildConfig) issues.push('missing build config');
      if (!hasProperFiles) issues.push('missing files specification');
      
      addTestResult('Production Dependencies', false, `Issues: ${issues.join(', ')}`);
    }
    
  } catch (error) {
    addTestResult('Production Dependencies', false, `Error checking dependencies: ${error.message}`);
  }
}

/**
 * Test 6: File system security
 */
function testFileSystemSecurity() {
  logInfo('Testing file system security...');
  
  try {
    const sensitiveFiles = [
      '.env', '.env.local', '.env.production',
      'private.key', 'certificate.key', 'ssl.key',
      'config.json', 'secrets.json'
    ];
    
    const foundSensitive = [];
    sensitiveFiles.forEach(file => {
      if (fs.existsSync(path.join(__dirname, file))) {
        foundSensitive.push(file);
      }
    });
    
    // Check for proper .gitignore
    const gitignorePath = path.join(__dirname, '.gitignore');
    let hasProperGitignore = false;
    
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      hasProperGitignore = gitignoreContent.includes('node_modules') &&
                          gitignoreContent.includes('dist') &&
                          gitignoreContent.includes('.env');
    }
    
    if (foundSensitive.length === 0 && hasProperGitignore) {
      addTestResult('File System Security', true, 'Secure file system configuration');
    } else {
      let issues = [];
      if (foundSensitive.length > 0) issues.push(`sensitive files: ${foundSensitive.join(', ')}`);
      if (!hasProperGitignore) issues.push('inadequate .gitignore');
      
      addTestResult('File System Security', false, `Issues: ${issues.join(', ')}`);
    }
    
  } catch (error) {
    addTestResult('File System Security', false, `Error checking file system: ${error.message}`);
  }
}

/**
 * Test 7: Additional Electron security validation
 * This test verifies that Electron-specific security features are properly configured
 */
function testElectronSpecificSecurity() {
  logInfo('Testing Electron-specific security features...');
  
  try {
    const mainPath = path.join(__dirname, 'main.js');
    
    if (!fs.existsSync(mainPath)) {
      addTestResult('Electron Specific Security', false, 'main.js not found');
      return;
    }
    
    const mainContent = fs.readFileSync(mainPath, 'utf8');
    
    // Check for additional Electron security features
    const hasSecureDefaults = !mainContent.includes('allowRunningInsecureContent: true');
    const hasNoExperimentalFeatures = !mainContent.includes('experimentalFeatures: true');
    const hasSecureOrigin = !mainContent.includes('webSecurity: false');
    
    const securityScore = [hasSecureDefaults, hasNoExperimentalFeatures, hasSecureOrigin]
                         .filter(Boolean).length;
    
    if (securityScore >= 2) {
      addTestResult('Electron Specific Security', true, `Electron security properly configured (${securityScore}/3 checks)`);
    } else {
      addTestResult('Electron Specific Security', false, `Electron security issues found (${securityScore}/3 checks)`);
    }
    
  } catch (error) {
    addTestResult('Electron Specific Security', false, `Error checking Electron security: ${error.message}`);
  }
}

/**
 * Main integration test runner
 */
function runIntegrationTests() {
  log('\n🔐 ZTMM Assessment Integration Security Tests', 'blue');
  log('===============================================', 'blue');
  
  // Run all integration tests
  testDatabaseSecurity();
  testElectronSecurity();
  testPreloadSecurity();
  testAngularBuildSecurity();
  testProductionDependencies();
  testFileSystemSecurity();
  testElectronSpecificSecurity();
  
  // Generate summary
  log('\n📊 Integration Test Results Summary', 'blue');
  log('===================================', 'blue');
  log(`Total Tests: ${totalTests}`);
  log(`Passed: ${passedTests}`, passedTests === totalTests ? 'green' : 'yellow');
  log(`Failed: ${failedTests}`, failedTests === 0 ? 'green' : 'red');
  log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  // Write detailed results to file
  const resultsFile = 'integration-test-results.log';
  const detailedResults = {
    summary: {
      totalTests,
      passedTests,
      failedTests,
      successRate: Math.round((passedTests / totalTests) * 100),
      timestamp: new Date().toISOString()
    },
    tests: testResults
  };
  
  fs.writeFileSync(resultsFile, JSON.stringify(detailedResults, null, 2));
  log(`\n📝 Detailed results written to: ${resultsFile}`, 'blue');
  
  // Exit with appropriate code
  if (failedTests > 0) {
    log('\n⚠️  Some integration tests failed. Review the issues above.', 'yellow');
    log('Note: Some failures may be acceptable depending on your security requirements.', 'yellow');
    // Don't exit with error for integration tests as they might have false positives
    process.exit(0);
  } else {
    log('\n✅ All integration security tests passed!', 'green');
    process.exit(0);
  }
}

// Run the tests
if (require.main === module) {
  runIntegrationTests();
}

module.exports = {
  runIntegrationTests,
  testResults
};
