#!/bin/bash

# CodeQL Local Analysis Script for ZTMM Assessment
# This script helps you run CodeQL analysis locally before pushing to GitHub

set -e

echo "🔍 Starting CodeQL Local Analysis for ZTMM Assessment"
echo "=================================================="

# Check if CodeQL CLI is installed
if ! command -v codeql &> /dev/null; then
    echo "❌ CodeQL CLI is not installed."
    echo "📖 Please install CodeQL CLI from: https://github.com/github/codeql-cli-binaries"
    echo "   Or use GitHub Codespaces/Actions for analysis."
    exit 1
fi

# Check and download required query packs
echo "📦 Checking CodeQL query packs..."
if ! codeql resolve packs --search-path="$HOME/.codeql/packages" | grep -q "codeql/javascript-queries"; then
    echo "📥 Downloading JavaScript query pack..."
    codeql pack download codeql/javascript-queries
    codeql pack download codeql/javascript-all
fi

# Create database directory
DB_DIR="./codeql-database"
RESULTS_DIR="./codeql-results"

echo "🧹 Cleaning up previous analysis..."
rm -rf "$DB_DIR" "$RESULTS_DIR"
mkdir -p "$RESULTS_DIR"

echo "📦 Installing dependencies..."
npm ci

echo "🏗️  Creating CodeQL database..."
codeql database create "$DB_DIR" \
    --language=javascript \
    --source-root=. \
    --command="echo 'Using TypeScript sources directly - no build needed'"

echo "🔎 Running CodeQL analysis..."
codeql database analyze "$DB_DIR" \
    --format=sarif-latest \
    --output="$RESULTS_DIR/results.sarif" \
    --sarif-category="local-analysis" \
    --search-path="$HOME/.codeql/packages" \
    codeql/javascript-queries:codeql-suites/javascript-security-and-quality.qls

echo "📊 Generating readable report..."
codeql database analyze "$DB_DIR" \
    --format=csv \
    --output="$RESULTS_DIR/results.csv" \
    --search-path="$HOME/.codeql/packages" \
    codeql/javascript-queries:codeql-suites/javascript-security-and-quality.qls

echo "🔧 Filtering out security test directory findings..."
# Create filtered CSV excluding security test files
if [ -f "$RESULTS_DIR/results.csv" ]; then
    grep -v "/src/app/security/" "$RESULTS_DIR/results.csv" > "$RESULTS_DIR/results-filtered.csv"
    mv "$RESULTS_DIR/results-filtered.csv" "$RESULTS_DIR/results.csv"
fi

echo "✅ CodeQL analysis complete!"
echo "📁 Results saved to: $RESULTS_DIR/"
echo "   - SARIF format: $RESULTS_DIR/results.sarif"
echo "   - CSV format: $RESULTS_DIR/results.csv"

# Check if there are any security findings
if [ -f "$RESULTS_DIR/results.csv" ]; then
    FINDINGS=$(tail -n +2 "$RESULTS_DIR/results.csv" | wc -l)
    if [ "$FINDINGS" -gt 0 ]; then
        echo "⚠️  Found $FINDINGS potential security findings."
        echo "📖 Review the results in $RESULTS_DIR/results.csv"
    else
        echo "🎉 No security findings detected!"
    fi
fi

echo ""
echo "🚀 Ready to push your secure code to GitHub!"
