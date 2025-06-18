import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, style, transition, animate } from '@angular/animations';
import { ZtmmDataWebService } from '../../services/ztmm-data-web.service';
import { Pillar, FunctionCapability, TechnologyProcess, MaturityStage, AssessmentResponse } from '../../models/ztmm.models';

interface MaturityStageBreakdown {
  stageName: string;
  assessed: number;
  total: number;
  percentage: number;
  status: 'green' | 'yellow' | 'red' | 'not-assessed';
}

interface FunctionSummary {
  functionCapability: FunctionCapability;
  assessedItems: number;
  totalItems: number;
  assessmentPercentage: number;
  overallMaturityStage: string;
  maturityStageBreakdown: MaturityStageBreakdown[];
}

interface PillarSummary {
  pillar: Pillar;
  functions: FunctionSummary[];
  assessedItems: number;
  totalItems: number;
  assessmentPercentage: number;
  overallMaturityStage: string;
  maturityStageBreakdown: MaturityStageBreakdown[];
}

interface DetailedAssessmentItem {
  pillarName: string;
  functionCapabilityName: string;
  functionCapabilityType: string;
  name: string;
  description: string;
  type: string;
  maturityStageName: string;
  status: string;
  notes: string;
}

type ViewLevel = 'pillar-overview' | 'pillar-detail' | 'function-detail';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('300ms ease-in', style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class ReportsComponent implements OnInit {
  // Data
  pillars: Pillar[] = [];
  functionCapabilities: FunctionCapability[] = [];
  maturityStages: MaturityStage[] = [];
  technologiesProcesses: TechnologyProcess[] = [];
  assessmentResponses: AssessmentResponse[] = [];

  // UI State
  currentView: ViewLevel = 'pillar-overview';
  selectedPillarId: number | null = null;
  selectedFunctionId: number | null = null;
  isExportingDoc = false;
  dropdownOpen = false;

  // Computed Data
  pillarSummaries: PillarSummary[] = [];
  selectedPillarSummary: PillarSummary | null = null;
  selectedFunctionSummary: FunctionSummary | null = null;
  selectedFunctionDetails: DetailedAssessmentItem[] = [];

  // Display options
  showTechnologyDescriptions = false;

  constructor(
    private data: ZtmmDataWebService,
  ) {}

  async ngOnInit() {
    await this.loadAll();
  }

  async loadAll() {
    try {
      this.pillars = await this.data.getPillars();
      this.functionCapabilities = await this.data.getFunctionCapabilities();
      this.maturityStages = await this.data.getMaturityStages();
      this.technologiesProcesses = await this.data.getAllTechnologiesProcesses();
      this.assessmentResponses = await this.data.getAssessmentResponses();

      this.buildPillarSummaries();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  buildPillarSummaries() {
    this.pillarSummaries = [];

    for (const pillar of this.pillars) {
      const pillarFunctions = this.functionCapabilities.filter(fc => fc.pillar_id === pillar.id);
      const functions: FunctionSummary[] = [];
      let totalPillarItems = 0;
      let assessedPillarItems = 0;
      const pillarMaturityBreakdown: Record<string, { assessed: number; total: number }> = {};

      // Initialize pillar maturity stage breakdown
      for (const stage of this.maturityStages) {
        pillarMaturityBreakdown[stage.name] = { assessed: 0, total: 0 };
      }

      // Process each function in the pillar
      for (const func of pillarFunctions) {
        const functionTechProcesses = this.technologiesProcesses.filter(tp => tp.function_capability_id === func.id);
        let functionAssessedItems = 0;
        const functionMaturityBreakdown: Record<string, { assessed: number; total: number }> = {};

        // Initialize function maturity stage breakdown
        for (const stage of this.maturityStages) {
          functionMaturityBreakdown[stage.name] = { assessed: 0, total: 0 };
        }

        // Process each technology/process in the function
        for (const tp of functionTechProcesses) {
          const maturityStage = this.maturityStages.find(ms => ms.id === tp.maturity_stage_id);
          const assessment = this.assessmentResponses.find(ar => ar.tech_process_id === tp.id);

          if (maturityStage) {
            functionMaturityBreakdown[maturityStage.name].total++;
            pillarMaturityBreakdown[maturityStage.name].total++;

            // Only count as assessed if there's an assessment response (regardless of status)
            if (assessment) {
              functionMaturityBreakdown[maturityStage.name].assessed++;
              pillarMaturityBreakdown[maturityStage.name].assessed++;
              functionAssessedItems++;
            }
          }
        }

        // Calculate function maturity stage breakdown
        const functionMaturityStageBreakdown: MaturityStageBreakdown[] = this.maturityStages.map(stage => {
          const breakdown = functionMaturityBreakdown[stage.name];
          const percentage = breakdown.total > 0 ? Math.round((breakdown.assessed / breakdown.total) * 100) : 0;

          let status: 'green' | 'yellow' | 'red' | 'not-assessed';
          if (breakdown.total === 0) {
            status = 'not-assessed';
          } else if (percentage === 100) {
            status = 'green';
          } else if (percentage === 0) {
            status = 'red';
          } else {
            status = 'yellow';
          }

          return {
            stageName: stage.name,
            assessed: breakdown.assessed,
            total: breakdown.total,
            percentage,
            status
          };
        }).filter(breakdown => breakdown.total > 0);

        const overallMaturityStage = this.calculateOverallMaturityStage(functionMaturityStageBreakdown);

        functions.push({
          functionCapability: func,
          assessedItems: functionAssessedItems,
          totalItems: functionTechProcesses.length,
          assessmentPercentage: functionTechProcesses.length > 0 ? Math.round((functionAssessedItems / functionTechProcesses.length) * 100) : 0,
          overallMaturityStage,
          maturityStageBreakdown: functionMaturityStageBreakdown
        });

        totalPillarItems += functionTechProcesses.length;
        assessedPillarItems += functionAssessedItems;
      }

      // Calculate pillar maturity stage breakdown
      const pillarMaturityStageBreakdown: MaturityStageBreakdown[] = this.maturityStages.map(stage => {
        const breakdown = pillarMaturityBreakdown[stage.name];
        const percentage = breakdown.total > 0 ? Math.round((breakdown.assessed / breakdown.total) * 100) : 0;

        let status: 'green' | 'yellow' | 'red' | 'not-assessed';
        if (breakdown.total === 0) {
          status = 'not-assessed';
        } else if (percentage === 100) {
          status = 'green';
        } else if (percentage === 0) {
          status = 'red';
        } else {
          status = 'yellow';
        }

        return {
          stageName: stage.name,
          assessed: breakdown.assessed,
          total: breakdown.total,
          percentage,
          status
        };
      }).filter(breakdown => breakdown.total > 0);

      const pillarOverallMaturityStage = this.calculatePillarMaturityStage(functions);

      this.pillarSummaries.push({
        pillar,
        functions,
        assessedItems: assessedPillarItems,
        totalItems: totalPillarItems,
        assessmentPercentage: totalPillarItems > 0 ? Math.round((assessedPillarItems / totalPillarItems) * 100) : 0,
        overallMaturityStage: pillarOverallMaturityStage,
        maturityStageBreakdown: pillarMaturityStageBreakdown
      });
    }
  }

  calculateOverallMaturityStage(maturityBreakdown: MaturityStageBreakdown[]): string {
    const implementedStages = maturityBreakdown.filter(mb => mb.status === 'green');
    if (implementedStages.length === 0) return 'Traditional';

    const stageOrder = ['Traditional', 'Initial', 'Advanced', 'Optimal'];
    const highestImplemented = implementedStages
      .map(mb => mb.stageName)
      .sort((a, b) => stageOrder.indexOf(b) - stageOrder.indexOf(a))[0];

    return highestImplemented || 'Traditional';
  }

  calculatePillarMaturityStage(functions: FunctionSummary[]): string {
    if (functions.length === 0) return 'Traditional';

    const stageOrder = ['Traditional', 'Initial', 'Advanced', 'Optimal'];
    const functionStages = functions.map(f => f.overallMaturityStage);

    // Find the most common maturity stage
    const stageCounts: Record<string, number> = {};
    functionStages.forEach(stage => {
      stageCounts[stage] = (stageCounts[stage] || 0) + 1;
    });

    const maxCount = Math.max(...Object.values(stageCounts));
    const mostCommonStages = Object.keys(stageCounts).filter(stage => stageCounts[stage] === maxCount);

    // If multiple stages are tied, return the highest
    return mostCommonStages.sort((a, b) => stageOrder.indexOf(b) - stageOrder.indexOf(a))[0] || 'Traditional';
  }

  // Navigation methods
  showPillarDetail(pillarSummary: PillarSummary) {
    this.selectedPillarSummary = pillarSummary;
    this.selectedPillarId = pillarSummary.pillar.id;
    this.currentView = 'pillar-detail';
  }

  showFunctionDetail(functionSummary: FunctionSummary) {
    this.selectedFunctionSummary = functionSummary;
    this.selectedFunctionId = functionSummary.functionCapability.id;
    this.currentView = 'function-detail';
    this.loadFunctionDetails();
  }

  loadFunctionDetails() {
    if (!this.selectedFunctionSummary) return;

    const functionTechProcesses = this.technologiesProcesses.filter(
      tp => tp.function_capability_id === this.selectedFunctionSummary!.functionCapability.id
    );

    this.selectedFunctionDetails = functionTechProcesses.map(tp => {
      const maturityStage = this.maturityStages.find(ms => ms.id === tp.maturity_stage_id);
      const assessment = this.assessmentResponses.find(ar => ar.tech_process_id === tp.id);
      const pillar = this.pillars.find(p => p.id === this.selectedFunctionSummary!.functionCapability.pillar_id);

      return {
        pillarName: pillar?.name || '',
        functionCapabilityName: this.selectedFunctionSummary!.functionCapability.name,
        functionCapabilityType: this.selectedFunctionSummary!.functionCapability.type,
        name: tp.name,
        description: tp.description,
        type: tp.type,
        maturityStageName: maturityStage?.name || '',
        status: assessment?.status || 'Not Assessed',
        notes: assessment?.notes || ''
      };
    });

    // Sort by maturity stage order
    const stageOrder = ['Traditional', 'Initial', 'Advanced', 'Optimal'];
    this.selectedFunctionDetails.sort((a, b) => {
      const stageComparison = stageOrder.indexOf(a.maturityStageName) - stageOrder.indexOf(b.maturityStageName);
      if (stageComparison !== 0) return stageComparison;
      return a.name.localeCompare(b.name);
    });
  }

  goBackToPillarOverview() {
    this.currentView = 'pillar-overview';
    this.selectedPillarSummary = null;
    this.selectedFunctionSummary = null;
    this.selectedPillarId = null;
    this.selectedFunctionId = null;
  }

  goBackToPillarDetail() {
    this.currentView = 'pillar-detail';
    this.selectedFunctionSummary = null;
    this.selectedFunctionId = null;
    this.selectedFunctionDetails = [];
  }

  // Helper methods for UI
  getMaturityStageColor(stageName: string): string {
    switch (stageName) {
      case 'Traditional': return 'bg-secondary';
      case 'Initial': return 'bg-warning';
      case 'Advanced': return 'bg-info';
      case 'Optimal': return 'bg-success';
      default: return 'bg-light';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'green': return 'bg-success text-white';
      case 'yellow': return 'bg-warning text-dark';
      case 'red': return 'bg-danger text-white';
      case 'not-assessed': return 'bg-secondary text-white';
      default: return 'bg-light text-dark';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'green': return 'bi-check-circle-fill';
      case 'yellow': return 'bi-exclamation-triangle-fill';
      case 'red': return 'bi-x-circle-fill';
      case 'not-assessed': return 'bi-question-circle-fill';
      default: return 'bi-circle';
    }
  }

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

  private getPillarColor(pillarName: string): string {
    const colors: Record<string, string> = {
      'Identity': '#2E86C1',
      'Device': '#28B463',
      'Network': '#F39C12',
      'Application Workload': '#E74C3C',
      'Data': '#8E44AD',
      'Visibility and Analytics': '#17A2B8'
    };
    return colors[pillarName] || '#6C757D';
  }

  private generateRecommendations(pillarSummary: any): string[] {
    const recommendations: string[] = [];

    if (pillarSummary.assessmentPercentage < 50) {
      recommendations.push(`Focus on basic implementation for ${pillarSummary.pillar.name}`);
      recommendations.push('Develop comprehensive strategy and roadmap');
    } else if (pillarSummary.assessmentPercentage < 80) {
      recommendations.push(`Enhance existing ${pillarSummary.pillar.name} implementations`);
      recommendations.push('Address identified gaps and improve processes');
    } else {
      recommendations.push(`Optimize ${pillarSummary.pillar.name} for advanced maturity`);
      recommendations.push('Consider automation and advanced monitoring');
    }

    return recommendations;
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown(): void {
    this.dropdownOpen = false;
  }

  toggleTechnologyDescriptions(): void {
    this.showTechnologyDescriptions = !this.showTechnologyDescriptions;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdownButton = target.closest('.btn-group');
    if (!dropdownButton && this.dropdownOpen) {
      this.dropdownOpen = false;
    }
  }
}
