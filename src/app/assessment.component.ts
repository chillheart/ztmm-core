import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
  imports: [CommonModule, FormsModule, RouterModule]
})
export class AssessmentComponent implements OnInit, OnDestroy {
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
  statusOptions: AssessmentStatus[] = ['Not Implemented', 'Partially Implemented', 'Fully Implemented', 'Superseded'];
  showSuccess = false;

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 0;
  paginatedTechnologiesProcesses: TechnologyProcess[] = [];

  // Auto-save properties
  private autoSaveTimeout: number | null = null;
  private readonly autoSaveDelay = 1000; // 1 second delay
  isAutoSaving = false;

  // Make Math available to template
  Math = Math;

  constructor(private data: ZtmmDataWebService) {
    // Constructor should only set up dependencies, not call async methods
  }

  ngOnInit() {
    this.loadAll();
  }

  async loadAll(resetUIState = true) {
    // Reset UI arrays only if requested (default behavior for normal app usage)
    if (resetUIState) {
      this.technologiesProcesses = [];
      this.assessmentStatuses = [];
      this.assessmentNotes = [];
      this.pillarSummary = [];
      this.selectedPillarId = null;
      this.selectedFunctionCapabilityId = null;
    }

    // Load each data source independently with error handling
    try {
      this.pillars = await this.data.getPillars();
    } catch (error) {
      console.error('❌ Error loading pillars:', error);
      this.pillars = [];
    }

    try {
      this.functionCapabilities = await this.data.getFunctionCapabilities();
    } catch (error) {
      console.error('❌ Error loading function capabilities:', error);
      this.functionCapabilities = [];
    }

    try {
      this.maturityStages = await this.data.getMaturityStages();
    } catch (error) {
      console.error('❌ Error loading maturity stages:', error);
      this.maturityStages = [];
    }

    try {
      this.assessmentResponses = await this.data.getAssessmentResponses();
    } catch (error) {
      console.error('❌ Error loading assessment responses:', error);
      this.assessmentResponses = [];
    }
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

      // Reset pagination to first page and update pagination
      this.currentPage = 1;
      this.updatePagination();
    } else {
      this.technologiesProcesses = [];
      this.assessmentStatuses = [];
      this.assessmentNotes = [];
      this.paginatedTechnologiesProcesses = [];
      this.totalPages = 0;
      this.currentPage = 1;
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

  async saveCurrentPage() {
    // Save only the current page assessments
    for (let i = 0; i < this.paginatedTechnologiesProcesses.length; i++) {
      const globalIndex = this.getGlobalItemIndex(i);
      const tp = this.paginatedTechnologiesProcesses[i];
      const status = this.assessmentStatuses[globalIndex];
      const notes = this.assessmentNotes[globalIndex];
      if (status) {
        await this.data.saveAssessment(tp.id, status, notes);
      }
    }

    // Reload assessment responses and rebuild summary
    this.assessmentResponses = await this.data.getAssessmentResponses();
    await this.buildPillarSummary();

    // Show success message
    this.showSuccess = true;
    setTimeout(() => (this.showSuccess = false), 2000);
  }

  // Pagination methods
  updatePagination() {
    this.totalPages = Math.ceil(this.technologiesProcesses.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedTechnologiesProcesses = this.technologiesProcesses.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;

    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
      const end = Math.min(this.totalPages, start + maxVisible - 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  getCurrentProgress(): number {
    if (this.technologiesProcesses.length === 0) return 0;
    const completedCount = this.assessmentStatuses.filter(status => status !== null).length;
    return Math.round((completedCount / this.technologiesProcesses.length) * 100);
  }

  getGlobalItemIndex(localIndex: number): number {
    return (this.currentPage - 1) * this.itemsPerPage + localIndex;
  }

  // Auto-save functionality
  onAssessmentChange(index: number, field: 'status' | 'notes', value: AssessmentStatus | null | string) {
    const globalIndex = this.getGlobalItemIndex(index);

    if (field === 'status') {
      this.assessmentStatuses[globalIndex] = value as AssessmentStatus | null;
    } else {
      this.assessmentNotes[globalIndex] = value as string;
    }

    // Clear existing timeout
    if (this.autoSaveTimeout) {
      window.clearTimeout(this.autoSaveTimeout);
    }

    // Set new timeout for auto-save
    this.autoSaveTimeout = window.setTimeout(() => {
      this.autoSaveCurrentItem(globalIndex);
    }, this.autoSaveDelay) as number;
  }

  private async autoSaveCurrentItem(globalIndex: number) {
    const tp = this.technologiesProcesses[globalIndex];
    const status = this.assessmentStatuses[globalIndex];

    if (tp && status) {
      try {
        this.isAutoSaving = true;
        await this.data.saveAssessment(
          tp.id,
          status,
          this.assessmentNotes[globalIndex] || ''
        );

        // Reload assessment responses and rebuild summary
        this.assessmentResponses = await this.data.getAssessmentResponses();
        await this.buildPillarSummary();

        this.isAutoSaving = false;
      } catch (error) {
        console.error('Error auto-saving assessment:', error);
        this.isAutoSaving = false;
      }
    }
  }

  ngOnDestroy() {
    // Clean up timeout on component destruction
    if (this.autoSaveTimeout) {
      window.clearTimeout(this.autoSaveTimeout);
    }
  }

  // Helper methods for event handling
  onStatusChange(event: Event, index: number) {
    const target = event.target as HTMLSelectElement;
    this.onAssessmentChange(index, 'status', target.value);
  }

  onNotesChange(event: Event, index: number) {
    const target = event.target as HTMLTextAreaElement;
    this.onAssessmentChange(index, 'notes', target.value);
  }

  // Helper method for getting selected pillar name
  getSelectedPillarName(): string {
    if (!this.selectedPillarId) return 'Selected Pillar';
    return this.pillars.find(p => p.id === this.selectedPillarId)?.name || 'Selected Pillar';
  }
}
