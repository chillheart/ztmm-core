#!/bin/bash

# Validate CodeQL Configuration Script
# This script validates that all CodeQL configurations are properly set up

set -e

echo "🔍 Validating CodeQL Configuration for ZTMM Assessment"
echo "===================================================="

# Check if configuration files exist
CONFIG_FILES=(
    ".github/workflows/codeql-analysis.yml"
    ".github/workflows/pr-validation.yml"
    ".github/codeql/codeql-config.yml"
    "scripts/codeql-local.sh"
)

echo "📋 Checking configuration files..."
for file in "${CONFIG_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

# Validate YAML syntax
echo ""
echo "🔧 Validating YAML syntax..."

# Check if yamllint is available
if command -v yamllint &> /dev/null; then
    yamllint .github/workflows/codeql-analysis.yml
    yamllint .github/workflows/pr-validation.yml
    yamllint .github/codeql/codeql-config.yml
    echo "✅ YAML syntax validation passed"
else
    echo "⚠️  yamllint not found, skipping YAML validation"
fi

# Check if required scripts are executable
echo ""
echo "🔐 Checking script permissions..."
if [ -x "scripts/codeql-local.sh" ]; then
    echo "✅ codeql-local.sh is executable"
else
    echo "❌ codeql-local.sh is not executable"
    echo "   Run: chmod +x scripts/codeql-local.sh"
    exit 1
fi

# Validate package.json has security:codeql script
echo ""
echo "📦 Checking package.json scripts..."
if grep -q "security:codeql" package.json; then
    echo "✅ security:codeql script found in package.json"
else
    echo "❌ security:codeql script missing from package.json"
    exit 1
fi

# Check .gitignore entries
echo ""
echo "🚫 Checking .gitignore entries..."
if grep -q "codeql-database/" .gitignore && grep -q "codeql-results/" .gitignore; then
    echo "✅ CodeQL directories are ignored in .gitignore"
else
    echo "❌ CodeQL directories missing from .gitignore"
    exit 1
fi

# Validate project can build (required for CodeQL)
echo ""
echo "🏗️  Validating project build..."
if npm run build:prod > /dev/null 2>&1; then
    echo "✅ Project builds successfully"
else
    echo "❌ Project build failed"
    echo "   CodeQL analysis requires a successful build"
    exit 1
fi

echo ""
echo "🎉 CodeQL configuration validation completed successfully!"
echo ""
echo "Next steps:"
echo "1. Commit and push changes to trigger GitHub Actions"
echo "2. Check the 'Security' tab in GitHub for CodeQL results"
echo "3. Review any security findings and fix as needed"
echo "4. Run 'npm run security:codeql' for local analysis (requires CodeQL CLI)"
echo ""
echo "📖 For more information, see CODEQL-SECURITY.md"
