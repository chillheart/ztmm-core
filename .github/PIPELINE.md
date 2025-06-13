# CI/CD Pipeline Documentation

This document describes the GitHub Actions workflows configured for the ZTMM Assessment application.

## Workflows Overview

### 1. CI Pipeline (`ci.yml`)
**Triggered on:** Push to `main`/`develop` branches and pull requests to these branches

**Jobs:**
- **Main CI Job**: Runs your comprehensive test suite
  - Uses your existing `npm run ci:full` script (includes linting, type checking, unit tests, and ALL security tests)
  - Runs additional dependency security audit
  - Builds production version
  - Uploads coverage reports to Codecov (if configured)

- **Security Analysis** (PR only): 
  - CodeQL static analysis for security vulnerabilities
  - Dependency review to check for vulnerable packages

- **Vulnerability Scanning** (PR only):
  - Trivy scanner for file system vulnerabilities
  - Results uploaded to GitHub Security tab

### 2. PR Validation (`pr-validation.yml`)
**Triggered on:** Pull request events (opened, updated, ready for review) to `main`/`develop` branches

**Features:**
- Runs the same comprehensive checks as CI
- Posts a summary comment on the PR with results
- Uploads coverage reports as artifacts
- Only runs on non-draft PRs

### 3. GitHub Pages Deployment (`deploy-github-pages.yml`)
**Triggered on:** Release creation

**Features:**
- Builds production version
- Deploys to GitHub Pages automatically

## What Each Workflow Tests

### Code Quality
- ✅ **Linting**: ESLint with security rules
- ✅ **Type Checking**: TypeScript compilation
- ✅ **Unit Tests**: Jest/Karma tests with coverage

### Security Testing
- ✅ **OWASP Top 10**: Custom security tests for common vulnerabilities
- ✅ **Penetration Tests**: Application-specific security tests
- ✅ **Dependency Audit**: npm audit for vulnerable packages
- ✅ **Static Analysis**: CodeQL for code-level security issues
- ✅ **Vulnerability Scanning**: Trivy for container/filesystem vulnerabilities

### Build Verification
- ✅ **Production Build**: Ensures the app builds successfully for deployment

## Setting Up Secrets (Optional)

To enable additional features, you can add these secrets in your GitHub repository settings:

1. **CODECOV_TOKEN**: For code coverage reporting
   - Go to codecov.io and link your repository
   - Add the token to GitHub Secrets

## Branch Protection Rules (Recommended)

Consider setting up branch protection rules for `main` and `develop` branches:

1. Go to Settings → Branches in your GitHub repository
2. Add rules requiring:
   - Status checks to pass before merging
   - Up-to-date branches before merging
   - At least one approval for PRs

## Monitoring and Notifications

- **Success/Failure**: GitHub will show status checks on PRs
- **Security Issues**: Check the Security tab for any detected vulnerabilities
- **Coverage Reports**: Available as artifacts on each run
- **PR Comments**: Automated summary comments on pull requests

## Commands Your Pipeline Uses

The workflows leverage your existing npm scripts:

```bash
npm run ci:full              # Full CI suite (lint + test + security)
npm run security:owasp       # OWASP Top 10 security tests
npm run security:penetration # Penetration testing
npm run build:prod          # Production build
```

This ensures consistency between local development and CI/CD environments.
