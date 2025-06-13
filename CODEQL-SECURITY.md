# CodeQL Security Analysis for ZTMM Assessment

This document provides comprehensive guidance on using CodeQL for security analysis in the ZTMM Assessment project.

## Overview

CodeQL is GitHub's semantic code analysis engine that treats code as data, allowing you to write queries to find security vulnerabilities, bugs, and code quality issues. This project is configured with comprehensive CodeQL analysis for JavaScript/TypeScript.

## Setup

### Automated Analysis (GitHub Actions)

CodeQL is automatically configured to run:

1. **Pull Request Analysis**: Every PR triggers CodeQL analysis

### Local Analysis

To run CodeQL locally, you need the CodeQL CLI installed.

#### Installing CodeQL CLI

1. **macOS (via Homebrew)**:
   ```bash
   brew install codeql
   ```

2. **Manual Installation**:
   - Download from [GitHub CodeQL CLI releases](https://github.com/github/codeql-cli-binaries)
   - Extract and add to your PATH

3. **Verify Installation**:
   ```bash
   codeql --version
   ```

#### Running Local Analysis

```bash
# Run the automated local analysis script
npm run security:codeql

# Or run manually
./scripts/codeql-local.sh
```

## Configuration Files

### `.github/workflows/pr-validation.yml`
- Integrated CodeQL analysis in PR validation
- Ensures every PR is analyzed before merge

### `.github/codeql/codeql-config.yml`
- Custom configuration for Angular/TypeScript projects
- Optimized paths and query selection
- Security-focused analysis settings

## Query Suites

The project uses the following CodeQL query suites:

### Security and Quality Suite
- **Security queries**: Identifies potential security vulnerabilities
- **Quality queries**: Finds code quality issues and potential bugs
- **Best practices**: Ensures Angular/TypeScript best practices

### Covered Security Categories

1. **Injection Vulnerabilities**
   - XSS (Cross-Site Scripting)
   - SQL Injection
   - Command Injection

2. **Authentication & Authorization**
   - Weak authentication mechanisms
   - Authorization bypass

3. **Cryptographic Issues**
   - Weak cryptographic algorithms
   - Improper key management

4. **Data Flow Analysis**
   - Sensitive data exposure
   - Unvalidated input usage

5. **Angular-Specific Issues**
   - Template injection
   - Unsafe DOM manipulation
   - Routing vulnerabilities

## Understanding Results

### Severity Levels

- **Critical**: Immediate security threats requiring urgent attention
- **High**: Serious security issues that should be fixed promptly
- **Medium**: Moderate security concerns or quality issues
- **Low**: Minor issues or style violations

### Result Formats

1. **SARIF**: Machine-readable format for integration with tools
2. **CSV**: Human-readable format for manual review
3. **GitHub Security Alerts**: Integrated with GitHub's security tab

## Integration with Existing Security

CodeQL complements your existing security measures:

```bash
# Run comprehensive security suite
npm run security:full      # Includes audit + tests
npm run security:codeql    # Add CodeQL analysis
npm run ci:full           # Full CI including CodeQL
```

## Customizing Analysis

### Adding Custom Queries

1. Create custom queries in `.github/codeql/queries/`
2. Update `codeql-config.yml` to include custom queries
3. Test locally before committing

### Excluding Files

Update `codeql-config.yml` to exclude files:

```yaml
paths-ignore:
  - "**/*.spec.ts"
  - "node_modules/"
  - "dist/"
```

### Language-Specific Configuration

For TypeScript optimization:

```yaml
javascript:
  extractor:
    typescript: true
  typescript:
    strict: true
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Ensure dependencies are installed
   npm ci
   npm run build:prod
   ```

2. **Memory Issues (Local Analysis)**
   ```bash
   # Increase Node.js memory
   export NODE_OPTIONS="--max-old-space-size=8192"
   ```

3. **Query Timeouts**
   - Reduce scope in `codeql-config.yml`
   - Use specific query suites instead of all queries

### Getting Help

- **GitHub Documentation**: [CodeQL for JavaScript](https://docs.github.com/en/code-security/code-scanning/using-codeql-code-scanning-with-your-existing-ci-system)
- **Query Reference**: [CodeQL JavaScript queries](https://codeql.github.com/codeql-query-help/javascript/)
- **Community**: [GitHub Security Community](https://github.com/community/community/discussions/categories/code-security)

## Best Practices

### Development Workflow

1. **Before PR Creation**:
   ```bash
   npm run security:codeql  # Local analysis
   npm run ci:full         # Full validation
   ```

2. **Reviewing Results**:
   - Prioritize critical and high severity findings
   - Understand the data flow causing issues
   - Fix root causes, not just symptoms

3. **Continuous Improvement**:
   - Review weekly scheduled analysis results
   - Update queries as new vulnerabilities are discovered
   - Train team on common vulnerability patterns

### Performance Optimization

- Use path filters to focus analysis on relevant code
- Exclude test files and third-party dependencies
- Run incremental analysis on large codebases

## Example Queries

### Finding XSS Vulnerabilities

```ql
import javascript

from DomBasedXss xss
where xss.getVulnerabilityType() = "XSS"
select xss, "Potential XSS vulnerability"
```

### Finding Hardcoded Secrets

```ql
import javascript

from StringLiteral str
where str.getValue().matches("%password%") or
      str.getValue().matches("%secret%") or
      str.getValue().matches("%token%")
select str, "Potential hardcoded secret"
```

## Metrics and Reporting

### Key Metrics to Track

- Number of security findings by severity
- Time to fix critical vulnerabilities
- Trend analysis over time
- Coverage of security queries

### Automated Reporting

Results are automatically:
- Posted as PR comments
- Uploaded as GitHub artifacts
- Integrated with GitHub Security tab
- Available via GitHub API

## Compliance and Standards

CodeQL analysis helps meet:

- **OWASP Top 10**: Coverage of major web application risks
- **SANS Top 25**: Common software weaknesses
- **ISO 27001**: Information security management
- **SOC 2**: Security operational controls

## Next Steps

1. **Review Initial Results**: Check the first CodeQL analysis results
2. **Customize Configuration**: Adjust queries and paths as needed
3. **Team Training**: Ensure team understands CodeQL findings
4. **Process Integration**: Include CodeQL in security review process
5. **Continuous Monitoring**: Set up alerts for new vulnerabilities

---

For questions or issues with CodeQL analysis, please refer to the project's security documentation or create an issue in the repository.
