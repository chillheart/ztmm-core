import { TestBed } from '@angular/core/testing';
import { LoggingService, LogLevel } from './logging.service';

describe('LoggingService', () => {
  let service: LoggingService;
  let consoleErrorSpy: jasmine.Spy;
  let consoleWarnSpy: jasmine.Spy;
  let consoleInfoSpy: jasmine.Spy;
  let consoleDebugSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoggingService);

    // Spy on console methods
    consoleErrorSpy = spyOn(console, 'error');
    consoleWarnSpy = spyOn(console, 'warn');
    consoleInfoSpy = spyOn(console, 'info');
    consoleDebugSpy = spyOn(console, 'debug');

    // Clear logs before each test
    service.clearLogs();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Configuration', () => {
    it('should have default configuration', () => {
      const config = service.getConfig();
      // Default should be DEBUG when running on localhost (in tests)
      expect(config.level).toBe(LogLevel.DEBUG);
      expect(config.enableConsole).toBe(true);
      expect(config.enableTimestamps).toBe(true);
    });

    it('should allow configuration changes', () => {
      service.configure({ level: LogLevel.DEBUG, enableTimestamps: false });
      const config = service.getConfig();
      expect(config.level).toBe(LogLevel.DEBUG);
      expect(config.enableTimestamps).toBe(false);
      expect(config.enableConsole).toBe(true); // Should preserve unmodified values
    });
  });

  describe('Logging Levels', () => {
    it('should log error messages', () => {
      service.error('Test error message');
      expect(consoleErrorSpy).toHaveBeenCalled();

      const logs = service.getLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].level).toBe(LogLevel.ERROR);
      expect(logs[0].message).toBe('Test error message');
    });

    it('should log warning messages', () => {
      service.warn('Test warning message');
      expect(consoleWarnSpy).toHaveBeenCalled();

      const logs = service.getLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].level).toBe(LogLevel.WARN);
    });

    it('should log info messages', () => {
      service.info('Test info message');
      expect(consoleInfoSpy).toHaveBeenCalled();

      const logs = service.getLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].level).toBe(LogLevel.INFO);
    });

    it('should log debug messages when level is DEBUG', () => {
      service.configure({ level: LogLevel.DEBUG });
      service.debug('Test debug message');
      expect(consoleDebugSpy).toHaveBeenCalled();

      const logs = service.getLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].level).toBe(LogLevel.DEBUG);
    });

    it('should not log debug messages when level is INFO', () => {
      service.configure({ level: LogLevel.INFO });
      service.debug('Test debug message');
      expect(consoleDebugSpy).not.toHaveBeenCalled();

      const logs = service.getLogs();
      expect(logs.length).toBe(0);
    });
  });

  describe('Log Context and Data', () => {
    it('should store context information', () => {
      service.info('Test message', 'TestContext');
      const logs = service.getLogs();
      expect(logs[0].context).toBe('TestContext');
    });

    it('should store additional data', () => {
      const testData = { key: 'value', number: 42 };
      service.info('Test message', 'TestContext', testData);
      const logs = service.getLogs();
      expect(logs[0].data).toEqual(testData);
    });

    it('should store error objects', () => {
      const error = new Error('Test error');
      service.error('Error occurred', error, 'TestContext');
      const logs = service.getLogs();
      expect(logs[0].error).toBe(error);
    });
  });

  describe('Console Output', () => {
    it('should not output to console when disabled', () => {
      service.configure({ enableConsole: false });
      service.error('Test error');
      service.warn('Test warning');
      service.info('Test info');

      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
    });

    it('should include timestamp in console output when enabled', () => {
      service.configure({ enableTimestamps: true });
      service.info('Test message');

      expect(consoleInfoSpy).toHaveBeenCalled();
      const call = consoleInfoSpy.calls.first();
      expect(call.args[0]).toContain('[');
      expect(call.args[0]).toContain('T'); // ISO timestamp format
    });

    it('should not include timestamp when disabled', () => {
      service.configure({ enableTimestamps: false });
      service.info('Test message');

      expect(consoleInfoSpy).toHaveBeenCalled();
      const call = consoleInfoSpy.calls.first();
      expect(call.args[0]).toBe('Test message');
    });

    it('should include context in console output', () => {
      service.info('Test message', 'TestContext');

      const call = consoleInfoSpy.calls.first();
      expect(call.args[0]).toContain('[TestContext]');
    });
  });

  describe('Log Storage', () => {
    it('should store logs in memory', () => {
      service.error('Error 1');
      service.warn('Warning 1');
      service.info('Info 1');

      const logs = service.getLogs();
      expect(logs.length).toBe(3);
    });

    it('should filter logs by level', () => {
      service.error('Error 1');
      service.warn('Warning 1');
      service.info('Info 1');

      const errorLogs = service.getLogs(LogLevel.ERROR);
      expect(errorLogs.length).toBe(1);
      expect(errorLogs[0].message).toBe('Error 1');
    });

    it('should clear logs', () => {
      service.error('Error 1');
      service.warn('Warning 1');
      service.clearLogs();

      const logs = service.getLogs();
      expect(logs.length).toBe(0);
    });

    it('should limit stored logs to MAX_LOGS', () => {
      const maxLogs = 1000;

      // Add more logs than the limit
      for (let i = 0; i < maxLogs + 100; i++) {
        service.info(`Log ${i}`);
      }

      const logs = service.getLogs();
      expect(logs.length).toBe(maxLogs);

      // Should keep the most recent logs
      expect(logs[logs.length - 1].message).toBe(`Log ${maxLogs + 99}`);
    });
  });

  describe('Log Export and Summary', () => {
    it('should export logs as JSON', () => {
      service.error('Error 1');
      service.info('Info 1');

      const exported = service.exportLogs();
      const parsed = JSON.parse(exported);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(2);
      expect(parsed[0].message).toBe('Error 1');
    });

    it('should generate logs summary', () => {
      service.error('Error 1');
      service.error('Error 2');
      service.warn('Warning 1');
      service.info('Info 1');

      const summary = service.getLogsSummary();
      expect(summary[LogLevel.ERROR]).toBe(2);
      expect(summary[LogLevel.WARN]).toBe(1);
      expect(summary[LogLevel.INFO]).toBe(1);
    });
  });

  describe('Level Filtering', () => {
    it('should only log ERROR when level is ERROR', () => {
      service.configure({ level: LogLevel.ERROR });

      service.error('Error');
      service.warn('Warning');
      service.info('Info');
      service.debug('Debug');

      const logs = service.getLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].level).toBe(LogLevel.ERROR);
    });

    it('should log ERROR and WARN when level is WARN', () => {
      service.configure({ level: LogLevel.WARN });

      service.error('Error');
      service.warn('Warning');
      service.info('Info');
      service.debug('Debug');

      const logs = service.getLogs();
      expect(logs.length).toBe(2);
      expect(logs[0].level).toBe(LogLevel.ERROR);
      expect(logs[1].level).toBe(LogLevel.WARN);
    });

    it('should log ERROR, WARN, and INFO when level is INFO', () => {
      service.configure({ level: LogLevel.INFO });

      service.error('Error');
      service.warn('Warning');
      service.info('Info');
      service.debug('Debug');

      const logs = service.getLogs();
      expect(logs.length).toBe(3);
    });

    it('should log all levels when level is DEBUG', () => {
      service.configure({ level: LogLevel.DEBUG });

      service.error('Error');
      service.warn('Warning');
      service.info('Info');
      service.debug('Debug');

      const logs = service.getLogs();
      expect(logs.length).toBe(4);
    });
  });
});
