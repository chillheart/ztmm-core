import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { V2AssessmentItemComponent, AssessmentUpdate } from './v2-assessment-item.component';
import { ProcessTechnologyGroup, MaturityStageImplementation, Assessment, FunctionCapability } from '../../models/ztmm.models';

@Component({
  selector: 'app-v2-assessment-overview',
  templateUrl: './v2-assessment-overview.component.html',
  styleUrls: ['./v2-assessment-overview.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, V2AssessmentItemComponent]
})
export class V2AssessmentOverviewComponent {
  @Input() processTechnologyGroups: ProcessTechnologyGroup[] = [];
  @Input() stageImplementations: MaturityStageImplementation[] = [];
  @Input() assessments: Assessment[] = [];
  @Input() functionCapabilities: FunctionCapability[] = [];
  @Input() selectedFunctionCapabilityName = '';
  @Input() selectedFunctionCapabilityType = '';
  @Input() isAutoSaving = false;
  @Input() showSuccess = false;

  @Output() assessmentUpdate = new EventEmitter<{groupId: number, update: AssessmentUpdate}>();
  @Output() saveAll = new EventEmitter<void>();

  // Make Math available to template
  Math = Math;

  onAssessmentUpdate(groupId: number, update: AssessmentUpdate): void {
    this.assessmentUpdate.emit({ groupId, update });
  }

  onSaveAll(): void {
    this.saveAll.emit();
  }

  getCurrentProgress(): number {
    if (this.processTechnologyGroups.length === 0) return 0;
    const completedCount = this.assessments.filter(a =>
      a.achieved_maturity_stage_id && a.achieved_maturity_stage_id > 0
    ).length;
    return Math.round((completedCount / this.processTechnologyGroups.length) * 100);
  }

  getAssessedCount(): number {
    return this.assessments.filter(a =>
      a.achieved_maturity_stage_id && a.achieved_maturity_stage_id > 0
    ).length;
  }

  getInProgressCount(): number {
    return this.assessments.filter(a =>
      a.target_maturity_stage_id &&
      a.target_maturity_stage_id > (a.achieved_maturity_stage_id || 0)
    ).length;
  }

  getNotStartedCount(): number {
    return this.processTechnologyGroups.length - this.getAssessedCount();
  }

  getStagesForGroup(groupId: number): MaturityStageImplementation[] {
    return this.stageImplementations.filter(si => si.process_technology_group_id === groupId);
  }

  getAssessmentForGroup(groupId: number): Assessment | undefined {
    return this.assessments.find(a => a.process_technology_group_id === groupId);
  }
}
