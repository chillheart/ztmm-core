/**
 * Simple Security Test Suite
 * Lightweight security tests to validate core security functionality
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SECURITY_CONFIG, SecurityRules } from './security-config';

describe('Simple Security Tests', () => {

  describe('XSS Protection', () => {
    it('should detect XSS patterns using SecurityRules', () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src="x" onerror="alert(1)">',
        'javascript:alert(1)',
        '<svg onload=alert(1)>'
      ];

      xssPayloads.forEach(payload => {
        const hasXSS = SecurityRules.containsXSS(payload);
        expect(hasXSS).toBe(true);
      });
    });

    it('should validate safe content', () => {
      const safeContent = [
        'Hello World',
        'Normal text content',
        'User input without scripts',
        '123456'
      ];

      safeContent.forEach(content => {
        const hasXSS = SecurityRules.containsXSS(content);
        expect(hasXSS).toBe(false);
      });
    });
  });

  describe('Input Validation', () => {
    it('should detect SQL injection patterns using SecurityRules', () => {
      const sqlInjectionPayloads = [
        "'; DROP TABLE users;",
        "1' OR '1'='1'",
        "admin'; DROP TABLE users; --",
        "' UNION SELECT * FROM users"
      ];

      sqlInjectionPayloads.forEach(payload => {
        const hasSQLInjection = SecurityRules.containsSQLInjection(payload);
        expect(hasSQLInjection).toBe(true);
      });
    });

    it('should validate safe SQL content', () => {
      const safeInputs = [
        'John Doe',
        'user@example.com',
        'Normal search query',
        '12345'
      ];

      safeInputs.forEach(input => {
        const hasSQLInjection = SecurityRules.containsSQLInjection(input);
        expect(hasSQLInjection).toBe(false);
      });
    });
  });

  describe('Security Configuration', () => {
    it('should have proper security headers configuration', () => {
      expect(SECURITY_CONFIG.security).toBeDefined();
      expect(SECURITY_CONFIG.security.xFrameOptions).toBe('DENY');
      expect(SECURITY_CONFIG.security.xContentTypeOptions).toBe('nosniff');
      expect(SECURITY_CONFIG.security.xXSSProtection).toBe('1; mode=block');
    });

    it('should have input validation rules', () => {
      expect(SECURITY_CONFIG.validation).toBeDefined();
      expect(SECURITY_CONFIG.validation.maxInputLength).toBeGreaterThan(0);
      expect(SECURITY_CONFIG.validation.sanitizeInput).toBe(true);
    });

    it('should have CSP configuration', () => {
      expect(SECURITY_CONFIG.csp).toBeDefined();
      expect(SECURITY_CONFIG.csp.defaultSrc).toContain("'self'");
      expect(SECURITY_CONFIG.csp.objectSrc).toContain("'none'");
    });
  });

  describe('Input Validation Security', () => {
    it('should validate input length using SecurityRules', () => {
      const longInput = 'a'.repeat(SECURITY_CONFIG.validation.maxInputLength + 1);
      const validInput = 'Valid input';

      expect(SecurityRules.validateInputLength(longInput)).toBe(false);
      expect(SecurityRules.validateInputLength(validInput)).toBe(true);
    });

    it('should detect SQL injection using SecurityRules', () => {
      const sqlPayload = "'; DROP TABLE users; --";
      const safeInput = "Normal user input";

      expect(SecurityRules.containsSQLInjection(sqlPayload)).toBe(true);
      expect(SecurityRules.containsSQLInjection(safeInput)).toBe(false);
    });

    it('should sanitize input using SecurityRules', () => {
      const maliciousInput = '<script>alert("XSS")</script>Hello World';
      const sanitized = SecurityRules.sanitizeInput(maliciousInput);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('Hello World');
    });

    it('should validate file types', () => {
      expect(SecurityRules.validateFileType('data.json')).toBe(true);
      expect(SecurityRules.validateFileType('config.txt')).toBe(true);
      expect(SecurityRules.validateFileType('malware.exe')).toBe(false);
      expect(SecurityRules.validateFileType('script.js')).toBe(false);
    });

    it('should validate file sizes', () => {
      const validSize = 1024 * 1024; // 1MB
      const invalidSize = 50 * 1024 * 1024; // 50MB (exceeds limit)

      expect(SecurityRules.validateFileSize(validSize)).toBe(true);
      expect(SecurityRules.validateFileSize(invalidSize)).toBe(false);
    });
  });

  describe('Security Best Practices', () => {
    it('should have strict Content Security Policy', () => {
      expect(SECURITY_CONFIG.csp.objectSrc).toContain("'none'");
      expect(SECURITY_CONFIG.csp.frameSrc).toContain("'none'");
      expect(SECURITY_CONFIG.csp.defaultSrc).toContain("'self'");
    });

    it('should have secure headers configuration', () => {
      expect(SECURITY_CONFIG.security.strictTransportSecurity).toContain('max-age=');
      expect(SECURITY_CONFIG.security.referrerPolicy).toBe('strict-origin-when-cross-origin');
    });

    it('should enable OWASP security tests', () => {
      expect(SECURITY_CONFIG.testing.enableOwaspTopTenTests).toBe(true);
      expect(SECURITY_CONFIG.testing.xssProtection).toBe(true);
      expect(SECURITY_CONFIG.testing.injectionProtection).toBe(true);
    });
  });
});
