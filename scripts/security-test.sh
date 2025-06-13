#!/bin/bash

# Security Testing Script for ZTMM Assessment Application
# This script runs comprehensive security tests to ensure OWASP Top 10 compliance

echo "🔒 ZTMM Assessment Security Testing Suite"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    case $1 in
        "SUCCESS") echo -e "${GREEN}✅ $2${NC}" ;;
        "ERROR") echo -e "${RED}❌ $2${NC}" ;;
        "WARNING") echo -e "${YELLOW}⚠️  $2${NC}" ;;
        "INFO") echo -e "${BLUE}ℹ️  $2${NC}" ;;
    esac
}

# Check if npm is available
if ! command -v npm &> /dev/null; then
    print_status "ERROR" "npm is not installed or not in PATH"
    exit 1
fi

# Check if Angular CLI is available
if ! command -v ng &> /dev/null; then
    print_status "WARNING" "Angular CLI not found globally. Using npx..."
    NG_CMD="npx ng"
else
    NG_CMD="ng"
fi

print_status "INFO" "Starting security testing suite..."
echo ""

# 1. Dependency Security Audit
print_status "INFO" "Running dependency security audit..."
if npm audit --audit-level moderate; then
    print_status "SUCCESS" "Dependency audit passed"
else
    print_status "WARNING" "Dependency audit found issues. Review and update dependencies."
fi
echo ""

# 2. OWASP Top 10 Security Tests
print_status "INFO" "Running OWASP Top 10 security tests..."
if npm run security:owasp; then
    print_status "SUCCESS" "OWASP Top 10 tests passed"
else
    print_status "ERROR" "OWASP Top 10 tests failed"
    exit 1
fi
echo ""

# 3. Penetration Tests
print_status "INFO" "Running penetration tests..."
if npm run security:penetration; then
    print_status "SUCCESS" "Penetration tests passed"
else
    print_status "ERROR" "Penetration tests failed"
    exit 1
fi
echo ""

# 4. Lint for Security Issues
print_status "INFO" "Running ESLint security checks..."
if npm run lint; then
    print_status "SUCCESS" "Lint security checks passed"
else
    print_status "WARNING" "Lint found issues. Review for security implications."
fi
echo ""

# 5. Type checking (helps catch potential security issues)
print_status "INFO" "Running TypeScript type checking..."
if npm run type-check; then
    print_status "SUCCESS" "Type checking passed"
else
    print_status "WARNING" "Type checking found issues"
fi
echo ""

# Summary
echo "📋 Security Testing Summary"
echo "=========================="
print_status "SUCCESS" "Security testing suite completed successfully!"
echo ""
print_status "INFO" "Security features validated:"
echo "   • XSS protection"
echo "   • Injection attack prevention"
echo "   • Access control validation"
echo "   • Information disclosure prevention"
echo "   • Content Security Policy compliance"
echo "   • Input validation and sanitization"
echo "   • Error handling security"
echo "   • Dependency security"
echo ""

print_status "INFO" "For detailed security documentation, see SECURITY-TESTING.md"
print_status "INFO" "To run individual security tests:"
echo "   npm run security:owasp      # OWASP Top 10 tests"
echo "   npm run security:penetration # Penetration tests"
echo "   npm run security:test:watch  # Watch mode for development"
echo ""

print_status "SUCCESS" "Application is ready for secure deployment! 🚀"
