import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
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
export class AssessmentItemComponent implements OnInit, OnChanges {
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

  ngOnInit() {
    console.log(`AssessmentItem for ${this.technologyProcess.name}:`);
    console.log(`  Status: ${this.status} (type: ${typeof this.status})`);
    console.log(`  Notes: ${this.notes}`);
    console.log(`  StatusOptions: ${JSON.stringify(this.statusOptions)}`);

    if (this.status && this.statusOptions.length > 0) {
      const matchesOption = this.statusOptions.includes(this.status);
      console.log(`  Status matches available option: ${matchesOption}`);
      if (!matchesOption) {
        console.warn(`  Status "${this.status}" does not match any available options!`);
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['status']) {
      console.log(`Status changed for ${this.technologyProcess?.name}: ${changes['status'].previousValue} -> ${changes['status'].currentValue}`);
    }
    if (changes['notes']) {
      console.log(`Notes changed for ${this.technologyProcess?.name}: "${changes['notes'].previousValue}" -> "${changes['notes'].currentValue}"`);
    }
  }

  onStatusChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value === '' ? null : target.value as AssessmentStatus;
    this.statusChange.emit(value);
  }

  onStatusChangeNew(value: AssessmentStatus | null): void {
    console.log(`Status changed for ${this.technologyProcess.name}: ${value}`);
    this.statusChange.emit(value);
  }

  onNotesChange(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    const value = target.value;
    console.log(`Notes changed for ${this.technologyProcess.name}: "${value}"`);
    this.notesChange.emit(value);
  }

  onNotesChangeNew(value: string): void {
    console.log(`Notes changed for ${this.technologyProcess.name}: "${value}"`);
    this.notesChange.emit(value);
  }

  getFunctionCapabilityName(id: number): string {
    return this.functionCapabilities.find(fc => fc.id === id)?.name || 'Unknown';
  }

  getMaturityStageName(id: number): string {
    return this.maturityStages.find(ms => ms.id === id)?.name || 'Unknown';
  }
}
