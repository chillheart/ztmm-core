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
    processTechnologyGroups: 0,
    maturityStageImplementations: 0,
    assessments: 0
  };
  @Input() isExporting = false;
  @Input() isImporting = false;
  @Input() isResetting = false;
  @Input() isGeneratingDemo = false;
  @Input() demoDataExists = false;
  @Input() demoDataStats: {
    functionsWithData: number;
    totalTechnologies: number;
    totalProcesses: number;
    totalItems: number;
  } | null = null;

  @Output() exportData = new EventEmitter<void>();
  @Output() fileSelected = new EventEmitter<Event>();
  @Output() resetDatabase = new EventEmitter<void>();
  @Output() generateDemoData = new EventEmitter<void>();

  onExportData() {
    this.exportData.emit();
  }

  onFileSelected(event: Event) {
    this.fileSelected.emit(event);
  }

  onResetDatabase() {
    this.resetDatabase.emit();
  }

  onGenerateDemoData() {
    this.generateDemoData.emit();
  }
}
