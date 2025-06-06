# CI/CD Pipeline Documentation

This document describes the comprehensive CI/CD pipeline implemented for the ZTMM Assessment application, including security scanning, automated testing, and release management.

## 🚀 Pipeline Overview

The CI/CD pipeline consists of three main workflows:

### 1. Security Scanning (`security-scan.yml`)
- **Triggers**: Push to main/develop, pull requests, daily schedule
- **Purpose**: Comprehensive security analysis and vulnerability detection

### 2. CI/CD Pipeline (`ci-cd.yml`) 
- **Triggers**: Push to main/develop, pull requests
- **Purpose**: Continuous integration, testing, and deployment

### 3. Package and Release Source (`release.yml`)
- **Triggers**: Git tags, manual workflow dispatch
- **Purpose**: Package source code and create GitHub releases

## 🔒 Security Scanning

### GitHub CodeQL Analysis
- **Languages**: JavaScript, TypeScript
- **Queries**: Security-extended and security-and-quality
- **Frequency**: On every push, PR, and daily
- **Output**: SARIF files uploaded to GitHub Security tab

### OWASP Dependency Check
- **Purpose**: Detect known vulnerabilities in dependencies
- **Configuration**: Fails on CVSS score ≥ 7
- **Suppressions**: Managed via `dependency-check-suppressions.xml`
- **Reports**: HTML, JSON, XML, and SARIF formats

### Retire.js Scanning
- **Purpose**: Identify retired/vulnerable JavaScript libraries
- **Coverage**: All JavaScript/TypeScript files and dependencies
- **Integration**: Results uploaded as artifacts

### NPM Security Audit
- **Purpose**: Check for known vulnerabilities in npm packages
- **Threshold**: Moderate level vulnerabilities and above
- **Output**: JSON report with detailed vulnerability information

### Custom Security Tests
- **SQL Injection Tests**: Validates protection mechanisms
- **Integration Tests**: End-to-end security verification
- **Coverage**: 100% of implemented security controls

## 🧪 Testing & Quality Assurance

### Unit Testing
- **Framework**: Karma + Jasmine
- **Coverage**: Code coverage reporting with Codecov
- **Browsers**: ChromeHeadless for CI environment
- **Reports**: JUnit XML format for CI integration

### Security Testing
- **SQL Injection Prevention**: Automated testing of validation layer
- **Integration Testing**: End-to-end security verification
- **Custom Tests**: Application-specific security controls

### Code Quality
- **TypeScript**: Type checking with `tsc --noEmit`
- **Linting**: ESLint for code style and potential issues
- **Test Coverage**: Karma/Jasmine with coverage reports

## 🏗️ Build Process

### Angular Application Build
- **Configuration**: Production optimized
- **Output**: Minified and optimized web assets
- **Location**: `dist/` directory

### Source Code Packaging
- **Format**: Both tar.gz and zip archives
- **Content**: Complete source code excluding build artifacts
- **Includes**: Build instructions and documentation
- **Checksums**: SHA256 verification files

## 📦 Release Management

### Source Code Releases
- **Trigger**: Git tags (e.g., `v1.0.0`) or manual dispatch
- **Content**: Complete source code package
- **Formats**: tar.gz and zip archives
- **Documentation**: Build instructions and setup guide
- **GitHub Release**: Automated with release notes

### Release Process
1. **Source Packaging**: Clean source code without build artifacts
2. **Archive Creation**: Multiple format support (tar.gz, zip)
3. **Checksum Generation**: SHA256 verification files
4. **Release Creation**: GitHub release with build instructions
5. **Documentation**: Auto-generated release notes with setup guide

## 🔧 Configuration Files

### Workflow Configuration
- `.github/workflows/security-scan.yml` - Security scanning pipeline
- `.github/workflows/ci-cd.yml` - Main CI/CD pipeline  
- `.github/workflows/release.yml` - Release and build pipeline

### Security Configuration
- `dependency-check-suppressions.xml` - OWASP suppressions
- `security-test.js` - Custom security tests
- `integration-test.js` - Integration security tests

## 🎯 Required Secrets

Configure these secrets in your GitHub repository settings:

### Required Secrets
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions

### Optional Secrets
- `CODECOV_TOKEN` - Enhanced Codecov integration
- `CSC_LINK` - macOS code signing certificate
- `CSC_KEY_PASSWORD` - Certificate password
- `WIN_CSC_LINK` - Windows code signing certificate
- `WIN_CSC_KEY_PASSWORD` - Windows certificate password

## 📊 Monitoring & Reporting

### Security Reports
- **GitHub Security Tab**: CodeQL and SARIF results
- **Artifacts**: Detailed vulnerability reports
- **Summary**: Pipeline summary with security status

### Quality Reports
- **Codecov**: Test coverage tracking
- **GitHub Checks**: PR status checks

### Build Reports
- **Source Packages**: Available in GitHub releases
- **Build Instructions**: Included with source packages
- **Checksums**: SHA256 hashes for verification

## 🔄 Pipeline Triggers

### Automatic Triggers
- **Push to main**: Full CI/CD + production deployment
- **Push to develop**: Full CI/CD + staging deployment  
- **Pull Request**: Testing and security scanning
- **Daily Schedule**: Security scanning (2 AM UTC)
- **Git Tags**: Release build and GitHub release

### Manual Triggers
- **Release Workflow**: Manual version specification
- **Security Scan**: On-demand security analysis

## 📋 Best Practices

### Security
- All security scans must pass before deployment
- Dependencies are automatically scanned for vulnerabilities
- Custom security tests verify application-specific protections
- Release artifacts include security verification

### Quality
- Minimum test coverage requirements
- TypeScript strict mode enforcement
- Automated code formatting and linting

### Release
- Semantic versioning for releases
- Automated changelog generation
- Source code integrity verification
- Build instructions included with releases

## 🚨 Troubleshooting

### Common Issues

#### Source Package Issues
- Verify tag format (must start with 'v')
- Check source file exclusions
- Validate archive creation process

#### Security Scan Failures
- Review dependency vulnerabilities
- Update vulnerable packages
- Add suppressions for false positives

#### Release Issues
- Verify tag format (must start with 'v')
- Check source package generation
- Validate GitHub token permissions

### Getting Help
- Check GitHub Actions logs for detailed error messages
- Review security scan reports for specific vulnerabilities
- Consult build instructions in source packages for setup issues

## 📈 Metrics & KPIs

### Security Metrics
- Zero high/critical vulnerabilities in releases
- 100% security test coverage
- Daily vulnerability scanning

### Quality Metrics
- >90% test coverage target
- Zero linting errors

### Release Metrics
- Automated source code packaging
- Sub-10 minute packaging times
- Verified source package integrity
