import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { LogsComponent } from './logs.component';
import { LoggingService, LogLevel } from '../../services/logging.service';

describe('LogsComponent', () => {
  let component: LogsComponent;
  let fixture: ComponentFixture<LogsComponent>;
  let loggingService: LoggingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogsComponent, FormsModule],
      providers: [LoggingService]
    }).compileComponents();

    fixture = TestBed.createComponent(LogsComponent);
    component = fixture.componentInstance;
    loggingService = TestBed.inject(LoggingService);

    // Clear logs before each test
    loggingService.clearLogs();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load logs on init', () => {
      loggingService.info('Test log');
      component.ngOnInit();

      expect(component.logs.length).toBeGreaterThan(0);
    });

    it('should update stats on init', () => {
      loggingService.error('Error log');
      loggingService.warn('Warning log');
      component.ngOnInit();

      expect(component.stats.total).toBeGreaterThan(0);
      expect(component.stats.byLevel[LogLevel.ERROR]).toBeGreaterThan(0);
    });

    it('should extract contexts on init', () => {
      loggingService.info('Test', 'Context1');
      loggingService.info('Test', 'Context2');
      component.ngOnInit();

      expect(component.availableContexts.length).toBeGreaterThan(0);
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      loggingService.error('Error message');
      loggingService.warn('Warning message');
      loggingService.info('Info message', 'TestContext');
      loggingService.debug('Debug message');
      component.loadLogs();
    });

    it('should filter by log level', () => {
      component.selectedLevel = LogLevel.ERROR;
      component.applyFilters();

      expect(component.filteredLogs.every(log => log.level === LogLevel.ERROR)).toBe(true);
    });

    it('should filter by context', () => {
      component.selectedContext = 'TestContext';
      component.applyFilters();

      expect(component.filteredLogs.every(log => log.context === 'TestContext')).toBe(true);
    });

    it('should filter by search term in message', () => {
      component.searchTerm = 'Error';
      component.applyFilters();

      expect(component.filteredLogs.length).toBeGreaterThan(0);
      expect(component.filteredLogs.some(log =>
        log.message.toLowerCase().includes('error')
      )).toBe(true);
    });

    it('should combine multiple filters', () => {
      component.selectedLevel = LogLevel.INFO;
      component.selectedContext = 'TestContext';
      component.applyFilters();

      expect(component.filteredLogs.every(log =>
        log.level === LogLevel.INFO && log.context === 'TestContext'
      )).toBe(true);
    });

    it('should clear all filters', () => {
      component.selectedLevel = LogLevel.ERROR;
      component.selectedContext = 'TestContext';
      component.searchTerm = 'test';

      component.clearFilters();

      expect(component.selectedLevel).toBe('ALL' as any);
      expect(component.selectedContext).toBe('ALL');
      expect(component.searchTerm).toBe('');
    });
  });

  describe('Log Management', () => {
    it('should clear logs when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      loggingService.info('Test log');
      loggingService.info('Test log 2');
      loggingService.info('Test log 3');
      component.loadLogs();

      const initialCount = component.logs.length;
      component.clearLogs();

      // After clearing, only the "Logs cleared by user" message should remain
      expect(component.logs.length).toBeLessThanOrEqual(1);
      expect(initialCount).toBeGreaterThan(component.logs.length);
    });

    it('should not clear logs when cancelled', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      loggingService.info('Test log');
      component.loadLogs();

      const initialCount = component.logs.length;
      component.clearLogs();

      expect(component.logs.length).toBe(initialCount);
    });

    it('should reload logs manually', () => {
      component.loadLogs();
      const initialCount = component.logs.length;

      loggingService.info('New log');
      component.loadLogs();

      expect(component.logs.length).toBeGreaterThan(initialCount);
    });
  });

  describe('Auto-refresh', () => {
    it('should enable auto-refresh', () => {
      component.toggleAutoRefresh();
      expect(component.autoRefresh).toBe(true);
    });

    it('should disable auto-refresh', () => {
      component.toggleAutoRefresh();
      expect(component.autoRefresh).toBe(true);

      component.toggleAutoRefresh();
      expect(component.autoRefresh).toBe(false);
    });

    it('should clear interval on destroy when auto-refresh is enabled', () => {
      component.toggleAutoRefresh();
      spyOn(window, 'clearInterval');

      component.ngOnDestroy();

      expect(window.clearInterval).toHaveBeenCalled();
    });
  });

  describe('Export and Import', () => {
    beforeEach(() => {
      loggingService.error('Error log');
      loggingService.info('Info log', 'TestContext', { key: 'value' });
      component.loadLogs();
    });

    it('should export logs with checksum', () => {
      spyOn(window.URL, 'createObjectURL').and.returnValue('blob:url');
      spyOn(window.URL, 'revokeObjectURL');

      component.exportLogs();

      expect(window.URL.createObjectURL).toHaveBeenCalled();
      expect(window.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should generate consistent checksum', () => {
      const data = JSON.stringify({ test: 'data' });
      const checksum1 = (component as any).generateChecksum(data);
      const checksum2 = (component as any).generateChecksum(data);

      expect(checksum1).toBe(checksum2);
    });

    it('should generate different checksum for different data', () => {
      const data1 = JSON.stringify({ test: 'data1' });
      const data2 = JSON.stringify({ test: 'data2' });

      const checksum1 = (component as any).generateChecksum(data1);
      const checksum2 = (component as any).generateChecksum(data2);

      expect(checksum1).not.toBe(checksum2);
    });

    it('should validate imported file with correct checksum', () => {
      const logs = [{ level: LogLevel.INFO, message: 'Test', timestamp: new Date() }];
      const logsJson = JSON.stringify(logs);
      const checksum = (component as any).generateChecksum(logsJson);

      const importData = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        checksum,
        totalLogs: 1,
        logs
      };

      const blob = new Blob([JSON.stringify(importData)]);
      const file = new File([blob], 'test.json', { type: 'application/json' });

      spyOn(window, 'alert');

      const event = {
        target: { files: [file], value: '' }
      } as any;

      component.importLogs(event);

      // Wait for FileReader
      setTimeout(() => {
        expect(window.alert).toHaveBeenCalledWith(jasmine.stringContaining('validated successfully'));
      }, 100);
    });

    it('should reject imported file with incorrect checksum', () => {
      const logs = [{ level: LogLevel.INFO, message: 'Test', timestamp: new Date() }];
      const logsJson = JSON.stringify(logs);

      const importData = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        checksum: 'invalid-checksum',
        totalLogs: 1,
        logs
      };

      const blob = new Blob([JSON.stringify(importData)]);
      const file = new File([blob], 'test.json', { type: 'application/json' });

      spyOn(window, 'alert');

      const event = {
        target: { files: [file], value: '' }
      } as any;

      component.importLogs(event);

      // Wait for FileReader
      setTimeout(() => {
        expect(window.alert).toHaveBeenCalledWith(jasmine.stringContaining('validation failed'));
      }, 100);
    });
  });

  describe('UI Helper Methods', () => {
    it('should return correct level class for ERROR', () => {
      expect(component.getLevelClass(LogLevel.ERROR)).toBe('log-error');
    });

    it('should return correct level class for WARN', () => {
      expect(component.getLevelClass(LogLevel.WARN)).toBe('log-warn');
    });

    it('should return correct level class for INFO', () => {
      expect(component.getLevelClass(LogLevel.INFO)).toBe('log-info');
    });

    it('should return correct level class for DEBUG', () => {
      expect(component.getLevelClass(LogLevel.DEBUG)).toBe('log-debug');
    });

    it('should format timestamp correctly', () => {
      const date = new Date('2025-01-01T12:00:00Z');
      const formatted = component.formatTimestamp(date);

      expect(formatted).toContain('2025');
    });

    it('should format data as JSON', () => {
      const data = { key: 'value', nested: { prop: 123 } };
      const formatted = component.formatData(data);

      expect(formatted).toContain('"key"');
      expect(formatted).toContain('"value"');
    });

    it('should detect when log has data', () => {
      const logWithData = { data: { key: 'value' } } as any;
      const logWithoutData = { data: undefined } as any;

      expect(component.hasData(logWithData)).toBe(true);
      expect(component.hasData(logWithoutData)).toBe(false);
    });

    it('should detect when log has error', () => {
      const logWithError = { error: new Error('Test') } as any;
      const logWithoutError = { error: undefined } as any;

      expect(component.hasError(logWithError)).toBe(true);
      expect(component.hasError(logWithoutError)).toBe(false);
    });
  });

  describe('Statistics', () => {
    it('should calculate total logs correctly', () => {
      loggingService.error('Error 1');
      loggingService.error('Error 2');
      loggingService.info('Info 1');
      component.loadLogs();

      expect(component.stats.total).toBeGreaterThanOrEqual(3);
    });

    it('should count logs by level correctly', () => {
      loggingService.error('Error 1');
      loggingService.error('Error 2');
      loggingService.warn('Warning 1');
      component.loadLogs();

      expect(component.stats.byLevel[LogLevel.ERROR]).toBeGreaterThanOrEqual(2);
      expect(component.stats.byLevel[LogLevel.WARN]).toBeGreaterThanOrEqual(1);
    });

    it('should handle zero logs gracefully', () => {
      loggingService.clearLogs();
      component.loadLogs();

      expect(component.stats.total).toBe(0);
      expect(component.stats.byLevel[LogLevel.ERROR]).toBe(0);
    });
  });
});
