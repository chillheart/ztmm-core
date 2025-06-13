/**
 * Security Configuration for ZTMM Assessment Application
 *
 * This file contains security-related configuration and policies
 * for the application testing and deployment.
 */

export interface SecurityConfig {
  testing: {
    enablePenetrationTests: boolean;
    enableOwaspTopTenTests: boolean;
    xssProtection: boolean;
    injectionProtection: boolean;
    cspValidation: boolean;
    accessControlTests: boolean;
    informationDisclosureTests: boolean;
    errorHandlingTests: boolean;
  };
  csp: {
    defaultSrc: string[];
    scriptSrc: string[];
    styleSrc: string[];
    imgSrc: string[];
    connectSrc: string[];
    fontSrc: string[];
    objectSrc: string[];
    mediaSrc: string[];
    frameSrc: string[];
  };
  security: {
    xFrameOptions: string;
    xContentTypeOptions: string;
    xXSSProtection: string;
    strictTransportSecurity: string;
    referrerPolicy: string;
  };
  validation: {
    maxInputLength: number;
    allowedFileTypes: string[];
    maxFileSize: number;
    sanitizeInput: boolean;
  };
}

export const SECURITY_CONFIG: SecurityConfig = {
  testing: {
    enablePenetrationTests: true,
    enableOwaspTopTenTests: true,
    xssProtection: true,
    injectionProtection: true,
    cspValidation: true,
    accessControlTests: true,
    informationDisclosureTests: true,
    errorHandlingTests: true
  },
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"], // Note: Consider removing unsafe-inline for production
    styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
    imgSrc: ["'self'", "data:", "blob:"],
    connectSrc: ["'self'"],
    fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"]
  },
  security: {
    xFrameOptions: "DENY",
    xContentTypeOptions: "nosniff",
    xXSSProtection: "1; mode=block",
    strictTransportSecurity: "max-age=31536000; includeSubDomains",
    referrerPolicy: "strict-origin-when-cross-origin"
  },
  validation: {
    maxInputLength: 10000,
    allowedFileTypes: ['.json', '.txt'],
    maxFileSize: 10485760, // 10MB
    sanitizeInput: true
  }
};

/**
 * Security Rules for Input Validation
 */
export class SecurityRules {

  /**
   * Validates and sanitizes user input
   */
  static sanitizeInput(input: string): string {
    if (!SECURITY_CONFIG.validation.sanitizeInput) {
      return input;
    }

    // Remove potentially dangerous characters with improved security
    // First pass: Remove dangerous URL schemes (including data: scheme)
    let sanitized = input
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:/gi, '')  // Fix: Add data: scheme check
      .replace(/file:/gi, '')
      .replace(/ftp:/gi, '');

    // Second pass: Remove HTML tags with improved regex patterns
    // Fix: Use more robust regex patterns that handle spaces and variations
    sanitized = sanitized
      .replace(/<\s*script\b[^<]*(?:(?!<\s*\/\s*script\s*>)<[^<]*)*<\s*\/\s*script\s*>/gi, '')
      .replace(/<\s*iframe\b[^<]*(?:(?!<\s*\/\s*iframe\s*>)<[^<]*)*<\s*\/\s*iframe\s*>/gi, '')
      .replace(/<\s*object\b[^>]*>/gi, '')
      .replace(/<\s*embed\b[^>]*>/gi, '')
      .replace(/<\s*form\b[^>]*>/gi, '')
      .replace(/<\s*input\b[^>]*>/gi, '')
      .replace(/<\s*textarea\b[^>]*>/gi, '');

    // Third pass: Remove event handlers with comprehensive pattern
    sanitized = sanitized
      .replace(/on\w+\s*=/gi, '')  // Fix: Catches all event handlers
      .replace(/style\s*=/gi, '');  // Remove style attribute

    // Fourth pass: Iterative cleaning to prevent nested tag exploits
    let previousLength;
    do {
      previousLength = sanitized.length;
      sanitized = sanitized
        .replace(/<\s*script\b[^<]*(?:(?!<\s*\/\s*script\s*>)<[^<]*)*<\s*\/\s*script\s*>/gi, '')
        .replace(/<\s*iframe\b[^<]*(?:(?!<\s*\/\s*iframe\s*>)<[^<]*)*<\s*\/\s*iframe\s*>/gi, '');
    } while (sanitized.length !== previousLength);  // Fix: Prevent nested tag bypasses

    return sanitized.trim();
  }

  /**
   * Validates input length
   */
  static validateInputLength(input: string): boolean {
    return input.length <= SECURITY_CONFIG.validation.maxInputLength;
  }

  /**
   * Validates file type
   */
  static validateFileType(filename: string): boolean {
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return SECURITY_CONFIG.validation.allowedFileTypes.includes(extension);
  }

  /**
   * Validates file size
   */
  static validateFileSize(size: number): boolean {
    return size <= SECURITY_CONFIG.validation.maxFileSize;
  }

  /**
   * Checks for SQL injection patterns
   */
  static containsSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\'|\;|\-\-|\,|\*|\s)+(union|select|insert|delete|update|drop|create|alter|exec|execute)\s+/i,
      /(\')(\s)*(or|and)(\s)*(\')?\S*(\s)*(=|like)/i,
      /(\/\*|\*\/|@@|char|nchar|varchar|nvarchar|exec|execute|sp_|xp_)/i,
      /(script|javascript|vbscript|onload|onerror|onclick)/i
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Checks for XSS patterns with improved detection
   */
  static containsXSS(input: string): boolean {
    const xssPatterns = [
      // Script tags with space variations
      /<\s*script\b[^<]*(?:(?!<\s*\/\s*script\s*>)<[^<]*)*<\s*\/\s*script\s*>/gi,
      /<\s*iframe\b[^<]*(?:(?!<\s*\/\s*iframe\s*>)<[^<]*)*<\s*\/\s*iframe\s*>/gi,

      // Dangerous URL schemes
      /javascript:/gi,
      /vbscript:/gi,
      /data:/gi,  // Fix: Add data: scheme detection
      /file:/gi,
      /ftp:/gi,

      // Event handlers (comprehensive)
      /on\w+\s*=/gi,  // Fix: Catches all event handlers

      // Other dangerous tags
      /<\s*img[^>]+src[^>]*>/gi,
      /<\s*object[^>]*>/gi,
      /<\s*embed[^>]*>/gi,
      /<\s*link[^>]*>/gi,
      /<\s*meta[^>]*>/gi,
      /<\s*form[^>]*>/gi,
      /<\s*input[^>]*>/gi,
      /<\s*textarea[^>]*>/gi,

      // Style injection
      /style\s*=/gi,
      /<\s*style[^>]*>/gi,

      // Expression and import patterns
      /expression\s*\(/gi,
      /@import/gi,
      /url\s*\(/gi
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Checks for command injection patterns
   */
  static containsCommandInjection(input: string): boolean {
    const commandPatterns = [
      /[;&|`$()]/,
      /(cat|ls|dir|type|del|rm|mv|cp|wget|curl|nc|netcat|ping|nslookup|whoami|id|pwd)/i,
      /(bash|sh|cmd|powershell|pwsh)/i
    ];

    return commandPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Comprehensive input validation
   */
  static isInputSafe(input: string): { safe: boolean; reasons: string[] } {
    const reasons: string[] = [];

    if (!this.validateInputLength(input)) {
      reasons.push('Input exceeds maximum length');
    }

    if (this.containsXSS(input)) {
      reasons.push('Input contains potential XSS patterns');
    }

    if (this.containsSQLInjection(input)) {
      reasons.push('Input contains potential SQL injection patterns');
    }

    if (this.containsCommandInjection(input)) {
      reasons.push('Input contains potential command injection patterns');
    }

    return {
      safe: reasons.length === 0,
      reasons
    };
  }
}

/**
 * Security Headers for HTTP responses (for reference)
 */
export const SECURITY_HEADERS = {
  'X-Frame-Options': SECURITY_CONFIG.security.xFrameOptions,
  'X-Content-Type-Options': SECURITY_CONFIG.security.xContentTypeOptions,
  'X-XSS-Protection': SECURITY_CONFIG.security.xXSSProtection,
  'Strict-Transport-Security': SECURITY_CONFIG.security.strictTransportSecurity,
  'Referrer-Policy': SECURITY_CONFIG.security.referrerPolicy,
  'Content-Security-Policy': generateCSPHeader()
};

function generateCSPHeader(): string {
  const csp = SECURITY_CONFIG.csp;
  return [
    `default-src ${csp.defaultSrc.join(' ')}`,
    `script-src ${csp.scriptSrc.join(' ')}`,
    `style-src ${csp.styleSrc.join(' ')}`,
    `img-src ${csp.imgSrc.join(' ')}`,
    `connect-src ${csp.connectSrc.join(' ')}`,
    `font-src ${csp.fontSrc.join(' ')}`,
    `object-src ${csp.objectSrc.join(' ')}`,
    `media-src ${csp.mediaSrc.join(' ')}`,
    `frame-src ${csp.frameSrc.join(' ')}`
  ].join('; ');
}

/**
 * Security Audit Logger
 */
export class SecurityAuditLogger {
  private static logs: SecurityLogEntry[] = [];

  static log(entry: SecurityLogEntry): void {
    entry.timestamp = new Date().toISOString();
    this.logs.push(entry);

    // In a real application, you would send this to a security logging service
    console.warn(`🔒 Security Event: ${entry.event} - ${entry.description}`);
  }

  static getLogs(): SecurityLogEntry[] {
    return [...this.logs];
  }

  static clearLogs(): void {
    this.logs = [];
  }

  static logInputValidationFailure(input: string, component: string, field: string): void {
    this.log({
      event: 'INPUT_VALIDATION_FAILURE',
      severity: 'MEDIUM',
      description: `Invalid input detected in ${component}.${field}`,
      component,
      field,
      inputLength: input.length,
      timestamp: new Date().toISOString()
    });
  }

  static logPotentialAttack(attackType: string, payload: string, component: string): void {
    this.log({
      event: 'POTENTIAL_ATTACK',
      severity: 'HIGH',
      description: `Potential ${attackType} attack detected in ${component}`,
      component,
      attackType,
      payloadHash: this.hashPayload(payload),
      timestamp: new Date().toISOString()
    });
  }

  private static hashPayload(payload: string): string {
    // Simple hash for payload identification (in real app, use crypto.subtle)
    let hash = 0;
    for (let i = 0; i < payload.length; i++) {
      const char = payload.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }
}

export interface SecurityLogEntry {
  event: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  component?: string;
  field?: string;
  attackType?: string;
  inputLength?: number;
  payloadHash?: string;
  timestamp: string;
}
