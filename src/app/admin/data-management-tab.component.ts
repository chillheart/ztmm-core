import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-data-management-tab',
  templateUrl: './data-management-tab.component.html',
  styleUrls: ['./data-management-tab.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class DataManagementTabComponent {
  @Input() dataStatistics = {
    pillars: 0,
    functionCapabilities: 0,
    maturityStages: 0,
    technologiesProcesses: 0,
    assessmentResponses: 0
  };
  @Input() isExporting = false;
  @Input() isImporting = false;
  @Input() isResetting = false;

  @Output() exportData = new EventEmitter<void>();
  @Output() fileSelected = new EventEmitter<Event>();
  @Output() resetDatabase = new EventEmitter<void>();

  onExportData() {
    this.exportData.emit();
  }

  onFileSelected(event: Event) {
    this.fileSelected.emit(event);
  }

  onResetDatabase() {
    this.resetDatabase.emit();
  }
}
