import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZtmmDataWebService } from './services/ztmm-data-web.service';
import { Pillar, FunctionCapability, TechnologyProcess, MaturityStage, AssessmentResponse } from './models/ztmm.models';

interface ResultItem {
  pillarName: string;
  functionCapabilityName: string;
  functionCapabilityType: string;
  description: string;
  type: string;
  maturityStageName: string;
  status: string;
  notes: string;
}

interface StageResult {
  stage: MaturityStage;
  status: 'green' | 'yellow' | 'red' | 'not-assessed';
  assessedCount: number;
  totalCount: number;
  completionPercentage: number;
}

interface FunctionResult {
  functionCapabilityName: string;
  functionCapabilityType: string;
  items: ResultItem[];
  maturityStageStatus: StageResult[];
  assessedCount: number;
  totalItems: number;
  assessmentPercentage: number;
}

interface PillarResult {
  pillarName: string;
  functions: FunctionResult[];
  totalItems: number;
  assessedItems: number;
  assessmentPercentage: number;
}

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]

})
export class ResultsComponent {
  pillars: Pillar[] = [];
  functionCapabilities: FunctionCapability[] = [];
  maturityStages: MaturityStage[] = [];
  technologiesProcesses: TechnologyProcess[] = [];
  assessmentResponses: AssessmentResponse[] = [];
  results: ResultItem[] = [];
  selectedPillarId: number | null = null;

  constructor(private data: ZtmmDataWebService) {
    this.loadAll();
  }

  async loadAll() {
    try {
      this.pillars = await this.data.getPillars();
    } catch (error) {
      console.error('Error loading pillars:', error);
      this.pillars = [];
    }

    try {
      this.functionCapabilities = await this.data.getFunctionCapabilities();
    } catch (error) {
      console.error('Error loading function capabilities:', error);
      this.functionCapabilities = [];
    }

    try {
      this.maturityStages = await this.data.getMaturityStages();
    } catch (error) {
      console.error('Error loading maturity stages:', error);
      this.maturityStages = [];
    }

    // Gather all technologies/processes for all functionCapabilities
    let allTP: TechnologyProcess[] = [];
    try {
      if (Array.isArray(this.functionCapabilities)) {
        for (const fc of this.functionCapabilities) {
          try {
            const tps = await this.data.getTechnologiesProcesses(fc.id);
            allTP = allTP.concat(tps);
          } catch (error) {
            console.error(`Error loading technologies/processes for function capability ${fc.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error loading technologies/processes:', error);
    }
    this.technologiesProcesses = allTP;

    // Load assessment responses
    try {
      this.assessmentResponses = await this.data.getAssessmentResponses();
    } catch (error) {
      console.error('Error loading assessment responses:', error);
      this.assessmentResponses = [];
    }

    this.results = this.buildResults();
  }

  onPillarChange() {
    this.results = this.buildResults();
  }

  buildResults() {
    // This should be replaced with real assessment response fetching logic
    // For now, just show all technologies/processes with no status
    let filteredTP = this.technologiesProcesses;
    if (this.selectedPillarId) {
      const fcIds = this.functionCapabilities.filter(fc => fc.pillar_id === this.selectedPillarId).map(fc => fc.id);
      filteredTP = filteredTP.filter(tp => fcIds.includes(tp.function_capability_id));
    }
    return filteredTP.map(tp => {
      const fc = this.functionCapabilities.find(f => f.id === tp.function_capability_id);
      const pillar = this.pillars.find(p => p.id === fc?.pillar_id);
      const ms = this.maturityStages.find(m => m.id === tp.maturity_stage_id);
      // Find assessment response for this technology/process (if available)
      const ar = this.assessmentResponses.find(a => a.tech_process_id === tp.id);
      return {
        pillarName: pillar?.name || '',
        functionCapabilityName: fc?.name || '',
        functionCapabilityType: fc?.type || '',
        description: tp.description,
        type: tp.type,
        maturityStageName: ms?.name || '',
        status: ar?.status || 'Not Assessed',
        notes: ar?.notes || ''
      };
    });
  }

  getMaturityStageStatusClass(status: string): string {
    switch (status) {
      case 'green': return 'bg-success';
      case 'yellow': return 'bg-warning';
      case 'red': return 'bg-danger';
      case 'not-assessed': return 'bg-secondary';
      default: return 'bg-light';
    }
  }

  getMaturityStageStatusText(status: string): string {
    switch (status) {
      case 'green': return 'Fully Implemented';
      case 'yellow': return 'Partially Implemented';
      case 'red': return 'Not Implemented';
      case 'not-assessed': return 'Not Assessed';
      default: return 'Unknown';
    }
  }

  getMaturityStageStatusIcon(status: string): string {
    switch (status) {
      case 'green': return 'bi-check-circle-fill';
      case 'yellow': return 'bi-exclamation-triangle-fill';
      case 'red': return 'bi-x-circle-fill';
      case 'not-assessed': return 'bi-question-circle-fill';
      default: return 'bi-circle';
    }
  }

  calculateFunctionMaturityStages(items: ResultItem[]): StageResult[] {
    const stageResults: StageResult[] = [];

    // Group items by maturity stage for this function
    for (const stage of this.maturityStages) {
      const stageItems = items.filter(item => item.maturityStageName === stage.name);

      if (stageItems.length === 0) {
        continue; // Skip stages with no items for this function
      }

      // Calculate status based on assessment results for this stage within this function
      const fullyImplementedCount = stageItems.filter(item => item.status === 'Fully Implemented').length;
      const partiallyImplementedCount = stageItems.filter(item => item.status === 'Partially Implemented').length;
      const notImplementedCount = stageItems.filter(item => item.status === 'Not Implemented').length;
      const assessedCount = fullyImplementedCount + partiallyImplementedCount + notImplementedCount;

      let status: 'green' | 'yellow' | 'red' | 'not-assessed';

      if (assessedCount === 0) {
        status = 'not-assessed';
      } else if (fullyImplementedCount === stageItems.length) {
        // All items in this stage are fully implemented - GREEN
        status = 'green';
      } else if (assessedCount === stageItems.length && notImplementedCount === stageItems.length) {
        // All items are assessed but none implemented - RED
        status = 'red';
      } else {
        // Some implementation (mix of partial, full, or not implemented) - YELLOW
        status = 'yellow';
      }

      stageResults.push({
        stage,
        status,
        assessedCount,
        totalCount: stageItems.length,
        completionPercentage: stageItems.length > 0 ? Math.round((assessedCount / stageItems.length) * 100) : 0
      });
    }

    // Sort by maturity stage order
    const stageOrder = ['Traditional', 'Initial', 'Advanced', 'Optimal'];
    stageResults.sort((a, b) => stageOrder.indexOf(a.stage.name) - stageOrder.indexOf(b.stage.name));

    return stageResults;
  }

  get groupedResults(): PillarResult[] {
    const grouped: Record<string, {
      pillarName: string;
      functions: Record<string, {
        functionCapabilityName: string;
        functionCapabilityType: string;
        items: ResultItem[];
      }>;
      totalItems: number;
      assessedItems: number;
    }> = {};

    for (const result of this.results) {
      const pillarKey = result.pillarName;
      const functionKey = result.functionCapabilityName;

      // Initialize pillar group if it doesn't exist
      if (!grouped[pillarKey]) {
        grouped[pillarKey] = {
          pillarName: result.pillarName,
          functions: {},
          totalItems: 0,
          assessedItems: 0
        };
      }

      // Initialize function group within pillar if it doesn't exist
      if (!grouped[pillarKey].functions[functionKey]) {
        grouped[pillarKey].functions[functionKey] = {
          functionCapabilityName: result.functionCapabilityName,
          functionCapabilityType: result.functionCapabilityType,
          items: []
        };
      }

      // Add the item to the function group
      grouped[pillarKey].functions[functionKey].items.push(result);
      grouped[pillarKey].totalItems++;
      if (result.status !== 'Not Assessed') {
        grouped[pillarKey].assessedItems++;
      }
    }

    // Convert to array format and sort
    const pillarArray = Object.keys(grouped).map(pillarName => {
      const pillar = grouped[pillarName];

      // Convert functions object to array and sort
      const functionsArray = Object.keys(pillar.functions).map(functionName => {
        const func = pillar.functions[functionName];

        // Calculate maturity stage status for this function
        const maturityStageStatus = this.calculateFunctionMaturityStages(func.items);

        // Calculate assessment counts for this function
        const assessedCount = func.items.filter(item => item.status !== 'Not Assessed').length;
        const totalItems = func.items.length;

        // Sort items within each function by maturity stage and description
        func.items.sort((a, b) => {
          const stageOrder = ['Traditional', 'Initial', 'Advanced', 'Optimal'];
          const stageComparison = stageOrder.indexOf(a.maturityStageName) - stageOrder.indexOf(b.maturityStageName);
          if (stageComparison !== 0) {
            return stageComparison;
          }
          return a.description.localeCompare(b.description);
        });

        return {
          ...func,
          maturityStageStatus,
          assessedCount,
          totalItems,
          assessmentPercentage: totalItems > 0 ? Math.round((assessedCount / totalItems) * 100) : 0
        };
      });

      // Sort functions alphabetically
      functionsArray.sort((a, b) => a.functionCapabilityName.localeCompare(b.functionCapabilityName));

      return {
        pillarName: pillar.pillarName,
        functions: functionsArray,
        totalItems: pillar.totalItems,
        assessedItems: pillar.assessedItems,
        assessmentPercentage: pillar.totalItems > 0 ? Math.round((pillar.assessedItems / pillar.totalItems) * 100) : 0
      };
    });

    // Sort pillars alphabetically
    pillarArray.sort((a, b) => a.pillarName.localeCompare(b.pillarName));

    return pillarArray;
  }
}
