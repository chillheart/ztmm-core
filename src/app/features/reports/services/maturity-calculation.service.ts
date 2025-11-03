import { Injectable } from '@angular/core';
import {
  TechnologyProcess,
  AssessmentResponse,
  ProcessTechnologyGroup,
  Assessment,
  StageImplementationDetail
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
   * Enforces sequential maturity: must complete all previous stages before advancing
   * Only considers stages that are applicable (have implementations) for the group
   */
  calculateOverallMaturityStage(maturityBreakdown: MaturityStageBreakdown[]): {
    stage: string;
    actualStage: string;
    hasGap: boolean;
    explanation?: string;
    stageBreakdown: MaturityStageBreakdown[];
  } {
    const stageOrder = ['Traditional', 'Initial', 'Advanced', 'Optimal'];

    // Extract which stages are applicable (have items) - these are the only ones we care about
    const applicableStages = maturityBreakdown
      .filter(mb => mb.totalItems > 0)
      .map(mb => mb.stageName);

    console.log('🔍 calculateOverallMaturityStage:', {
      applicableStages,
      breakdown: maturityBreakdown.map(mb => ({
        stage: mb.stageName,
        status: mb.status,
        total: mb.totalItems,
        completed: mb.completedItems
      }))
    });

    // First, let's mark which stages can be advanced to based on sequential requirements
    const updatedBreakdown = this.validateSequentialMaturity(maturityBreakdown, applicableStages);

    // Find the highest completed stage that can be achieved sequentially
    let achievedStage: string | null = null; // Will be set to first applicable stage or first completed stage
    let actualStage = 'Traditional';
    let hasGap = false;
    let explanation = '';

    // Calculate what stage they would be at without sequential constraints
    const completedStages = maturityBreakdown
      .filter(mb => mb.status === 'completed')
      .map(mb => mb.stageName)
      .sort((a, b) => stageOrder.indexOf(b) - stageOrder.indexOf(a));

    if (completedStages.length > 0) {
      actualStage = completedStages[0];
    } else {
      // If no stages are completed, find the highest stage with progress
      const inProgressStages = maturityBreakdown
        .filter(mb => mb.status === 'in-progress')
        .map(mb => mb.stageName)
        .sort((a, b) => stageOrder.indexOf(b) - stageOrder.indexOf(a));

      if (inProgressStages.length > 0) {
        const currentStageIndex = stageOrder.indexOf(inProgressStages[0]);
        actualStage = currentStageIndex > 0 ? stageOrder[currentStageIndex - 1] : 'Traditional';
      }
    }

    // Calculate sequential achieved stage
    // Only consider stages that are in the breakdown (applicable stages)
    for (const stage of stageOrder) {
      const stageBreakdown = updatedBreakdown.find(mb => mb.stageName === stage);

      // Skip if this stage is not in the breakdown (not applicable to this group)
      if (!stageBreakdown) {
        continue;
      }

      // Set achievedStage to first applicable stage if not set yet (handles case where nothing is completed)
      if (achievedStage === null) {
        achievedStage = stage;
      }

      if (stageBreakdown.status === 'completed' && stageBreakdown.canAdvanceToThisStage) {
        achievedStage = stage;
      } else {
        break; // Stop at first incomplete or blocked stage
      }
    }

    // If still null, default to Traditional (no applicable stages found)
    if (achievedStage === null) {
      achievedStage = 'Traditional';
    }

    console.log('✅ Result:', { achievedStage, actualStage, hasGap });

    // Check for gaps
    if (actualStage !== achievedStage) {
      hasGap = true;
      const blockedStage = updatedBreakdown.find(mb => mb.stageName === actualStage);
      if (blockedStage && blockedStage.blockedByPreviousStages) {
        explanation = `Sequential maturity requirements: Cannot advance to ${actualStage} stage until all items in the ${blockedStage.blockedByPreviousStages.join(', ')} stage${blockedStage.blockedByPreviousStages.length > 1 ? 's' : ''} are completed.`;
      }
    }

    return {
      stage: achievedStage,
      actualStage,
      hasGap,
      explanation,
      stageBreakdown: updatedBreakdown
    };
  }

  /**
   * Validates sequential maturity requirements for each stage
   * Only considers stages that are in the applicableStages list
   */
  private validateSequentialMaturity(
    maturityBreakdown: MaturityStageBreakdown[],
    applicableStages: string[]
  ): MaturityStageBreakdown[] {
    return maturityBreakdown.map(breakdown => {
      const canAdvanceToThisStage = this.canAdvanceToStage(breakdown.stageName, maturityBreakdown, applicableStages);
      const blockedByPreviousStages = this.getBlockingStages(breakdown.stageName, maturityBreakdown, applicableStages);

      return {
        ...breakdown,
        canAdvanceToThisStage,
        blockedByPreviousStages
      };
    });
  }

  /**
   * Checks if advancement to a specific stage is allowed based on sequential requirements
   * Only considers stages that are assessed AND in the applicable stages list
   */
  private canAdvanceToStage(
    stageName: string,
    maturityBreakdown: MaturityStageBreakdown[],
    applicableStages: string[]
  ): boolean {
    const stageOrder = ['Traditional', 'Initial', 'Advanced', 'Optimal'];
    const stageIndex = stageOrder.indexOf(stageName);

    // First applicable stage is always accessible
    if (applicableStages.length > 0 && stageName === applicableStages[0]) {
      return true;
    }

    // Traditional stage is always accessible (if it's applicable)
    if (stageIndex === 0 && applicableStages.includes('Traditional')) {
      return true;
    }

    // Check if all previous ASSESSED AND APPLICABLE stages are completed
    for (let i = 0; i < stageIndex; i++) {
      const previousStage = stageOrder[i];

      // Skip if this stage is not applicable for this group
      if (!applicableStages.includes(previousStage)) {
        continue;
      }

      const previousStageBreakdown = maturityBreakdown.find(mb => mb.stageName === previousStage);

      // Only block if the previous stage is applicable, has been assessed, but is not completed
      if (previousStageBreakdown &&
          previousStageBreakdown.status !== 'not-assessed' &&
          previousStageBreakdown.status !== 'completed') {
        return false;
      }
    }

    return true;
  }

  /**
   * Gets the list of stages that are blocking advancement to the specified stage
   * Only includes stages that are assessed, not completed, AND in the applicable stages list
   */
  private getBlockingStages(
    stageName: string,
    maturityBreakdown: MaturityStageBreakdown[],
    applicableStages: string[]
  ): string[] {
    const stageOrder = ['Traditional', 'Initial', 'Advanced', 'Optimal'];
    const stageIndex = stageOrder.indexOf(stageName);
    const blockingStages: string[] = [];

    // Check previous stages for incomplete items (only those that are applicable and have been assessed)
    for (let i = 0; i < stageIndex; i++) {
      const previousStage = stageOrder[i];

      // Skip if this stage is not applicable for this group
      if (!applicableStages.includes(previousStage)) {
        continue;
      }

      const previousStageBreakdown = maturityBreakdown.find(mb => mb.stageName === previousStage);

      // Only include as blocking if the stage is applicable, has been assessed, but is not completed
      if (previousStageBreakdown &&
          previousStageBreakdown.status !== 'not-assessed' &&
          previousStageBreakdown.status !== 'completed') {
        blockingStages.push(previousStage);
      }
    }

    return blockingStages;
  }

  /**
   * Calculates the overall maturity stage for a pillar based on function summaries
   * Enforces sequential maturity requirements
   */
  calculatePillarMaturityStage(functions: FunctionSummary[]): {
    stage: string;
    actualStage: string;
    hasGap: boolean;
    explanation?: string;
  } {
    if (functions.length === 0) return {
      stage: 'Traditional',
      actualStage: 'Traditional',
      hasGap: false
    };

    const stageOrder = ['Traditional', 'Initial', 'Advanced', 'Optimal'];

    // Calculate actual average (without sequential constraints)
    const actualFunctionStages = functions.map(f => f.actualMaturityStage);
    const actualStageIndices = actualFunctionStages.map(stage => stageOrder.indexOf(stage));
    const actualAverageIndex = Math.ceil(actualStageIndices.reduce((sum, index) => sum + index, 0) / actualStageIndices.length);
    const actualStage = stageOrder[actualAverageIndex] || 'Traditional';

    // Calculate sequential average (with sequential constraints)
    const sequentialFunctionStages = functions.map(f => f.overallMaturityStage);
    const sequentialStageIndices = sequentialFunctionStages.map(stage => stageOrder.indexOf(stage));
    const sequentialAverageIndex = Math.ceil(sequentialStageIndices.reduce((sum, index) => sum + index, 0) / sequentialStageIndices.length);
    const achievedStage = stageOrder[sequentialAverageIndex] || 'Traditional';

    // Check if there's a gap
    const hasGap = actualStage !== achievedStage;
    const functionsWithGaps = functions.filter(f => f.hasSequentialMaturityGap);

    let explanation = undefined;
    if (hasGap) {
      explanation = `Sequential maturity requirements prevent advancement to ${actualStage} stage.`;
      if (functionsWithGaps.length > 0) {
        explanation += ` ${functionsWithGaps.length} function${functionsWithGaps.length > 1 ? 's' : ''} ${functionsWithGaps.length > 1 ? 'have' : 'has'} incomplete prerequisite stages.`;
      }
    }

    return {
      stage: achievedStage,
      actualStage,
      hasGap,
      explanation
    };
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

  // ============================================================================
  // V2 DATA MODEL METHODS
  // ============================================================================

  /**
   * Calculates breakdown for a specific maturity stage using V2 data
   */
  calculateV2MaturityStageBreakdown(
    stageName: string,
    groupsAtStage: ProcessTechnologyGroup[],
    assessments: Assessment[],
    stageImplementationDetails: StageImplementationDetail[],
    currentStageId: number
  ): MaturityStageBreakdown {
    const totalItems = groupsAtStage.length;
    let assessedItems = 0;
    let completedItems = 0;
    let inProgressItems = 0;
    let notStartedItems = 0;

    // Get the stage ID based on name for comparison
    const stageOrder = ['Traditional', 'Initial', 'Advanced', 'Optimal'];
    const currentStageIndex = stageOrder.indexOf(stageName);

    for (const group of groupsAtStage) {
      const assessment = assessments.find(a => a.process_technology_group_id === group.id);

      if (assessment) {
        assessedItems++;

        // Check if we have a StageImplementationDetail for this specific stage
        const stageDetail = stageImplementationDetails.find(
          d => d.assessment_id === assessment.id && d.maturity_stage_id === currentStageId
        );

        if (stageDetail) {
          // Use the actual saved stage detail status
          switch (stageDetail.status) {
            case 'Completed':
              completedItems++;
              break;
            case 'In Progress':
              inProgressItems++;
              break;
            case 'Not Started':
              notStartedItems++;
              break;
          }
        } else {
          // Fallback: infer from achieved stage (legacy behavior)
          const achievedStageIndex = assessment.achieved_maturity_stage_id - 1;
          const targetStageIndex = assessment.target_maturity_stage_id ? assessment.target_maturity_stage_id - 1 : -1;

          if (achievedStageIndex > currentStageIndex) {
            // Already surpassed this stage
            completedItems++;
          } else if (achievedStageIndex === currentStageIndex) {
            // Currently at this stage - check implementation status
            switch (assessment.implementation_status) {
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
          } else if (targetStageIndex === currentStageIndex ||
                     (achievedStageIndex < currentStageIndex && assessment.implementation_status !== 'Not Implemented')) {
            // Haven't achieved this stage yet, but either:
            // 1. It's the target stage being worked on, OR
            // 2. They're below this stage but showing progress
            switch (assessment.implementation_status) {
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
          } else {
            // Haven't reached this stage yet and not working on it
            notStartedItems++;
          }
        }
      }
    }

    const percentage = totalItems > 0 ? Math.round((assessedItems / totalItems) * 100) : 0;
    const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

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
}
