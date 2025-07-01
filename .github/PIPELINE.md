# CI/CD Pipeline Documentation

This document describes the GitHub Actions workflows configured for the ZTMM Assessment application.

## Workflows Overview

### 1. PR Validation (`pr-validation.yml`)
**Triggered on:** Pull request events (opened, updated, ready for review) to `main`/`develop` branches

**Features:**
- Runs the same comprehensive checks as CI
- Posts a summary comment on the PR with results
- Uploads coverage reports as artifacts
- Only runs on non-draft PRs

**Features:**
- Builds production version

## What Each Workflow Tests

### Code Quality
- ✅ **Linting**: ESLint with security rules
- ✅ **Type Checking**: TypeScript compilation
- ✅ **Unit Tests**: Jest/Karma tests with coverage

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
