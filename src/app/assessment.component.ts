import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZtmmDataWebService } from './services/ztmm-data-web.service';
import { Pillar, FunctionCapability, MaturityStage, TechnologyProcess, AssessmentResponse } from './models/ztmm.models';
import { AssessmentStatus } from './models/ztmm.models';

interface PillarSummary {
  functionCapability: FunctionCapability;
  totalCount: number;
  completedCount: number;
  completionPercentage: number;
}

@Component({
  selector: 'app-assessment',
  templateUrl: './assessment.component.html',
  styleUrls: ['./assessment.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AssessmentComponent {
  pillars: Pillar[] = [];
  functionCapabilities: FunctionCapability[] = [];
  maturityStages: MaturityStage[] = [];
  technologiesProcesses: TechnologyProcess[] = [];
  assessmentResponses: AssessmentResponse[] = [];
  pillarSummary: PillarSummary[] = [];

  selectedPillarId: number | null = null;
  selectedFunctionCapabilityId: number | null = null;

  assessmentStatuses: (AssessmentStatus | null)[] = [];
  assessmentNotes: string[] = [];
  statusOptions: AssessmentStatus[] = ['Not Implemented', 'Partially Implemented', 'Fully Implemented'];
  showSuccess = false;

  constructor(private data: ZtmmDataWebService) {
    this.loadAll();
  }

  async loadAll() {
    console.log('🔄 Assessment component loadAll starting');

    try {
      // Load all core data with enhanced debugging
      console.log('🔄 Loading pillars...');
      this.pillars = await this.data.getPillars();
      console.log('✅ Assessment: Pillars loaded:', this.pillars.length);

      console.log('🔄 Loading function capabilities...');
      this.functionCapabilities = await this.data.getFunctionCapabilities();
      console.log('✅ Assessment: Function capabilities loaded:', this.functionCapabilities.length);

      console.log('🔄 Loading maturity stages...');
      this.maturityStages = await this.data.getMaturityStages();
      console.log('✅ Assessment: Maturity stages loaded:', this.maturityStages.length);

      console.log('🔄 Loading assessment responses...');
      this.assessmentResponses = await this.data.getAssessmentResponses();
      console.log('✅ Assessment: Assessment responses loaded:', this.assessmentResponses.length);

      // Test the technologies/processes loading
      console.log('🔄 Testing technologies/processes loading...');
      const allTech = await this.data.getAllTechnologiesProcesses();
      console.log('✅ Assessment: Total technologies/processes available:', allTech.length);

      if (allTech.length > 0) {
        console.log('📊 Sample technology/process:', allTech[0]);
        const fcIds = [...new Set(allTech.map(tp => tp.function_capability_id))];
        console.log('📊 Function capability IDs referenced by tech/processes:', fcIds);
      }

    } catch (error) {
      console.error('❌ Error loading assessment data:', error);
      // Initialize empty arrays to prevent errors
      this.pillars = [];
      this.functionCapabilities = [];
      this.maturityStages = [];
      this.assessmentResponses = [];
    }

    // Reset component state
    this.technologiesProcesses = [];
    this.assessmentStatuses = [];
    this.assessmentNotes = [];
    this.pillarSummary = [];

    console.log('🔄 Assessment component loadAll completed');
  }

  async onPillarChange() {
    if (this.selectedPillarId) {
      // Build summary for this pillar
      await this.buildPillarSummary();
    } else {
      this.pillarSummary = [];
    }
    // Reset function capability selection and clear technologies/processes
    this.selectedFunctionCapabilityId = null;
    this.technologiesProcesses = [];
    this.assessmentStatuses = [];
    this.assessmentNotes = [];
  }

  async onFunctionCapabilityChange() {
    if (this.selectedFunctionCapabilityId) {
      // Use specialized method for loading technologies/processes by function capability
      this.technologiesProcesses = await this.data.getTechnologiesProcessesByFunction(this.selectedFunctionCapabilityId);
      this.assessmentStatuses = Array(this.technologiesProcesses.length).fill(null);
      this.assessmentNotes = Array(this.technologiesProcesses.length).fill('');

      // Load existing assessment data if available
      for (let i = 0; i < this.technologiesProcesses.length; i++) {
        const tp = this.technologiesProcesses[i];
        const existingAssessment = this.assessmentResponses.find(ar => ar.tech_process_id === tp.id);
        if (existingAssessment) {
          this.assessmentStatuses[i] = existingAssessment.status;
          this.assessmentNotes[i] = existingAssessment.notes || '';
        }
      }
    } else {
      this.technologiesProcesses = [];
      this.assessmentStatuses = [];
      this.assessmentNotes = [];
    }
  }

  getMaturityStageName(id: number) {
    return this.maturityStages.find(ms => ms.id === id)?.name || 'Unknown';
  }

  getFunctionCapabilityName(id: number) {
    return this.functionCapabilities.find(fc => fc.id === id)?.name || 'Unknown';
  }

  getSelectedFunctionCapabilityName() {
    if (!this.selectedFunctionCapabilityId) return '';
    return this.functionCapabilities.find(fc => fc.id === this.selectedFunctionCapabilityId)?.name || '';
  }

  getSelectedFunctionCapabilityType() {
    if (!this.selectedFunctionCapabilityId) return '';
    return this.functionCapabilities.find(fc => fc.id === this.selectedFunctionCapabilityId)?.type || '';
  }

  getButtonClass(summary: PillarSummary): string {
    if (summary.totalCount === 0) {
      return 'btn btn-sm btn-outline-secondary';
    }
    return this.selectedFunctionCapabilityId === summary.functionCapability.id ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-outline-primary';
  }

  getButtonText(summary: PillarSummary): string {
    if (summary.totalCount === 0) {
      return 'No Items';
    }
    return this.selectedFunctionCapabilityId === summary.functionCapability.id ? 'Assessing' : 'Assess';
  }

  onAssessButtonClick(summary: PillarSummary): void {
    if (summary.totalCount > 0) {
      this.selectedFunctionCapabilityId = summary.functionCapability.id;
      this.onFunctionCapabilityChange();
    }
  }

  async buildPillarSummary() {
    this.pillarSummary = [];

    try {
      // Get all function capabilities for this pillar
      const filteredFunctionCapabilities = this.functionCapabilities.filter(fc => fc.pillar_id === this.selectedPillarId);

      if (filteredFunctionCapabilities.length === 0) {
        return;
      }

      for (const fc of filteredFunctionCapabilities) {
        try {
          // Use specialized method for loading technologies/processes by function capability
          const techProcesses = await this.data.getTechnologiesProcessesByFunction(fc.id);
          console.log(`🔄 Loaded ${techProcesses.length} technologies/processes for function capability ${fc.name} (${fc.id})`);
          // Count completed assessments
          const completedCount = techProcesses.filter(tp =>
            this.assessmentResponses.some(ar => ar.tech_process_id === tp.id)
          ).length;

          const summary = {
            functionCapability: fc,
            totalCount: techProcesses.length,
            completedCount: completedCount,
            completionPercentage: techProcesses.length > 0 ? Math.round((completedCount / techProcesses.length) * 100) : 0
          };

          this.pillarSummary.push(summary);
        } catch (fcError) {
          console.error('Error processing function capability', fc.id, ':', fcError);
          // Still add the function capability with 0 count to show it exists
          this.pillarSummary.push({
            functionCapability: fc,
            totalCount: 0,
            completedCount: 0,
            completionPercentage: 0
          });
        }
      }

    } catch (error) {
      console.error('Error building pillar summary:', error);
      this.pillarSummary = [];
    }
  }

  async submitAssessment() {
    try {
      for (let i = 0; i < this.technologiesProcesses.length; i++) {
        const status = this.assessmentStatuses[i];
        if (status) {
          await this.data.saveAssessment(
            this.technologiesProcesses[i].id,
            status,
            this.assessmentNotes[i]
          );
        }
      }
      this.showSuccess = true;
      setTimeout(() => (this.showSuccess = false), 2000);
    } catch (error) {
      console.error('Error saving assessment:', error);
      this.showSuccess = false;
    }
  }

  async saveAll() {
    // Save all assessment statuses and notes for each technology/process
    for (let i = 0; i < this.technologiesProcesses.length; i++) {
      const tp = this.technologiesProcesses[i];
      const status = this.assessmentStatuses[i];
      const notes = this.assessmentNotes[i];
      if (status) {
        await this.data.saveAssessment(tp.id, status, notes);
      }
    }
    // Reload assessment responses and rebuild summary
    this.assessmentResponses = await this.data.getAssessmentResponses();
    await this.buildPillarSummary();

    // Show success message
    this.showSuccess = true;
    setTimeout(() => (this.showSuccess = false), 3000);
  }

}
