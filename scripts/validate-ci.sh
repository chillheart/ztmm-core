#!/bin/bash

# Local CI Pipeline Validation Script
# This script simulates what the GitHub Actions CI pipeline will run

set -e

echo "🚀 Starting Local CI Pipeline Validation"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    local status=$1
    local message=$2
    case $status in
        "SUCCESS")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "INFO")
            echo -e "${YELLOW}ℹ️  $message${NC}"
            ;;
    esac
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_status "ERROR" "package.json not found. Please run this script from the project root."
    exit 1
fi

print_status "INFO" "Installing dependencies..."
npm ci

print_status "INFO" "Running full CI suite..."
if npm run ci:full; then
    print_status "SUCCESS" "CI suite passed (includes linting, unit tests, and security tests)"
else
    print_status "ERROR" "CI suite failed"
    exit 1
fi

print_status "INFO" "Running security audit..."
if npm run security:audit; then
    print_status "SUCCESS" "Security audit passed"
else
    print_status "ERROR" "Security audit failed"
    exit 1
fi
    print_status "ERROR" "Penetration tests failed"
    exit 1
fi

print_status "INFO" "Building production version..."
if npm run build:prod; then
    print_status "SUCCESS" "Production build successful"
else
    print_status "ERROR" "Production build failed"
    exit 1
fi

echo ""
echo "🎉 All checks passed! Your code is ready for the pipeline."
echo ""
print_status "INFO" "Summary of what was tested:"
echo "   • Linting (ESLint)"
echo "   • Type checking (TypeScript)"
echo "   • Unit tests with coverage"
echo "   • All security tests (OWASP + Penetration)"
echo "   • Dependency security audit"
echo "   • Production build"
echo ""
print_status "SUCCESS" "Ready to commit and push! 🚀"
