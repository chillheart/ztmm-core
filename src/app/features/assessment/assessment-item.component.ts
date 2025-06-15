import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TechnologyProcess, AssessmentStatus, FunctionCapability, MaturityStage } from '../../models/ztmm.models';

@Component({
  selector: 'app-assessment-item',
  templateUrl: './assessment-item.component.html',
  styleUrls: ['./assessment-item.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AssessmentItemComponent {
  @Input() technologyProcess!: TechnologyProcess;
  @Input() itemNumber!: number;
  @Input() status: AssessmentStatus | null = null;
  @Input() notes = '';
  @Input() statusOptions: AssessmentStatus[] = [];
  @Input() functionCapabilities: FunctionCapability[] = [];
  @Input() maturityStages: MaturityStage[] = [];
  @Input() isAutoSaving = false;

  @Output() statusChange = new EventEmitter<AssessmentStatus | null>();
  @Output() notesChange = new EventEmitter<string>();

  onStatusChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value === 'null' ? null : target.value as AssessmentStatus;
    this.statusChange.emit(value);
  }

  onNotesChange(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.notesChange.emit(target.value);
  }

  getFunctionCapabilityName(id: number): string {
    return this.functionCapabilities.find(fc => fc.id === id)?.name || 'Unknown';
  }

  getMaturityStageName(id: number): string {
    return this.maturityStages.find(ms => ms.id === id)?.name || 'Unknown';
  }
}
