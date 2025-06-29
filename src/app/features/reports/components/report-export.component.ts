import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ExportFormat = 'html' | 'csv' | 'pdf';

@Component({
  selector: 'app-report-export',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="btn-group position-relative" role="group">
      <button
        type="button"
        class="btn btn-outline-primary dropdown-toggle"
        (click)="toggleDropdown()"
        [disabled]="isExporting || !hasData"
        [class.active]="dropdownOpen"
        title="Export assessment report">
        <i class="bi bi-file-earmark-pdf me-2"></i>
        <span *ngIf="!isExporting">Export Report</span>
        <span *ngIf="isExporting">
          <span class="spinner-border spinner-border-sm me-2" role="status"></span>
          Generating...
        </span>
      </button>
      <ul class="dropdown-menu" [class.show]="dropdownOpen">
        <li>
          <button type="button"
                  class="dropdown-item"
                  (click)="exportReport('html')"
                  [disabled]="isExporting">
            <i class="bi bi-filetype-html me-2"></i>
            HTML Export
          </button>
        </li>
        <li>
          <button type="button"
                  class="dropdown-item"
                  (click)="exportReport('csv')"
                  [disabled]="isExporting">
            <i class="bi bi-filetype-csv me-2"></i>
            CSV Export
          </button>
        </li>
      </ul>
    </div>
  `,
  styles: [`
    .dropdown-menu {
      border-radius: 0.375rem;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }

    .dropdown-item {
      transition: background-color 0.15s ease-in-out;
    }

    .dropdown-item:hover:not(:disabled) {
      background-color: var(--bs-primary);
      color: white;
    }

    .dropdown-item:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class ReportExportComponent {
  @Input() isExporting = false;
  @Input() hasData = false;
  @Output() exportRequested = new EventEmitter<ExportFormat>();

  dropdownOpen = false;

  toggleDropdown(): void {
    if (!this.isExporting && this.hasData) {
      this.dropdownOpen = !this.dropdownOpen;
    }
  }

  closeDropdown(): void {
    this.dropdownOpen = false;
  }

  exportReport(format: ExportFormat): void {
    this.closeDropdown();
    this.exportRequested.emit(format);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdownButton = target.closest('.btn-group');
    if (!dropdownButton && this.dropdownOpen) {
      this.dropdownOpen = false;
    }
  }
}
