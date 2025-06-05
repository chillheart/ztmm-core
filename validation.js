/**
 * Input validation utilities for preventing SQL injection and ensuring data integrity
 */

/**
 * Validates and sanitizes string input
 * @param {any} input - The input to validate
 * @param {number} maxLength - Maximum allowed length
 * @param {boolean} required - Whether the field is required
 * @returns {string} - Sanitized string
 * @throws {Error} - If validation fails
 */
function validateString(input, maxLength = 255, required = true) {
  if (input === null || input === undefined) {
    if (required) {
      throw new Error('Required field cannot be null or undefined');
    }
    return '';
  }

  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  const trimmed = input.trim();

  if (required && trimmed.length === 0) {
    throw new Error('Required field cannot be empty');
  }

  if (trimmed.length > maxLength) {
    throw new Error(`Input exceeds maximum length of ${maxLength} characters`);
  }

  // Check for SQL injection patterns
  const sqlPatterns = [
    /['";]/,                    // Single/double quotes and semicolons
    /--/,                       // SQL comments
    /\/\*/,                     // SQL block comments
    /\bDROP\b/i,               // DROP statements
    /\bDELETE\b/i,             // DELETE statements
    /\bUPDATE\b/i,             // UPDATE statements
    /\bINSERT\b/i,             // INSERT statements
    /\bSELECT\b/i,             // SELECT statements
    /\bUNION\b/i,              // UNION statements
    /\bOR\s+\d+\s*=\s*\d+/i,   // OR 1=1 patterns
    /\bAND\s+\d+\s*=\s*\d+/i,  // AND 1=1 patterns
  ];

  for (const pattern of sqlPatterns) {
    if (pattern.test(trimmed)) {
      throw new Error('Input contains potentially malicious SQL patterns');
    }
  }

  // Whitelist validation: Only allow safe characters
  const allowedCharacters = /^[a-zA-Z0-9\s\-_.@()]+$/;
  if (!allowedCharacters.test(trimmed)) {
    throw new Error('Input contains characters outside the allowed whitelist');
  }

  // Remove control characters but preserve allowed whitespace
  const sanitized = trimmed.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return sanitized;
}

/**
 * Validates integer input
 * @param {any} input - The input to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} - Validated integer
 * @throws {Error} - If validation fails
 */
function validateInteger(input, min = 1, max = Number.MAX_SAFE_INTEGER) {
  if (input === null || input === undefined) {
    throw new Error('Integer field cannot be null or undefined');
  }

  // Reject non-numeric types
  if (typeof input === 'object' || typeof input === 'function') {
    throw new Error('Input must be a number or numeric string');
  }

  // For strings, check for SQL injection patterns first
  if (typeof input === 'string') {
    const sqlPatterns = [
      /['";]/,                    // Quotes and semicolons
      /--/,                       // SQL comments
      /\bDROP\b/i,               // SQL keywords
      /\bDELETE\b/i,
      /\bUPDATE\b/i,
      /\bINSERT\b/i,
      /\bSELECT\b/i,
      /\bUNION\b/i,
      /\bOR\b/i,
      /\bAND\b/i,
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(input)) {
        throw new Error('Input contains potentially malicious SQL patterns');
      }
    }

    // Only allow pure numeric strings
    if (!/^\s*-?\d+\s*$/.test(input)) {
      throw new Error('Input must be a valid integer');
    }
  }

  const num = parseInt(input, 10);

  if (isNaN(num) || !Number.isInteger(num)) {
    throw new Error('Input must be a valid integer');
  }

  if (num < min || num > max) {
    throw new Error(`Integer must be between ${min} and ${max}`);
  }

  return num;
}

/**
 * Validates enum values
 * @param {any} input - The input to validate
 * @param {string[]} allowedValues - Array of allowed values
 * @returns {string} - Validated enum value
 * @throws {Error} - If validation fails
 */
function validateEnum(input, allowedValues) {
  if (typeof input !== 'string') {
    throw new Error('Enum input must be a string');
  }

  if (!allowedValues.includes(input)) {
    throw new Error(`Value must be one of: ${allowedValues.join(', ')}`);
  }

  return input;
}

/**
 * Validates array of integers (for order operations)
 * @param {any} input - The input to validate
 * @param {number} maxLength - Maximum array length
 * @returns {number[]} - Validated array of integers
 * @throws {Error} - If validation fails
 */
function validateIntegerArray(input, maxLength = 1000) {
  if (!Array.isArray(input)) {
    throw new Error('Input must be an array');
  }

  if (input.length > maxLength) {
    throw new Error(`Array exceeds maximum length of ${maxLength}`);
  }

  const validatedArray = input.map((item, index) => {
    try {
      return validateInteger(item, 1);
    } catch (error) {
      throw new Error(`Invalid integer at index ${index}: ${error.message}`);
    }
  });

  return validatedArray;
}

/**
 * Sanitizes notes/description text
 * @param {any} input - The input to validate
 * @param {number} maxLength - Maximum allowed length
 * @returns {string|null} - Sanitized text or null if empty
 */
function validateNotes(input, maxLength = 2000) {
  if (input === null || input === undefined || input === '') {
    return null;
  }

  if (typeof input !== 'string') {
    throw new Error('Notes must be a string');
  }

  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return null;
  }

  if (trimmed.length > maxLength) {
    throw new Error(`Notes exceed maximum length of ${maxLength} characters`);
  }

  // Check for dangerous SQL patterns in notes
  const dangerousPatterns = [
    /\bDROP\s+TABLE\b/i,
    /\bDELETE\s+FROM\b/i,
    /\bTRUNCATE\b/i,
    /\bALTER\s+TABLE\b/i,
    /\bEXEC\b/i,
    /\bEVAL\b/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(trimmed)) {
      throw new Error('Notes contain potentially dangerous content');
    }
  }

  // Remove control characters but allow newlines and tabs for formatting
  const sanitized = trimmed.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return sanitized;
}

module.exports = {
  validateString,
  validateInteger,
  validateEnum,
  validateIntegerArray,
  validateNotes
};
