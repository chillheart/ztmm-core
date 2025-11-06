import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoggingService, LogLevel, LogEntry } from '../../services/logging.service';
import { Subscription } from 'rxjs';

interface LogStats {
  total: number;
  byLevel: Record<LogLevel, number>;
}

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit, OnDestroy {
  private readonly LOG_CONTEXT = 'LogsComponent';
  private subscriptions = new Subscription();

  logs: readonly Readonly<LogEntry>[] = [];
  filteredLogs: readonly Readonly<LogEntry>[] = [];

  // Filter options
  selectedLevel: LogLevel | 'ALL' = 'ALL';
  searchTerm = '';
  selectedContext: string | 'ALL' = 'ALL';

  // Available contexts for filtering
  availableContexts: string[] = [];

  // Stats
  stats: LogStats = {
    total: 0,
    byLevel: {
      [LogLevel.ERROR]: 0,
      [LogLevel.WARN]: 0,
      [LogLevel.INFO]: 0,
      [LogLevel.DEBUG]: 0
    }
  };

  // UI state
  autoRefresh = false;
  private autoRefreshInterval?: number;

  // Log levels for template
  LogLevel = LogLevel;
  logLevels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];

  constructor(private logger: LoggingService) {}

  ngOnInit(): void {
    this.logger.info('Logs page initialized', this.LOG_CONTEXT);
    this.loadLogs();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }
  }

  loadLogs(): void {
    this.logs = this.logger.getLogs();
    this.updateStats();
    this.extractContexts();
    this.applyFilters();
  }

  private updateStats(): void {
    this.stats.total = this.logs.length;
    const summary = this.logger.getLogsSummary();
    this.stats.byLevel = {
      [LogLevel.ERROR]: summary[LogLevel.ERROR] || 0,
      [LogLevel.WARN]: summary[LogLevel.WARN] || 0,
      [LogLevel.INFO]: summary[LogLevel.INFO] || 0,
      [LogLevel.DEBUG]: summary[LogLevel.DEBUG] || 0
    };
  }

  private extractContexts(): void {
    const contexts = new Set<string>();
    this.logs.forEach(log => {
      if (log.context) {
        contexts.add(log.context);
      }
    });
    this.availableContexts = Array.from(contexts).sort();
  }

  applyFilters(): void {
    let filtered = [...this.logs];

    // Filter by level
    if (this.selectedLevel !== 'ALL') {
      filtered = filtered.filter(log => log.level === this.selectedLevel);
    }

    // Filter by context
    if (this.selectedContext !== 'ALL') {
      filtered = filtered.filter(log => log.context === this.selectedContext);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(term) ||
        (log.context && log.context.toLowerCase().includes(term)) ||
        (log.error && log.error.message.toLowerCase().includes(term))
      );
    }

    this.filteredLogs = filtered;
  }

  clearFilters(): void {
    this.selectedLevel = 'ALL';
    this.searchTerm = '';
    this.selectedContext = 'ALL';
    this.applyFilters();
  }

  clearLogs(): void {
    if (confirm('Are you sure you want to clear all logs? This cannot be undone.')) {
      this.logger.clearLogs();
      this.logger.info('Logs cleared by user', this.LOG_CONTEXT);
      this.loadLogs();
    }
  }

  exportLogs(): void {
    try {
      const exportData = this.logger.exportLogs();
      const logsToExport = this.selectedLevel === 'ALL' && this.searchTerm === '' && this.selectedContext === 'ALL'
        ? this.logs
        : this.filteredLogs;

      // Generate checksum for validation
      const checksum = this.generateChecksum(exportData);

      const exportPayload = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        checksum,
        totalLogs: logsToExport.length,
        filters: {
          level: this.selectedLevel,
          context: this.selectedContext,
          searchTerm: this.searchTerm
        },
        logs: JSON.parse(exportData)
      };

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ztmm-logs-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      window.URL.revokeObjectURL(url);

      this.logger.info('Logs exported successfully', this.LOG_CONTEXT, {
        count: logsToExport.length,
        checksum
      });
    } catch (error) {
      this.logger.error('Failed to export logs', error as Error, this.LOG_CONTEXT);
      alert('Failed to export logs. Please try again.');
    }
  }

  importLogs(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importData = JSON.parse(content);

        // Validate checksum
        const logsJson = JSON.stringify(importData.logs);
        const calculatedChecksum = this.generateChecksum(logsJson);

        if (importData.checksum !== calculatedChecksum) {
          this.logger.error('Log file validation failed - checksum mismatch', undefined, this.LOG_CONTEXT, {
            expected: importData.checksum,
            actual: calculatedChecksum
          });
          alert('⚠️ Log file validation failed! The file may have been tampered with or corrupted.');
          return;
        }

        // If validation passes, show the imported data (read-only view)
        this.logger.info('Log file validated successfully', this.LOG_CONTEXT, {
          totalLogs: importData.totalLogs,
          exportDate: importData.exportDate
        });

        alert(`✅ Log file validated successfully!\n\nExport Date: ${importData.exportDate}\nTotal Logs: ${importData.totalLogs}\nChecksum: ${calculatedChecksum}`);

        // Note: We don't actually import logs into the service since they're immutable
        // This is just for viewing/validation purposes
      } catch (error) {
        this.logger.error('Failed to import logs', error as Error, this.LOG_CONTEXT);
        alert('Failed to import logs. Please check the file format.');
      } finally {
        // Reset the input
        input.value = '';
      }
    };

    reader.readAsText(file);
  }

  private generateChecksum(data: string): string {
    // Simple hash function for checksum generation
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  toggleAutoRefresh(): void {
    this.autoRefresh = !this.autoRefresh;

    if (this.autoRefresh) {
      this.autoRefreshInterval = window.setInterval(() => {
        this.loadLogs();
      }, 2000); // Refresh every 2 seconds
      this.logger.info('Auto-refresh enabled', this.LOG_CONTEXT);
    } else {
      if (this.autoRefreshInterval) {
        clearInterval(this.autoRefreshInterval);
        this.autoRefreshInterval = undefined;
      }
      this.logger.info('Auto-refresh disabled', this.LOG_CONTEXT);
    }
  }

  getLevelClass(level: LogLevel): string {
    switch (level) {
      case LogLevel.ERROR:
        return 'log-error';
      case LogLevel.WARN:
        return 'log-warn';
      case LogLevel.INFO:
        return 'log-info';
      case LogLevel.DEBUG:
        return 'log-debug';
      default:
        return '';
    }
  }

  formatTimestamp(timestamp: Date): string {
    return new Date(timestamp).toLocaleString();
  }

  formatData(data: unknown): string {
    if (!data) {
      return '';
    }
    return JSON.stringify(data, null, 2);
  }

  hasData(log: Readonly<LogEntry>): boolean {
    return log.data !== undefined && log.data !== null;
  }

  hasError(log: Readonly<LogEntry>): boolean {
    return log.error !== undefined;
  }
}
