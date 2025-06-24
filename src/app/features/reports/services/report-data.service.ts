import { Injectable } from '@angular/core';
import {
  Pillar,
  FunctionCapability,
  MaturityStage,
  TechnologyProcess,
  AssessmentResponse
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

      const overallMaturityStage = this.maturityCalculation.calculatePillarMaturityStage(functions);

      return {
        pillar,
        functions,
        assessedItems,
        totalItems,
        assessmentPercentage: totalItems > 0 ? Math.round((assessedItems / totalItems) * 100) : 0,
        overallMaturityStage,
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

      const overallMaturityStage = this.maturityCalculation.calculateOverallMaturityStage(maturityStageBreakdown);

      return {
        functionCapability: func,
        assessedItems: functionAssessedItems,
        totalItems: functionTechProcesses.length,
        assessmentPercentage: functionTechProcesses.length > 0 ?
          Math.round((functionAssessedItems / functionTechProcesses.length) * 100) : 0,
        overallMaturityStage,
        maturityStageBreakdown
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
}
