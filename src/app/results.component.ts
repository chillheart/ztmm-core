import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { ZtmmDataService } from './services/ztmm-data.service';
import { Pillar, FunctionCapability, TechnologyProcess, AssessmentResponse, MaturityStage } from './models/ztmm.models';

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
  assessmentResponses: any[] = [];
  results: any[] = [];
  selectedPillarId: number | null = null;

  constructor(private data: ZtmmDataService) {
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

    // For demo: simulate fetching assessment responses (should be replaced with real fetch if available)
    this.assessmentResponses = [];
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
      const ar = this.assessmentResponses.find((a: any) => a.tech_process_id === tp.id);
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

  get groupedResults() {
    const grouped: { [key: string]: any } = {};

    for (const result of this.results) {
      const key = `${result.functionCapabilityName}-${result.pillarName}`;
      if (!grouped[key]) {
        grouped[key] = {
          functionCapabilityName: result.functionCapabilityName,
          pillarName: result.pillarName,
          items: []
        };
      }
      grouped[key].items.push(result);
    }

    return Object.values(grouped);
  }
}
