import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ProcessTechnologyGroup,
  MaturityStageImplementation,
  Assessment,
  AssessmentStatus,
  FunctionCapability,
  MaturityStage
} from '../../models/ztmm.models';

export interface AssessmentUpdate {
  achieved_maturity_stage_id: number;
  target_maturity_stage_id: number | null;
  implementation_status: AssessmentStatus;
  notes: string;
}

@Component({
  selector: 'app-v2-assessment-item',
  templateUrl: './v2-assessment-item.component.html',
  styleUrls: ['./v2-assessment-item.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class V2AssessmentItemComponent implements OnInit {
  @Input() group!: ProcessTechnologyGroup;
  @Input() itemNumber!: number;
  @Input() assessment: Assessment | null = null;
  @Input() stageImplementations: MaturityStageImplementation[] = [];
  @Input() functionCapabilities: FunctionCapability[] = [];
  @Input() maturityStages: MaturityStage[] = [];
  @Input() statusOptions: AssessmentStatus[] = [];
  @Input() isAutoSaving = false;
  @Input() showDescription = true;

  @Output() assessmentChange = new EventEmitter<AssessmentUpdate>();

  // Local state
  achievedStageId: number = 0; // 0 = none achieved
  targetStageId: number | null = null;
  implementationStatus: AssessmentStatus = 'Not Implemented';
  notes: string = '';

  // UI state
  showDetails = false;

  ngOnInit() {
    if (this.assessment) {
      this.achievedStageId = this.assessment.achieved_maturity_stage_id;
      this.targetStageId = this.assessment.target_maturity_stage_id;
      this.implementationStatus = this.assessment.implementation_status;
      this.notes = this.assessment.notes;
    }
  }

  getFunctionCapabilityName(id: number): string {
    return this.functionCapabilities.find(fc => fc.id === id)?.name || 'Unknown';
  }

  getMaturityStageName(id: number): string {
    return this.maturityStages.find(ms => ms.id === id)?.name || 'Unknown';
  }

  getStageImplementation(stageId: number): MaturityStageImplementation | undefined {
    return this.stageImplementations.find(si => si.maturity_stage_id === stageId);
  }

  getAvailableStages(): MaturityStage[] {
    // Return stages that have implementations for this group
    return this.maturityStages.filter(stage =>
      this.stageImplementations.some(si => si.maturity_stage_id === stage.id)
    );
  }

  getAvailableTargetStages(): MaturityStage[] {
    // Target can be any stage higher than achieved
    return this.getAvailableStages().filter(stage => stage.id > this.achievedStageId);
  }

  onAchievedStageChange(stageId: number): void {
    this.achievedStageId = stageId;

    // If target is now <= achieved, clear it
    if (this.targetStageId !== null && this.targetStageId <= this.achievedStageId) {
      this.targetStageId = null;
    }

    this.emitChange();
  }

  onTargetStageChange(stageId: number | null): void {
    this.targetStageId = stageId;
    this.emitChange();
  }

  onStatusChange(status: AssessmentStatus): void {
    this.implementationStatus = status;
    this.emitChange();
  }

  onNotesChange(notes: string): void {
    this.notes = notes;
    this.emitChange();
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  private emitChange(): void {
    this.assessmentChange.emit({
      achieved_maturity_stage_id: this.achievedStageId,
      target_maturity_stage_id: this.targetStageId,
      implementation_status: this.implementationStatus,
      notes: this.notes
    });
  }

  // Helper to get stage badge color
  getStageBadgeClass(stageId: number): string {
    if (stageId === this.achievedStageId) return 'bg-success';
    if (stageId === this.targetStageId) return 'bg-warning text-dark';
    return 'bg-light text-dark';
  }

  getStageIcon(stageId: number): string {
    if (stageId === this.achievedStageId) return 'bi-check-circle-fill';
    if (stageId === this.targetStageId) return 'bi-arrow-right-circle';
    if (stageId < this.achievedStageId) return 'bi-check-circle';
    return 'bi-circle';
  }
}
