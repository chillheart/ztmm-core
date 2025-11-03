import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AssessmentItemComponent, AssessmentUpdate } from './assessment-item.component';
import { ProcessTechnologyGroup, MaturityStageImplementation, Assessment, FunctionCapability, AssessmentStatus, StageImplementationDetail } from '../../models/ztmm.models';

@Component({
  selector: 'app-assessment-overview',
  templateUrl: './assessment-overview.component.html',
  styleUrls: ['./assessment-overview.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AssessmentItemComponent]
})
export class AssessmentOverviewComponent implements OnInit, OnChanges {
  @Input() processTechnologyGroups: ProcessTechnologyGroup[] = [];
  @Input() stageImplementations: MaturityStageImplementation[] = [];
  @Input() assessments: Assessment[] = [];
  @Input() stageImplementationDetails: StageImplementationDetail[] = [];
  @Input() functionCapabilities: FunctionCapability[] = [];
  @Input() maturityStages: any[] = []; // MaturityStage[] but using any to avoid import issues
  @Input() selectedFunctionCapabilityName = '';
  @Input() selectedFunctionCapabilityType = '';
  @Input() isAutoSaving = false;
  @Input() showSuccess = false;

  @Output() assessmentUpdate = new EventEmitter<{groupId: number, update: AssessmentUpdate}>();
  @Output() backToPillarSummary = new EventEmitter<void>();

  // Track assessment progress for each group (stages assessed / total stages)
  private assessmentProgress = new Map<number, {assessed: number, total: number}>();

  // Assessment status options
  statusOptions: AssessmentStatus[] = [
    'Not Implemented',
    'Partially Implemented',
    'Fully Implemented',
    'Superseded'
  ];

  // Make Math available to template
  Math = Math;

  ngOnInit(): void {
    this.calculateInitialProgress();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Recalculate progress when input data changes
    if (changes['processTechnologyGroups'] || changes['stageImplementationDetails'] || changes['stageImplementations']) {
      this.calculateInitialProgress();
    }
  }

  // Calculate initial progress from existing data
  private calculateInitialProgress(): void {
    this.assessmentProgress.clear();

    for (const group of this.processTechnologyGroups) {
      const groupStages = this.getStageImplementations(group.id);
      const totalStages = groupStages.length;

      // Count how many stages have details (user has made selections)
      const assessment = this.getAssessmentForGroup(group.id);
      let assessedStages = 0;

      if (assessment) {
        const details = this.getStageDetailsForAssessment(assessment.id);
        assessedStages = details.length;
      }

      this.assessmentProgress.set(group.id, {
        assessed: assessedStages,
        total: totalStages
      });
    }

    console.log('Initial progress calculated:', Array.from(this.assessmentProgress.entries()));
  }

  onBackToPillarSummary(): void {
    this.backToPillarSummary.emit();
  }

  onAssessmentUpdate(groupId: number, update: AssessmentUpdate): void {
    // Store assessment progress for this group
    this.assessmentProgress.set(groupId, {
      assessed: update.assessed_stages_count,
      total: update.total_stages_count
    });

    this.assessmentUpdate.emit({ groupId, update });
  }

  getCurrentProgress(): number {
    // Calculate progress based on assessed stages vs total stages
    let totalAssessedStages = 0;
    let totalStages = 0;

    // Use the assessment progress map if available (tracks real-time updates)
    for (const group of this.processTechnologyGroups) {
      const progress = this.assessmentProgress.get(group.id);
      if (progress) {
        totalAssessedStages += progress.assessed;
        totalStages += progress.total;
      } else {
        // Fallback: count stages for this group
        const groupStages = this.getStageImplementations(group.id);
        totalStages += groupStages.length;
        // If no progress tracked yet, assume 0 assessed
      }
    }

    if (totalStages === 0) return 0;
    return Math.round((totalAssessedStages / totalStages) * 100);
  }

  getAssessedCount(): number {
    // Count groups where all stages have been assessed
    return this.processTechnologyGroups.filter(group => {
      const progress = this.assessmentProgress.get(group.id);
      if (!progress) return false;
      // All stages assessed = assessed count equals total count
      return progress.assessed === progress.total && progress.total > 0;
    }).length;
  }

  getInProgressCount(): number {
    // Count groups where at least one stage is assessed but not all
    return this.processTechnologyGroups.filter(group => {
      const progress = this.assessmentProgress.get(group.id);
      if (!progress) return false;
      // In progress = some stages assessed but not all
      return progress.assessed > 0 && progress.assessed < progress.total;
    }).length;
  }

  getNotStartedCount(): number {
    // Count groups where no stages have been assessed yet
    return this.processTechnologyGroups.filter(group => {
      const progress = this.assessmentProgress.get(group.id);
      // Not started = no progress data OR assessed count is 0
      return !progress || progress.assessed === 0;
    }).length;
  }

  getStagesForGroup(groupId: number): MaturityStageImplementation[] {
    return this.stageImplementations.filter(si => si.process_technology_group_id === groupId);
  }

  getAssessmentForGroup(groupId: number): Assessment | undefined {
    return this.assessments.find(a => a.process_technology_group_id === groupId);
  }

  getStageDetailsForAssessment(assessmentId: number): StageImplementationDetail[] {
    return this.stageImplementationDetails.filter(d => d.assessment_id === assessmentId);
  }

  // Alias methods for template compatibility
  getAssessment(groupId: number): Assessment | null {
    return this.getAssessmentForGroup(groupId) || null;
  }

  getStageImplementations(groupId: number): MaturityStageImplementation[] {
    return this.getStagesForGroup(groupId);
  }

  getStageDetails(groupId: number): StageImplementationDetail[] {
    const assessment = this.getAssessmentForGroup(groupId);
    return assessment ? this.getStageDetailsForAssessment(assessment.id) : [];
  }
}
