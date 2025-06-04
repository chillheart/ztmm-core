import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { ZtmmDataService } from './services/ztmm-data.service';
import { Pillar, FunctionCapability, MaturityStage, TechnologyProcess, AssessmentStatus } from './models/ztmm.models';

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
  assessmentResponses: any[] = [];
  pillarSummary: any[] = [];

  selectedPillarId: number | null = null;
  selectedFunctionCapabilityId: number | null = null;

  assessmentStatuses: (AssessmentStatus | null)[] = [];
  assessmentNotes: string[] = [];
  statusOptions: AssessmentStatus[] = ['Not Implemented', 'Partially Implemented', 'Fully Implemented'];
  showSuccess = false;

  constructor(private data: ZtmmDataService) {
    this.loadAll();
  }

  async loadAll() {
    this.pillars = await this.data.getPillars();
    this.functionCapabilities = await this.data.getFunctionCapabilities();
    this.maturityStages = await this.data.getMaturityStages();
    this.assessmentResponses = await this.data.getAssessmentResponses();
    this.technologiesProcesses = [];
    this.assessmentStatuses = [];
    this.assessmentNotes = [];
    this.pillarSummary = [];
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
      // Load technologies/processes for the selected function capability
      this.technologiesProcesses = await this.data.getTechnologiesProcesses(this.selectedFunctionCapabilityId);
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
    return this.maturityStages.find(ms => ms.id === id)?.name || '';
  }

  getFunctionCapabilityName(id: number) {
    return this.functionCapabilities.find(fc => fc.id === id)?.name || '';
  }

  getSelectedFunctionCapabilityName() {
    if (!this.selectedFunctionCapabilityId) return '';
    return this.functionCapabilities.find(fc => fc.id === this.selectedFunctionCapabilityId)?.name || '';
  }

  getSelectedFunctionCapabilityType() {
    if (!this.selectedFunctionCapabilityId) return '';
    return this.functionCapabilities.find(fc => fc.id === this.selectedFunctionCapabilityId)?.type || '';
  }

  getButtonClass(summary: any): string {
    if (summary.totalCount === 0) {
      return 'btn btn-sm btn-outline-secondary';
    }
    return this.selectedFunctionCapabilityId === summary.functionCapability.id ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-outline-primary';
  }

  getButtonText(summary: any): string {
    if (summary.totalCount === 0) {
      return 'No Items';
    }
    return this.selectedFunctionCapabilityId === summary.functionCapability.id ? 'Assessing' : 'Assess';
  }

  onAssessButtonClick(summary: any): void {
    if (summary.totalCount > 0) {
      this.selectedFunctionCapabilityId = summary.functionCapability.id;
      this.onFunctionCapabilityChange();
    }
  }

  async buildPillarSummary() {
    this.pillarSummary = [];

    // Get all function capabilities for this pillar
    const filteredFunctionCapabilities = this.functionCapabilities.filter(fc => fc.pillar_id === this.selectedPillarId);

    for (const fc of filteredFunctionCapabilities) {
      // Get all technologies/processes for this function capability
      const techProcesses = await this.data.getTechnologiesProcesses(fc.id);

      // Count completed assessments
      const completedCount = techProcesses.filter(tp =>
        this.assessmentResponses.some(ar => ar.tech_process_id === tp.id)
      ).length;

      this.pillarSummary.push({
        functionCapability: fc,
        totalCount: techProcesses.length,
        completedCount: completedCount,
        completionPercentage: techProcesses.length > 0 ? Math.round((completedCount / techProcesses.length) * 100) : 0
      });
    }
  }

  async submitAssessment() {
    for (let i = 0; i < this.technologiesProcesses.length; i++) {
      if (this.assessmentStatuses[i]) {
        await this.data.saveAssessment(
          this.technologiesProcesses[i].id,
          this.assessmentStatuses[i]!,
          this.assessmentNotes[i]
        );
      }
    }
    this.showSuccess = true;
    setTimeout(() => (this.showSuccess = false), 2000);
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
