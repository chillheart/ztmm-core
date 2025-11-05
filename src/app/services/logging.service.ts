import { Injectable } from '@angular/core';

/**
 * Logging levels for the application
 */
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

/**
 * Configuration for the logging service
 */
export interface LoggingConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableTimestamps: boolean;
}

/**
 * Structured log entry
 */
export interface LogEntry {
  level: LogLevel;
  timestamp: Date;
  message: string;
  context?: string;
  data?: unknown;
  error?: Error;
}

/**
 * Centralized logging service for the application.
 * Provides structured logging with configurable levels and outputs.
 *
 * Usage:
 * - Use ERROR for unrecoverable errors
 * - Use WARN for recoverable issues or deprecation warnings
 * - Use INFO for important state changes and user actions
 * - Use DEBUG for detailed diagnostic information
 */
@Injectable({ providedIn: 'root' })
export class LoggingService {
  private config: LoggingConfig = {
    level: this.getDefaultLogLevel(),
    enableConsole: true,
    enableTimestamps: true
  };

  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 1000; // Prevent memory issues

  /**
   * Determine default log level based on environment
   * Enables DEBUG logging when running on localhost
   */
  private getDefaultLogLevel(): LogLevel {
    if (typeof window !== 'undefined' && window.location) {
      const hostname = window.location.hostname;
      // Enable debug logging on localhost or 127.0.0.1
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
        return LogLevel.DEBUG;
      }
    }
    return LogLevel.INFO;
  }

  /**
   * Configure the logging service
   */
  configure(config: Partial<LoggingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current logging configuration
   */
  getConfig(): LoggingConfig {
    return { ...this.config };
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error, context?: string, data?: unknown): void {
    this.log(LogLevel.ERROR, message, context, data, error);
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  /**
   * Log an informational message
   */
  info(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  /**
   * Internal logging method
   */
  private log(level: LogLevel, message: string, context?: string, data?: unknown, error?: Error): void {
    if (level > this.config.level) {
      return; // Skip logs below current level
    }

    const entry: LogEntry = {
      level,
      timestamp: new Date(),
      message,
      context,
      data,
      error
    };

    // Store log entry
    this.logs.push(entry);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift(); // Remove oldest log
    }

    // Output to console if enabled
    if (this.config.enableConsole) {
      this.outputToConsole(entry);
    }
  }

  /**
   * Output log entry to console
   */
  private outputToConsole(entry: LogEntry): void {
    const timestamp = this.config.enableTimestamps
      ? `[${entry.timestamp.toISOString()}]`
      : '';

    const contextStr = entry.context ? `[${entry.context}]` : '';
    const prefix = `${timestamp}${contextStr}`.trim();
    const fullMessage = prefix ? `${prefix} ${entry.message}` : entry.message;

    switch (entry.level) {
      case LogLevel.ERROR:
        if (entry.error) {
          // eslint-disable-next-line no-console
          console.error(fullMessage, entry.data || '', entry.error);
        } else {
          // eslint-disable-next-line no-console
          console.error(fullMessage, entry.data || '');
        }
        break;
      case LogLevel.WARN:
        // eslint-disable-next-line no-console
        console.warn(fullMessage, entry.data || '');
        break;
      case LogLevel.INFO:
        // eslint-disable-next-line no-console
        console.info(fullMessage, entry.data || '');
        break;
      case LogLevel.DEBUG:
        // eslint-disable-next-line no-console
        console.debug(fullMessage, entry.data || '');
        break;
    }
  }

  /**
   * Get all stored log entries
   */
  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  /**
   * Clear all stored logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON string
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Get logs summary by level
   */
  getLogsSummary(): { [key in LogLevel]?: number } {
    const summary: { [key in LogLevel]?: number } = {};
    this.logs.forEach(log => {
      summary[log.level] = (summary[log.level] || 0) + 1;
    });
    return summary;
  }
}
