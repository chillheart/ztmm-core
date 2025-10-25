import { Injectable } from '@angular/core';
import {
  Pillar,
  FunctionCapability,
  MaturityStage,
  TechnologyProcess,
  AssessmentResponse,
  ProcessTechnologyGroup,
  MaturityStageImplementation,
  Assessment,
  AssessmentStatus
} from '../../../models/ztmm.models';
import {
  PillarSummary,
  FunctionSummary,
  DetailedAssessmentItem,
  MaturityStageBreakdown
} from '../models/report.models';
import { MaturityCalculationService } from './maturity-calculation.service';

@Injectable({
  providedIn: 'root'
})
export class ReportDataService {

  constructor(private maturityCalculation: MaturityCalculationService) {}

  /**
   * Builds pillar summaries from raw data
   */
  buildPillarSummaries(
    pillars: Pillar[],
    functionCapabilities: FunctionCapability[],
    maturityStages: MaturityStage[],
    technologiesProcesses: TechnologyProcess[],
    assessmentResponses: AssessmentResponse[]
  ): PillarSummary[] {
    return pillars.map(pillar => {
      const pillarFunctions = functionCapabilities.filter(fc => fc.pillar_id === pillar.id);
      const functions = this.buildFunctionSummaries(
        pillarFunctions,
        maturityStages,
        technologiesProcesses,
        assessmentResponses
      );

      const { assessedItems, totalItems } = this.calculatePillarTotals(functions);
      const maturityStageBreakdown = this.buildPillarMaturityBreakdown(
        pillar.id,
        maturityStages,
        functionCapabilities,
        technologiesProcesses,
        assessmentResponses
      );

      const maturityResult = this.maturityCalculation.calculatePillarMaturityStage(functions);

      return {
        pillar,
        functions,
        assessedItems,
        totalItems,
        assessmentPercentage: totalItems > 0 ? Math.round((assessedItems / totalItems) * 100) : 0,
        overallMaturityStage: maturityResult.stage,
        actualMaturityStage: maturityResult.actualStage,
        hasSequentialMaturityGap: maturityResult.hasGap,
        sequentialMaturityExplanation: maturityResult.explanation,
        maturityStageBreakdown
      };
    });
  }

  /**
   * Builds function summaries for a pillar
   */
  private buildFunctionSummaries(
    functions: FunctionCapability[],
    maturityStages: MaturityStage[],
    technologiesProcesses: TechnologyProcess[],
    assessmentResponses: AssessmentResponse[]
  ): FunctionSummary[] {
    return functions.map(func => {
      const functionTechProcesses = technologiesProcesses.filter(tp => tp.function_capability_id === func.id);
      const functionAssessedItems = this.countAssessedItems(functionTechProcesses, assessmentResponses);

      const maturityStageBreakdown = this.buildFunctionMaturityBreakdown(
        func.id,
        maturityStages,
        technologiesProcesses,
        assessmentResponses
      );

      const maturityResult = this.maturityCalculation.calculateOverallMaturityStage(maturityStageBreakdown);

      return {
        functionCapability: func,
        assessedItems: functionAssessedItems,
        totalItems: functionTechProcesses.length,
        assessmentPercentage: functionTechProcesses.length > 0 ?
          Math.round((functionAssessedItems / functionTechProcesses.length) * 100) : 0,
        overallMaturityStage: maturityResult.stage,
        actualMaturityStage: maturityResult.actualStage,
        hasSequentialMaturityGap: maturityResult.hasGap,
        sequentialMaturityExplanation: maturityResult.explanation,
        maturityStageBreakdown: maturityResult.stageBreakdown
      };
    });
  }

  /**
   * Builds maturity stage breakdown for a function
   */
  private buildFunctionMaturityBreakdown(
    functionId: number,
    maturityStages: MaturityStage[],
    technologiesProcesses: TechnologyProcess[],
    assessmentResponses: AssessmentResponse[]
  ): MaturityStageBreakdown[] {
    return maturityStages.map(stage => {
      const stageTechProcesses = technologiesProcesses.filter(
        tp => tp.function_capability_id === functionId && tp.maturity_stage_id === stage.id
      );

      return this.maturityCalculation.calculateMaturityStageBreakdown(
        stage.name,
        stageTechProcesses,
        assessmentResponses
      );
    }).filter(breakdown => breakdown.totalItems > 0);
  }

  /**
   * Builds maturity stage breakdown for a pillar
   */
  private buildPillarMaturityBreakdown(
    pillarId: number,
    maturityStages: MaturityStage[],
    functionCapabilities: FunctionCapability[],
    technologiesProcesses: TechnologyProcess[],
    assessmentResponses: AssessmentResponse[]
  ): MaturityStageBreakdown[] {
    const pillarFunctions = functionCapabilities.filter(fc => fc.pillar_id === pillarId);

    return maturityStages.map(stage => {
      const stageTechProcesses = technologiesProcesses.filter(tp => {
        const functionBelongsToPillar = pillarFunctions.some(func => func.id === tp.function_capability_id);
        return functionBelongsToPillar && tp.maturity_stage_id === stage.id;
      });

      return this.maturityCalculation.calculateMaturityStageBreakdown(
        stage.name,
        stageTechProcesses,
        assessmentResponses
      );
    }).filter(breakdown => breakdown.totalItems > 0);
  }

  /**
   * Calculates total assessed and total items for a pillar
   */
  private calculatePillarTotals(functions: FunctionSummary[]): { assessedItems: number; totalItems: number } {
    return functions.reduce(
      (totals, func) => ({
        assessedItems: totals.assessedItems + func.assessedItems,
        totalItems: totals.totalItems + func.totalItems
      }),
      { assessedItems: 0, totalItems: 0 }
    );
  }

  /**
   * Counts assessed items for given tech processes
   */
  private countAssessedItems(
    techProcesses: TechnologyProcess[],
    assessmentResponses: AssessmentResponse[]
  ): number {
    return techProcesses.filter(tp =>
      assessmentResponses.some(ar => ar.tech_process_id === tp.id)
    ).length;
  }

  /**
   * Builds detailed assessment items for a function
   */
  buildFunctionDetails(
    functionSummary: FunctionSummary,
    pillars: Pillar[],
    maturityStages: MaturityStage[],
    technologiesProcesses: TechnologyProcess[],
    assessmentResponses: AssessmentResponse[]
  ): DetailedAssessmentItem[] {
    const functionTechProcesses = technologiesProcesses.filter(
      tp => tp.function_capability_id === functionSummary.functionCapability.id
    );

    const pillar = pillars.find(p => p.id === functionSummary.functionCapability.pillar_id);

    const details = functionTechProcesses.map(tp => {
      const maturityStage = maturityStages.find(ms => ms.id === tp.maturity_stage_id);
      const assessment = assessmentResponses.find(ar => ar.tech_process_id === tp.id);

      return {
        pillarName: pillar?.name || '',
        functionCapabilityName: functionSummary.functionCapability.name,
        functionCapabilityType: functionSummary.functionCapability.type,
        name: tp.name,
        description: tp.description,
        type: tp.type,
        maturityStageName: maturityStage?.name || '',
        status: assessment?.status || 'Not Assessed',
        notes: assessment?.notes || ''
      };
    });

    // Sort by maturity stage order, then by name
    const stageOrder = ['Traditional', 'Initial', 'Advanced', 'Optimal'];
    return details.sort((a, b) => {
      const stageComparison = stageOrder.indexOf(a.maturityStageName) - stageOrder.indexOf(b.maturityStageName);
      if (stageComparison !== 0) return stageComparison;
      return a.name.localeCompare(b.name);
    });
  }

  // ============================================================================
  // V2 DATA MODEL METHODS
  // ============================================================================

  /**
   * Builds pillar summaries from V2 data model
   * Uses ProcessTechnologyGroups with MaturityStageImplementations and Assessments
   */
  buildV2PillarSummaries(
    pillars: Pillar[],
    functionCapabilities: FunctionCapability[],
    maturityStages: MaturityStage[],
    processTechnologyGroups: ProcessTechnologyGroup[],
    maturityStageImplementations: MaturityStageImplementation[],
    assessments: Assessment[]
  ): PillarSummary[] {
    return pillars.map(pillar => {
      const pillarFunctions = functionCapabilities.filter(fc => fc.pillar_id === pillar.id);
      const functions = this.buildV2FunctionSummaries(
        pillarFunctions,
        maturityStages,
        processTechnologyGroups,
        maturityStageImplementations,
        assessments
      );

      const { assessedItems, totalItems } = this.calculatePillarTotals(functions);
      const maturityStageBreakdown = this.buildV2PillarMaturityBreakdown(
        pillar.id,
        maturityStages,
        functionCapabilities,
        processTechnologyGroups,
        maturityStageImplementations,
        assessments
      );

      const maturityResult = this.maturityCalculation.calculatePillarMaturityStage(functions);

      return {
        pillar,
        functions,
        assessedItems,
        totalItems,
        assessmentPercentage: totalItems > 0 ? Math.round((assessedItems / totalItems) * 100) : 0,
        overallMaturityStage: maturityResult.stage,
        actualMaturityStage: maturityResult.actualStage,
        hasSequentialMaturityGap: maturityResult.hasGap,
        sequentialMaturityExplanation: maturityResult.explanation,
        maturityStageBreakdown
      };
    });
  }

  /**
   * Builds function summaries for a pillar using V2 data
   */
  private buildV2FunctionSummaries(
    functions: FunctionCapability[],
    maturityStages: MaturityStage[],
    processTechnologyGroups: ProcessTechnologyGroup[],
    maturityStageImplementations: MaturityStageImplementation[],
    assessments: Assessment[]
  ): FunctionSummary[] {
    return functions.map(func => {
      const functionGroups = processTechnologyGroups.filter(ptg => ptg.function_capability_id === func.id);
      const functionAssessedItems = this.countV2AssessedItems(functionGroups, assessments);

      const maturityStageBreakdown = this.buildV2FunctionMaturityBreakdown(
        func.id,
        maturityStages,
        processTechnologyGroups,
        maturityStageImplementations,
        assessments
      );

      const maturityResult = this.maturityCalculation.calculateOverallMaturityStage(maturityStageBreakdown);

      return {
        functionCapability: func,
        assessedItems: functionAssessedItems,
        totalItems: functionGroups.length,
        assessmentPercentage: functionGroups.length > 0 ?
          Math.round((functionAssessedItems / functionGroups.length) * 100) : 0,
        overallMaturityStage: maturityResult.stage,
        actualMaturityStage: maturityResult.actualStage,
        hasSequentialMaturityGap: maturityResult.hasGap,
        sequentialMaturityExplanation: maturityResult.explanation,
        maturityStageBreakdown: maturityResult.stageBreakdown
      };
    });
  }

  /**
   * Builds maturity stage breakdown for a function using V2 data
   */
  private buildV2FunctionMaturityBreakdown(
    functionId: number,
    maturityStages: MaturityStage[],
    processTechnologyGroups: ProcessTechnologyGroup[],
    maturityStageImplementations: MaturityStageImplementation[],
    assessments: Assessment[]
  ): MaturityStageBreakdown[] {
    return maturityStages.map(stage => {
      // Find all groups for this function
      const functionGroups = processTechnologyGroups.filter(ptg => ptg.function_capability_id === functionId);
      
      // Find groups that have implementations at this maturity stage
      const groupsAtStage = functionGroups.filter(group => {
        return maturityStageImplementations.some(
          impl => impl.process_technology_group_id === group.id && impl.maturity_stage_id === stage.id
        );
      });

      return this.maturityCalculation.calculateV2MaturityStageBreakdown(
        stage.name,
        groupsAtStage,
        assessments
      );
    }).filter(breakdown => breakdown.totalItems > 0);
  }

  /**
   * Builds maturity stage breakdown for a pillar using V2 data
   */
  private buildV2PillarMaturityBreakdown(
    pillarId: number,
    maturityStages: MaturityStage[],
    functionCapabilities: FunctionCapability[],
    processTechnologyGroups: ProcessTechnologyGroup[],
    maturityStageImplementations: MaturityStageImplementation[],
    assessments: Assessment[]
  ): MaturityStageBreakdown[] {
    const pillarFunctions = functionCapabilities.filter(fc => fc.pillar_id === pillarId);

    return maturityStages.map(stage => {
      // Find all groups for this pillar
      const pillarGroups = processTechnologyGroups.filter(ptg => {
        return pillarFunctions.some(func => func.id === ptg.function_capability_id);
      });
      
      // Find groups that have implementations at this maturity stage
      const groupsAtStage = pillarGroups.filter(group => {
        return maturityStageImplementations.some(
          impl => impl.process_technology_group_id === group.id && impl.maturity_stage_id === stage.id
        );
      });

      return this.maturityCalculation.calculateV2MaturityStageBreakdown(
        stage.name,
        groupsAtStage,
        assessments
      );
    }).filter(breakdown => breakdown.totalItems > 0);
  }

  /**
   * Counts assessed items for V2 groups
   */
  private countV2AssessedItems(
    groups: ProcessTechnologyGroup[],
    assessments: Assessment[]
  ): number {
    return groups.filter(group =>
      assessments.some(a => a.process_technology_group_id === group.id)
    ).length;
  }

  /**
   * Builds detailed assessment items for a function using V2 data
   */
  buildV2FunctionDetails(
    functionSummary: FunctionSummary,
    pillars: Pillar[],
    maturityStages: MaturityStage[],
    processTechnologyGroups: ProcessTechnologyGroup[],
    maturityStageImplementations: MaturityStageImplementation[],
    assessments: Assessment[]
  ): DetailedAssessmentItem[] {
    const functionGroups = processTechnologyGroups.filter(
      ptg => ptg.function_capability_id === functionSummary.functionCapability.id
    );

    const pillar = pillars.find(p => p.id === functionSummary.functionCapability.pillar_id);

    const details: DetailedAssessmentItem[] = [];

    // For V2, create detail items for each group at each stage
    for (const group of functionGroups) {
      const groupImplementations = maturityStageImplementations.filter(
        impl => impl.process_technology_group_id === group.id
      );
      const assessment = assessments.find(a => a.process_technology_group_id === group.id);

      for (const impl of groupImplementations) {
        const maturityStage = maturityStages.find(ms => ms.id === impl.maturity_stage_id);
        
        // Determine status based on achieved stage
        let status: string;
        if (!assessment) {
          status = 'Not Assessed';
        } else if (assessment.achieved_maturity_stage_id >= impl.maturity_stage_id) {
          status = 'Fully Implemented';
        } else if (assessment.target_maturity_stage_id === impl.maturity_stage_id) {
          status = assessment.implementation_status;
        } else {
          status = 'Not Implemented';
        }

        details.push({
          pillarName: pillar?.name || '',
          functionCapabilityName: functionSummary.functionCapability.name,
          functionCapabilityType: functionSummary.functionCapability.type,
          name: `${group.name} - ${maturityStage?.name || ''}`,
          description: impl.description,
          type: group.type,
          maturityStageName: maturityStage?.name || '',
          status,
          notes: assessment?.notes || ''
        });
      }
    }

    // Sort by maturity stage order, then by name
    const stageOrder = ['Traditional', 'Initial', 'Advanced', 'Optimal'];
    return details.sort((a, b) => {
      const stageComparison = stageOrder.indexOf(a.maturityStageName) - stageOrder.indexOf(b.maturityStageName);
      if (stageComparison !== 0) return stageComparison;
      return a.name.localeCompare(b.name);
    });
  }
}
