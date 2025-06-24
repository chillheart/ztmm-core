import { Injectable } from '@angular/core';
import {
  TechnologyProcess,
  AssessmentResponse
} from '../../../models/ztmm.models';
import {
  MaturityStageBreakdown,
  FunctionSummary,
  MaturityStatus
} from '../models/report.models';

@Injectable({
  providedIn: 'root'
})
export class MaturityCalculationService {

  /**
   * Calculates maturity status based on improved logic:
   * - completed: All items are Fully Implemented or Superseded
   * - in-progress: Some items are Partially Implemented, and/or some completed
   * - not-started: All assessed items are Not Implemented
   * - not-assessed: No items have been assessed
   */
  calculateMaturityStatus(breakdown: MaturityStageBreakdown): MaturityStatus {
    const { assessedItems, completedItems, inProgressItems, notStartedItems } = breakdown;

    // If nothing is assessed
    if (assessedItems === 0) {
      return 'not-assessed';
    }

    // If all assessed items are completed (Fully Implemented or Superseded)
    if (completedItems === assessedItems && completedItems > 0) {
      return 'completed';
    }

    // If there are any partially implemented or some completed items
    if (inProgressItems > 0 || completedItems > 0) {
      return 'in-progress';
    }

    // If all assessed items are not implemented
    if (notStartedItems === assessedItems) {
      return 'not-started';
    }

    return 'not-assessed';
  }

  /**
   * Calculates breakdown for a specific maturity stage
   */
  calculateMaturityStageBreakdown(
    stageName: string,
    technologiesProcesses: TechnologyProcess[],
    assessmentResponses: AssessmentResponse[]
  ): MaturityStageBreakdown {
    const totalItems = technologiesProcesses.length;
    let assessedItems = 0;
    let completedItems = 0;
    let inProgressItems = 0;
    let notStartedItems = 0;

    for (const tp of technologiesProcesses) {
      const assessment = assessmentResponses.find(ar => ar.tech_process_id === tp.id);

      if (assessment) {
        assessedItems++;

        switch (assessment.status) {
          case 'Fully Implemented':
          case 'Superseded':
            completedItems++;
            break;
          case 'Partially Implemented':
            inProgressItems++;
            break;
          case 'Not Implemented':
            notStartedItems++;
            break;
        }
      }
    }

    const percentage = totalItems > 0 ? Math.round((assessedItems / totalItems) * 100) : 0;
    const completionPercentage = assessedItems > 0 ? Math.round((completedItems / assessedItems) * 100) : 0;

    const breakdown: MaturityStageBreakdown = {
      stageName,
      assessedItems,
      totalItems,
      completedItems,
      inProgressItems,
      notStartedItems,
      percentage,
      completionPercentage,
      status: 'not-assessed'
    };

    breakdown.status = this.calculateMaturityStatus(breakdown);

    return breakdown;
  }

  /**
   * Calculates the overall maturity stage for a function based on completed stages
   */
  calculateOverallMaturityStage(maturityBreakdown: MaturityStageBreakdown[]): string {
    const stageOrder = ['Traditional', 'Initial', 'Advanced', 'Optimal'];

    // Find the highest stage that is completed
    const completedStages = maturityBreakdown
      .filter(mb => mb.status === 'completed')
      .map(mb => mb.stageName)
      .sort((a, b) => stageOrder.indexOf(b) - stageOrder.indexOf(a));

    if (completedStages.length > 0) {
      return completedStages[0];
    }

    // If no stages are completed, find the highest stage with progress
    const inProgressStages = maturityBreakdown
      .filter(mb => mb.status === 'in-progress')
      .map(mb => mb.stageName)
      .sort((a, b) => stageOrder.indexOf(b) - stageOrder.indexOf(a));

    if (inProgressStages.length > 0) {
      // Return the previous stage to indicate they haven't reached the in-progress stage yet
      const currentStageIndex = stageOrder.indexOf(inProgressStages[0]);
      return currentStageIndex > 0 ? stageOrder[currentStageIndex - 1] : 'Traditional';
    }

    return 'Traditional';
  }

  /**
   * Calculates the overall maturity stage for a pillar based on function summaries
   */
  calculatePillarMaturityStage(functions: FunctionSummary[]): string {
    if (functions.length === 0) return 'Traditional';

    const stageOrder = ['Traditional', 'Initial', 'Advanced', 'Optimal'];
    const functionStages = functions.map(f => f.overallMaturityStage);

    // Calculate the average stage index
    const stageIndices = functionStages.map(stage => stageOrder.indexOf(stage));
    const averageIndex = Math.floor(stageIndices.reduce((sum, index) => sum + index, 0) / stageIndices.length);

    return stageOrder[averageIndex] || 'Traditional';
  }

  /**
   * Gets status class for UI display
   */
  getStatusClass(status: MaturityStatus): string {
    switch (status) {
      case 'completed': return 'bg-success text-white';
      case 'in-progress': return 'bg-warning text-dark';
      case 'not-started': return 'bg-danger text-white';
      case 'not-assessed': return 'bg-secondary text-white';
      default: return 'bg-light text-dark';
    }
  }

  /**
   * Gets status icon for UI display
   */
  getStatusIcon(status: MaturityStatus): string {
    switch (status) {
      case 'completed': return 'bi-check-circle-fill';
      case 'in-progress': return 'bi-hourglass-split';
      case 'not-started': return 'bi-x-circle-fill';
      case 'not-assessed': return 'bi-question-circle-fill';
      default: return 'bi-circle';
    }
  }

  /**
   * Gets maturity stage color for UI display
   */
  getMaturityStageColor(stageName: string): string {
    switch (stageName) {
      case 'Traditional': return 'bg-secondary';
      case 'Initial': return 'bg-warning';
      case 'Advanced': return 'bg-info';
      case 'Optimal': return 'bg-success';
      default: return 'bg-light';
    }
  }

  /**
   * Gets assessment status class for UI display
   */
  getAssessmentStatusClass(status: string): string {
    switch (status) {
      case 'Fully Implemented': return 'bg-success text-white';
      case 'Partially Implemented': return 'bg-warning text-dark';
      case 'Not Implemented': return 'bg-danger text-white';
      case 'Not Assessed': return 'bg-secondary text-white';
      case 'Superseded': return 'bg-info text-white';
      default: return 'bg-secondary text-white';
    }
  }
}
