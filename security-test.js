#!/usr/bin/env node

/**
 * ZTMM Assessment Security Test Suite
 * Tests for SQL injection prevention and input validation
 */

import fs from 'fs';
import path from 'path';

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
 * Test 1: Check for SQL injection prevention in validation.js
 */
function testSQLInjectionPrevention() {
  logInfo('Testing SQL injection prevention mechanisms...');

  try {
    // Check if validation.js exists and contains proper validation
    const validationPath = path.join(__dirname, 'validation.js');

    if (!fs.existsSync(validationPath)) {
      addTestResult('SQL Injection Prevention', false, 'validation.js file not found');
      return;
    }

    const validationContent = fs.readFileSync(validationPath, 'utf8');

    // Check for common SQL injection prevention patterns
    const hasParameterValidation = validationContent.includes('validateInput') ||
                                  validationContent.includes('sanitize') ||
                                  validationContent.includes('escape');

    const hasWhitelistValidation = validationContent.includes('whitelist') ||
                                  validationContent.includes('allowedCharacters') ||
                                  validationContent.includes('regex');

    const hasLengthValidation = validationContent.includes('length') ||
                               validationContent.includes('maxLength') ||
                               validationContent.includes('minLength');

    if (hasParameterValidation && hasWhitelistValidation && hasLengthValidation) {
      addTestResult('SQL Injection Prevention', true, 'Comprehensive input validation found');
    } else {
      const missing = [];
      if (!hasParameterValidation) {missing.push('parameter validation');}
      if (!hasWhitelistValidation) {missing.push('whitelist validation');}
      if (!hasLengthValidation) {missing.push('length validation');}

      addTestResult('SQL Injection Prevention', false, `Missing: ${missing.join(', ')}`);
    }

  } catch (error) {
    addTestResult('SQL Injection Prevention', false, `Error reading validation file: ${error.message}`);
  }
}

/**
 * Test 2: Check main.js for secure database operations
 */
function testSecureDatabaseOperations() {
  logInfo('Testing secure database operations...');

  try {
    const mainPath = path.join(__dirname, 'main.js');

    if (!fs.existsSync(mainPath)) {
      addTestResult('Secure Database Operations', false, 'main.js file not found');
      return;
    }

    const mainContent = fs.readFileSync(mainPath, 'utf8');

    // Check for prepared statements usage
    const usesPreparedStatements = mainContent.includes('.prepare(') ||
                                  mainContent.includes('prepare(') ||
                                  mainContent.includes('stmt.run') ||
                                  mainContent.includes('stmt.get') ||
                                  mainContent.includes('db.prepare(');

    // Check for proper parameter binding
    const usesParameterBinding = mainContent.includes('stmt.run(') ||
                                mainContent.includes('stmt.get(') ||
                                mainContent.includes('stmt.all(') ||
                                mainContent.includes('.run(') ||
                                mainContent.includes('.get(') ||
                                mainContent.includes('.all(');

    // Check for dangerous string concatenation in SQL (not parameterized queries)
    const sqlConcatenationPatterns = [
      /['"`]\s*\+\s*.*\s*\+\s*['"`]/,  // String concatenation with quotes
      /\$\{.*\}.*SELECT/i,             // Template literals in SQL
      /SELECT.*\$\{.*\}/i,             // Template literals in SQL
      /".*"\s*\+.*SELECT/i,            // String concat with SELECT
      /'.*'\s*\+.*SELECT/i             // String concat with SELECT
    ];

    const hasDangerousSQL = sqlConcatenationPatterns.some(pattern => pattern.test(mainContent));

    if (usesPreparedStatements && usesParameterBinding && !hasDangerousSQL) {
      addTestResult('Secure Database Operations', true, 'Prepared statements and parameter binding implemented');
    } else {
      const issues = [];
      if (!usesPreparedStatements) {issues.push('missing prepared statements');}
      if (!usesParameterBinding) {issues.push('missing parameter binding');}
      if (hasDangerousSQL) {issues.push('dangerous SQL string concatenation found');}

      addTestResult('Secure Database Operations', false, `Issues: ${issues.join(', ')}`);
    }

  } catch (error) {
    addTestResult('Secure Database Operations', false, `Error reading main.js: ${error.message}`);
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
 * Test 5: Check for sensitive data exposure
 */
function testSensitiveDataExposure() {
  logInfo('Testing for sensitive data exposure...');

  try {
    const filesToCheck = ['main.js', 'preload.js', 'package.json'];
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
          /private[_-]?key\s*[:=]\s*['"][^'"]+['"]/i
        ];

        secretPatterns.forEach(pattern => {
          if (pattern.test(content)) {
            exposedSecrets.push(`${fileName}: potential secret exposure`);
          }
        });
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
