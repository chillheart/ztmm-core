#!/usr/bin/env node

/**
 * ZTMM Assessment Security Test Suite
 * Tests for SQL injection prevention and input validation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

const testResults = [];
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
 * Test 1: Check for SQL injection prevention in Angular services
 */
function testSQLInjectionPrevention() {
  logInfo('Testing SQL injection prevention in Angular services...');

  try {
    // Check SQL.js service for proper parameterized queries
    const sqlServicePath = path.join(__dirname, 'src/app/services/sqljs.service.ts');

    if (!fs.existsSync(sqlServicePath)) {
      addTestResult('SQL Injection Prevention', false, 'sqljs.service.ts not found');
      return;
    }

    const serviceContent = fs.readFileSync(sqlServicePath, 'utf8');

    // Check for prepared statements and parameterized queries
    const usesPreparedStatements = serviceContent.includes('.prepare(') ||
                                  serviceContent.includes('db.prepare(');

    const usesParameterBinding = serviceContent.includes('stmt.run(') ||
                                serviceContent.includes('stmt.get(') ||
                                serviceContent.includes('stmt.all(');

    // Check for input validation patterns
    const hasInputValidation = serviceContent.includes('validateInput') ||
                              serviceContent.includes('validate') ||
                              serviceContent.includes('trim()') ||
                              serviceContent.includes('sanitize');

    // Check for dangerous string concatenation in SQL
    const sqlConcatenationPatterns = [
      /['"`]\s*\+\s*.*\s*\+\s*['"`]/,
      /\$\{.*\}.*SELECT/i,
      /SELECT.*\$\{.*\}/i
    ];

    const hasDangerousSQL = sqlConcatenationPatterns.some(pattern => pattern.test(serviceContent));

    if ((usesPreparedStatements || usesParameterBinding) && !hasDangerousSQL) {
      addTestResult('SQL Injection Prevention', true, 'SQL.js service uses safe database operations');
    } else {
      const issues = [];
      if (!usesPreparedStatements && !usesParameterBinding) {issues.push('no parameterized queries found');}
      if (hasDangerousSQL) {issues.push('dangerous SQL string concatenation found');}
      if (!hasInputValidation) {issues.push('limited input validation patterns found');}

      addTestResult('SQL Injection Prevention', false, `Issues: ${issues.join(', ')}`);
    }

  } catch (error) {
    addTestResult('SQL Injection Prevention', false, `Error reading service file: ${error.message}`);
  }
}

/**
 * Test 2: Check Angular services for secure data operations
 */
function testSecureDatabaseOperations() {
  logInfo('Testing secure data operations in Angular services...');

  try {
    const servicePaths = [
      'src/app/services/sqljs.service.ts',
      'src/app/services/ztmm-data-web.service.ts'
    ];

    let hasSecureOperations = true;
    const issues = [];

    servicePaths.forEach(servicePath => {
      const fullPath = path.join(__dirname, servicePath);

      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');

        // Check for proper error handling
        const hasErrorHandling = content.includes('try {') ||
                                content.includes('catch') ||
                                content.includes('.catch(') ||
                                content.includes('throwError');

        // Check for input sanitization
        const hasInputSanitization = content.includes('trim()') ||
                                    content.includes('validate') ||
                                    content.includes('sanitize') ||
                                    content.includes('filter(');

        // Check for dangerous eval or dynamic code execution
        const hasDangerousCode = content.includes('eval(') ||
                               content.includes('Function(') ||
                               content.includes('new Function');

        if (!hasErrorHandling) {
          issues.push(`${servicePath}: missing error handling`);
          hasSecureOperations = false;
        }

        if (!hasInputSanitization) {
          issues.push(`${servicePath}: limited input sanitization patterns found`);
        }

        if (hasDangerousCode) {
          issues.push(`${servicePath}: dangerous code execution found`);
          hasSecureOperations = false;
        }
      }
    });

    if (hasSecureOperations) {
      addTestResult('Secure Database Operations', true, 'Angular services implement secure data operations');
    } else {
      addTestResult('Secure Database Operations', false, `Issues: ${issues.join(', ')}`);
    }

  } catch (error) {
    addTestResult('Secure Database Operations', false, `Error checking service files: ${error.message}`);
  }
}

/**
 * Test 3: Check for XSS prevention in Angular components
 */
function testXSSPrevention() {
  logInfo('Testing XSS prevention in Angular components...');

  try {
    const srcPath = path.join(__dirname, 'src');

    if (!fs.existsSync(srcPath)) {
      addTestResult('XSS Prevention', false, 'src directory not found');
      return;
    }

    // Check Angular components for proper template usage
    const componentFiles = [];
    function findComponents(dir) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          findComponents(filePath);
        } else if (file.endsWith('.component.ts') || file.endsWith('.component.html')) {
          componentFiles.push(filePath);
        }
      });
    }

    findComponents(srcPath);

    let hasInnerHtml = false;
    let hasSafeHtml = false;
    let hasUnsafeBinding = false;

    componentFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');

      if (content.includes('[innerHTML]')) {
        hasInnerHtml = true;
        // Check if it's used with proper sanitization
        if (content.includes('DomSanitizer') || content.includes('sanitize')) {
          hasSafeHtml = true;
        }
      }

      // Check for potentially unsafe bindings
      if (content.includes('{{') && content.includes('}}')) {
        // Angular's default template binding is safe, but check for bypassing
        if (content.includes('bypassSecurity') || content.includes('trustAsHtml')) {
          hasUnsafeBinding = true;
        }
      }
    });

    if (!hasInnerHtml || (hasInnerHtml && hasSafeHtml && !hasUnsafeBinding)) {
      addTestResult('XSS Prevention', true, 'Angular template security properly implemented');
    } else {
      addTestResult('XSS Prevention', false, 'Potentially unsafe HTML binding found');
    }

  } catch (error) {
    addTestResult('XSS Prevention', false, `Error checking Angular components: ${error.message}`);
  }
}

/**
 * Test 4: Check package.json for security-related scripts
 */
function testSecurityScripts() {
  logInfo('Testing security-related npm scripts...');

  try {
    const packagePath = path.join(__dirname, 'package.json');

    if (!fs.existsSync(packagePath)) {
      addTestResult('Security Scripts', false, 'package.json not found');
      return;
    }

    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const scripts = packageContent.scripts || {};

    const hasSecurityTest = scripts['security:test'] !== undefined;
    const hasSecurityAudit = scripts['security:audit'] !== undefined;
    const hasSecurityRetire = scripts['security:retire'] !== undefined;

    if (hasSecurityTest && hasSecurityAudit && hasSecurityRetire) {
      addTestResult('Security Scripts', true, 'All security scripts configured');
    } else {
      const missing = [];
      if (!hasSecurityTest) {missing.push('security:test');}
      if (!hasSecurityAudit) {missing.push('security:audit');}
      if (!hasSecurityRetire) {missing.push('security:retire');}

      addTestResult('Security Scripts', false, `Missing scripts: ${missing.join(', ')}`);
    }

  } catch (error) {
    addTestResult('Security Scripts', false, `Error reading package.json: ${error.message}`);
  }
}

/**
 * Test 5: Check for sensitive data exposure and secure configuration
 */
function testSensitiveDataExposure() {
  logInfo('Testing for sensitive data exposure...');

  try {
    const filesToCheck = [
      'src/app/app.config.ts',
      'src/app/services/sqljs.service.ts',
      'src/app/services/ztmm-data-web.service.ts',
      'package.json',
      'angular.json'
    ];
    const exposedSecrets = [];

    filesToCheck.forEach(fileName => {
      const filePath = path.join(__dirname, fileName);

      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');

        // Check for common secrets patterns
        const secretPatterns = [
          /password\s*[:=]\s*['"][^'"]+['"]/i,
          /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
          /secret\s*[:=]\s*['"][^'"]+['"]/i,
          /token\s*[:=]\s*['"][^'"]+['"]/i,
          /private[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
          /database[_-]?url\s*[:=]\s*['"][^'"]+['"]/i
        ];

        secretPatterns.forEach(pattern => {
          if (pattern.test(content)) {
            exposedSecrets.push(`${fileName}: potential secret exposure`);
          }
        });

        // Check for hardcoded development URLs or sensitive paths
        if (content.includes('localhost') && !fileName.includes('spec.ts')) {
          exposedSecrets.push(`${fileName}: hardcoded localhost reference`);
        }
      }
    });

    if (exposedSecrets.length === 0) {
      addTestResult('Sensitive Data Exposure', true, 'No sensitive data exposure found');
    } else {
      addTestResult('Sensitive Data Exposure', false, `Found: ${exposedSecrets.join(', ')}`);
    }

  } catch (error) {
    addTestResult('Sensitive Data Exposure', false, `Error checking files: ${error.message}`);
  }
}

/**
 * Test 6: Check Angular security configuration
 */
function testAngularSecurity() {
  logInfo('Testing Angular security configuration...');

  try {
    // Check main.ts for security headers and configuration
    const mainTsPath = path.join(__dirname, 'src/main.ts');
    const appConfigPath = path.join(__dirname, 'src/app/app.config.ts');
    
    let hasSecureConfig = true;
    const securityIssues = [];

    // Check main.ts
    if (fs.existsSync(mainTsPath)) {
      const mainContent = fs.readFileSync(mainTsPath, 'utf8');
      
      // Check for proper bootstrap configuration
      if (!mainContent.includes('bootstrapApplication')) {
        securityIssues.push('main.ts: missing proper Angular bootstrap');
        hasSecureConfig = false;
      }
    } else {
      securityIssues.push('main.ts: file not found');
      hasSecureConfig = false;
    }

    // Check app.config.ts for security providers
    if (fs.existsSync(appConfigPath)) {
      const configContent = fs.readFileSync(appConfigPath, 'utf8');
      
      // Check for router configuration (should have proper guards)
      const hasRouterConfig = configContent.includes('provideRouter') ||
                             configContent.includes('RouterModule');
      
      if (!hasRouterConfig) {
        securityIssues.push('app.config.ts: missing router security configuration');
        hasSecureConfig = false;
      }
    }

    // Check for Content Security Policy in index.html
    const indexPath = path.join(__dirname, 'src/index.html');
    if (fs.existsSync(indexPath)) {
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      
      const hasCSP = indexContent.includes('Content-Security-Policy') ||
                    indexContent.includes('meta name="referrer"');
      
      // This is optional but recommended
      if (!hasCSP) {
        securityIssues.push('index.html: no Content Security Policy found (recommended)');
      }
    }

    if (hasSecureConfig) {
      addTestResult('Angular Security Configuration', true, 'Angular security configuration is properly set up');
    } else {
      addTestResult('Angular Security Configuration', false, `Issues: ${securityIssues.join(', ')}`);
    }

  } catch (error) {
    addTestResult('Angular Security Configuration', false, `Error checking Angular config: ${error.message}`);
  }
}

/**
 * Main test runner
 */
function runSecurityTests() {
  log('\n🔒 ZTMM Assessment Security Test Suite', 'blue');
  log('==========================================', 'blue');

  // Run all security tests
  testSQLInjectionPrevention();
  testSecureDatabaseOperations();
  testXSSPrevention();
  testSecurityScripts();
  testSensitiveDataExposure();
  testAngularSecurity();

  // Generate summary
  log('\n📊 Test Results Summary', 'blue');
  log('========================', 'blue');
  log(`Total Tests: ${totalTests}`);
  log(`Passed: ${passedTests}`, passedTests === totalTests ? 'green' : 'yellow');
  log(`Failed: ${failedTests}`, failedTests === 0 ? 'green' : 'red');
  log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

  // Write detailed results to file
  const resultsFile = 'security-test-results.log';
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
    log('\n❌ Security tests failed! Please address the issues above.', 'red');
    process.exit(1);
  } else {
    log('\n✅ All security tests passed!', 'green');
    process.exit(0);
  }
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runSecurityTests();
}

export {
  runSecurityTests,
  testResults
};
