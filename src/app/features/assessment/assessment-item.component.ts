import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ProcessTechnologyGroup,
  MaturityStageImplementation,
  Assessment,
  AssessmentStatus,
  FunctionCapability,
  MaturityStage,
  StageImplementationDetail,
  StageImplementationStatus
} from '../../models/ztmm.models';

export interface AssessmentUpdate {
  achieved_maturity_stage_id: number;
  target_maturity_stage_id: number | null;
  implementation_status: AssessmentStatus;
  notes: string;
  assessed_stages_count: number; // Number of stages that have been assessed (any status selected)
  total_stages_count: number; // Total number of stages for this group
  stageDetails: Map<number, AssessmentStatus | null>; // Individual stage selections to persist
}

@Component({
  selector: 'app-assessment-item',
  templateUrl: './assessment-item.component.html',
  styleUrls: ['./assessment-item.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AssessmentItemComponent implements OnInit {
  @Input() group!: ProcessTechnologyGroup;
  @Input() itemNumber!: number;
  @Input() assessment: Assessment | null = null;
  @Input() stageImplementations: MaturityStageImplementation[] = [];
  @Input() stageImplementationDetails: StageImplementationDetail[] = []; // Individual stage selections
  @Input() functionCapabilities: FunctionCapability[] = [];
  @Input() maturityStages: MaturityStage[] = [];
  @Input() statusOptions: AssessmentStatus[] = [];
  @Input() isAutoSaving = false;
  @Input() showDescription = true;

  @Output() assessmentChange = new EventEmitter<AssessmentUpdate>();

  // Local state
  stageStatuses = new Map<number, AssessmentStatus | null>(); // Map of stage ID to its implementation status (null = not assessed yet)
  notes = '';

  // UI state
  showDetails = false;

  ngOnInit() {
    const availableStages = this.getAvailableStages().sort((a, b) => a.id - b.id);

    if (this.assessment && this.assessment.id) {
      // Load individual stage selections from StageImplementationDetails if available
      if (this.stageImplementationDetails.length > 0) {
        // Use persisted individual stage selections
        availableStages.forEach(stage => {
          const detail = this.stageImplementationDetails.find(
            d => d.assessment_id === this.assessment!.id && d.maturity_stage_id === stage.id
          );

          if (detail) {
            // Map StageImplementationStatus to AssessmentStatus
            this.stageStatuses.set(stage.id, this.mapDetailStatusToAssessmentStatus(detail.status));
          } else {
            this.stageStatuses.set(stage.id, null);
          }
        });
      } else if (this.assessment.achieved_maturity_stage_id > 0) {
        // Fallback: reconstruct from achieved stage (legacy behavior)
        availableStages.forEach(stage => {
          if (stage.id < this.assessment!.achieved_maturity_stage_id) {
            this.stageStatuses.set(stage.id, 'Fully Implemented');
          } else if (stage.id === this.assessment!.achieved_maturity_stage_id) {
            this.stageStatuses.set(stage.id, this.assessment!.implementation_status);
          } else {
            this.stageStatuses.set(stage.id, null);
          }
        });
      } else {
        // No achieved stage, leave all blank
        availableStages.forEach(stage => {
          this.stageStatuses.set(stage.id, null);
        });
      }

      this.notes = this.assessment.notes;
    } else {
      // No assessment exists - initialize all stages to blank
      availableStages.forEach(stage => {
        this.stageStatuses.set(stage.id, null);
      });
    }
  }

  // Map between StageImplementationStatus and AssessmentStatus
  private mapDetailStatusToAssessmentStatus(status: StageImplementationStatus): AssessmentStatus {
    switch (status) {
      case 'Not Started':
        return 'Not Implemented';
      case 'In Progress':
        return 'Partially Implemented';
      case 'Completed':
        return 'Fully Implemented';
      default:
        return 'Not Implemented';
    }
  }

  private mapAssessmentStatusToDetailStatus(status: AssessmentStatus | null): StageImplementationStatus {
    if (status === null) return 'Not Started';

    switch (status) {
      case 'Not Implemented':
        return 'Not Started';
      case 'Partially Implemented':
        return 'In Progress';
      case 'Fully Implemented':
        return 'Completed';
      case 'Superseded':
        return 'Completed'; // Treat superseded as completed
      default:
        return 'Not Started';
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

  getStageStatus(stageId: number): AssessmentStatus | null {
    return this.stageStatuses.get(stageId) || null;
  }

  onStageStatusChange(stageId: number, status: AssessmentStatus): void {
    this.stageStatuses.set(stageId, status);
    this.emitChange();
  }

  onNotesChange(notes: string): void {
    this.notes = notes;
    this.emitChange();
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  getStageIcon(stageId: number): string {
    const status = this.getStageStatus(stageId);
    if (status === 'Fully Implemented') return 'bi-check-circle-fill text-success';
    if (status === 'Partially Implemented') return 'bi-hourglass-split text-warning';
    return 'bi-circle text-secondary';
  }

  getOverallMaturityLevel(): string {
    const availableStages = this.getAvailableStages().sort((a, b) => a.id - b.id);

    // Find the highest fully implemented stage
    let highestFullyImplemented: MaturityStage | null = null;
    for (const stage of availableStages) {
      const status = this.getStageStatus(stage.id);
      if (status === 'Fully Implemented') {
        highestFullyImplemented = stage;
      }
    }

    if (!highestFullyImplemented) {
      // Check if any stage is partially implemented
      const hasPartial = availableStages.some(s => this.getStageStatus(s.id) === 'Partially Implemented');
      return hasPartial ? 'In Progress' : 'Not Started';
    }

    return highestFullyImplemented.name;
  }

  getOverallMaturityBadgeClass(): string {
    const availableStages = this.getAvailableStages();

    // Check for any partial implementations
    const hasPartial = availableStages.some(s => this.getStageStatus(s.id) === 'Partially Implemented');

    // Find highest fully implemented stage
    let highestFullyImplemented: MaturityStage | null = null;
    for (const stage of availableStages.sort((a, b) => a.id - b.id)) {
      if (this.getStageStatus(stage.id) === 'Fully Implemented') {
        highestFullyImplemented = stage;
      }
    }

    if (!highestFullyImplemented) {
      return hasPartial ? 'bg-info' : 'bg-secondary';
    }

    // Check if all stages are fully implemented
    const allFullyImplemented = availableStages.every(s => this.getStageStatus(s.id) === 'Fully Implemented');
    if (allFullyImplemented) {
      return 'bg-success';
    }

    // Color based on highest fully implemented stage
    if (highestFullyImplemented.name === 'Traditional') return 'bg-danger';
    if (highestFullyImplemented.name === 'Initial') return 'bg-warning text-dark';
    if (highestFullyImplemented.name === 'Advanced') return hasPartial ? 'bg-info' : 'bg-primary';
    if (highestFullyImplemented.name === 'Optimal') return 'bg-success';

    return 'bg-primary';
  }

  private emitChange(): void {
    const availableStages = this.getAvailableStages().sort((a, b) => a.id - b.id);

    // Count assessed stages (stages where user made any selection)
    const assessed_stages_count = availableStages.filter(s => this.getStageStatus(s.id) !== null).length;
    const total_stages_count = availableStages.length;

    // Find the highest fully implemented stage
    let achieved_maturity_stage_id = 0;
    for (const stage of availableStages) {
      const status = this.getStageStatus(stage.id);
      if (status === 'Fully Implemented') {
        achieved_maturity_stage_id = stage.id;
      }
    }

    // Calculate target stage (next stage after highest fully implemented)
    let target_maturity_stage_id: number | null = null;
    if (achieved_maturity_stage_id > 0) {
      const nextStage = availableStages.find(s => s.id > achieved_maturity_stage_id);
      target_maturity_stage_id = nextStage ? nextStage.id : null;
    } else {
      // If no stage fully implemented, target is the first stage
      target_maturity_stage_id = availableStages.length > 0 ? availableStages[0].id : null;
    }

    // Determine overall implementation status
    let implementation_status: AssessmentStatus;
    const hasAnyImplementation = availableStages.some(s => {
      const status = this.getStageStatus(s.id);
      return status !== null && status !== 'Not Implemented';
    });

    const allFullyImplemented = availableStages.every(s => this.getStageStatus(s.id) === 'Fully Implemented');

    if (!hasAnyImplementation) {
      implementation_status = 'Not Implemented';
    } else if (allFullyImplemented) {
      implementation_status = 'Fully Implemented';
    } else {
      implementation_status = 'Partially Implemented';
    }

    this.assessmentChange.emit({
      achieved_maturity_stage_id,
      target_maturity_stage_id,
      implementation_status,
      notes: this.notes,
      assessed_stages_count,
      total_stages_count,
      stageDetails: new Map(this.stageStatuses) // Pass copy of stage selections
    });
  }
}
