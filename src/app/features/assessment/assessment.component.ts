import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { trigger, style, transition, animate, query, stagger } from '@angular/animations';
import { ZtmmDataWebService } from '../../services/ztmm-data-web.service';
import { Pillar, FunctionCapability, MaturityStage, TechnologyProcess, AssessmentResponse } from '../../models/ztmm.models';
import { AssessmentStatus } from '../../models/ztmm.models';
import { OverallProgressSummaryComponent, OverallPillarProgress } from './overall-progress-summary.component';
import { PillarSummaryComponent, PillarSummary } from './pillar-summary.component';
import { AssessmentOverviewComponent } from './assessment-overview.component';

@Component({
  selector: 'app-assessment',
  templateUrl: './assessment.component.html',
  styleUrls: ['./assessment.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, OverallProgressSummaryComponent, PillarSummaryComponent, AssessmentOverviewComponent],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-10px)', opacity: 0 }),
        animate('300ms', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms', style({ transform: 'translateY(-10px)', opacity: 0 }))
      ])
    ]),
    trigger('listAnimation', [
      transition(':enter', [
        query('@*', stagger(100, query(':enter', [style({ opacity: 0 }), animate('300ms', style({ opacity: 1 }))])), { optional: true })
      ]),
      transition(':leave', [
        query('@*', stagger(100, query(':leave', [animate('300ms', style({ opacity: 0 }))])), { optional: true })
      ])
    ])
  ]
})
export class AssessmentComponent implements OnInit, OnDestroy {
  pillars: Pillar[] = [];
  functionCapabilities: FunctionCapability[] = [];
  maturityStages: MaturityStage[] = [];
  technologiesProcesses: TechnologyProcess[] = [];
  assessmentResponses: AssessmentResponse[] = [];
  pillarSummary: PillarSummary[] = [];
  overallPillarProgress: OverallPillarProgress[] = [];

  selectedPillarId: number | null = null;
  selectedFunctionCapabilityId: number | null = null;
  showOverallSummary = true; // Controls visibility of overall summary

  assessmentStatuses: (AssessmentStatus | null)[] = [];
  assessmentNotes: string[] = [];
  statusOptions: AssessmentStatus[] = ['Not Implemented', 'Partially Implemented', 'Fully Implemented', 'Superseded'];
  showSuccess = false;

  // Pagination properties - now stage-based
  currentPage = 1; // 1=Traditional, 2=Initial, 3=Advanced, 4=Optimal
  itemsPerPage = 5; // Not used in stage-based pagination
  totalPages = 0; // Will be set to number of available stages
  paginatedTechnologiesProcesses: TechnologyProcess[] = [];

  // Maturity stage pagination properties
  technologiesProcessesByStage: Record<string, TechnologyProcess[]> = {};
  stageOrder: string[] = ['Traditional', 'Initial', 'Advanced', 'Optimal'];
  availableStages: string[] = [];
  currentStageName = '';

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
      this.overallPillarProgress = [];
      this.selectedPillarId = null;
      this.selectedFunctionCapabilityId = null;
      this.showOverallSummary = true;
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

    // Build overall progress summary after loading all data
    if (this.pillars.length > 0 && this.functionCapabilities.length > 0) {
      await this.buildOverallPillarProgress();
    }
  }

  async onPillarChange() {
    if (this.selectedPillarId) {
      // Hide overall summary when a pillar is selected
      this.showOverallSummary = false;
      // Build summary for this pillar
      await this.buildPillarSummary();
    } else {
      // Show overall summary when no pillar is selected
      this.showOverallSummary = true;
      this.pillarSummary = [];
    }
    // Reset function capability selection and clear technologies/processes
    this.selectedFunctionCapabilityId = null;
    this.technologiesProcesses = [];
    this.assessmentStatuses = [];
    this.assessmentNotes = [];
  }

  // Method to go back to overall summary
  goBackToOverallSummary(): void {
    this.selectedPillarId = null;
    this.selectedFunctionCapabilityId = null;
    this.showOverallSummary = true;
    this.pillarSummary = [];
    this.technologiesProcesses = [];
    this.assessmentStatuses = [];
    this.assessmentNotes = [];
  }

  // Build overall progress summary for all pillars
  async buildOverallPillarProgress(): Promise<void> {
    this.overallPillarProgress = [];

    try {
      for (const pillar of this.pillars) {
        const pillarFunctions = this.functionCapabilities.filter(fc => fc.pillar_id === pillar.id);
        let totalItems = 0;
        let completedItems = 0;

        for (const func of pillarFunctions) {
          try {
            const techProcesses = await this.data.getTechnologiesProcessesByFunction(func.id);
            totalItems += techProcesses.length;

            // Count completed assessments for this function
            const functionCompletedCount = techProcesses.filter(tp =>
              this.assessmentResponses.some(ar => ar.tech_process_id === tp.id)
            ).length;

            completedItems += functionCompletedCount;
          } catch (error) {
            console.error('Error loading tech processes for function', func.id, ':', error);
          }
        }

        const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

        this.overallPillarProgress.push({
          pillar,
          totalItems,
          completedItems,
          progressPercentage,
          functionCount: pillarFunctions.length
        });
      }
    } catch (error) {
      console.error('Error building overall pillar progress:', error);
    }
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

      // Group technologies/processes by maturity stage
      this.groupTechnologiesProcessesByStage();

      // Reset pagination to first page and update pagination
      this.currentPage = 1;
      this.updatePagination();
    } else {
      this.technologiesProcesses = [];
      this.assessmentStatuses = [];
      this.assessmentNotes = [];
      this.paginatedTechnologiesProcesses = [];
      this.technologiesProcessesByStage = {};
      this.availableStages = [];
      this.totalPages = 0;
      this.currentPage = 1;
    }
  }

  getMaturityStageName(id: number) {
    return this.maturityStages.find(ms => ms.id === id)?.name || 'Unknown';
  }

  groupTechnologiesProcessesByStage() {
    this.technologiesProcessesByStage = {};
    this.availableStages = [];

    // Group technologies/processes by maturity stage
    for (const tp of this.technologiesProcesses) {
      const stageName = this.getMaturityStageName(tp.maturity_stage_id);
      if (!this.technologiesProcessesByStage[stageName]) {
        this.technologiesProcessesByStage[stageName] = [];
      }
      this.technologiesProcessesByStage[stageName].push(tp);
    }

    // Get available stages in the correct order
    this.availableStages = this.stageOrder.filter(stage =>
      this.technologiesProcessesByStage[stage] && this.technologiesProcessesByStage[stage].length > 0
    );

    // Set total pages to number of available stages (each stage is one page)
    this.totalPages = this.availableStages.length;

    // Set current stage name based on current page
    this.updateCurrentStage();
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

  // Pagination methods - now stage-based
  updatePagination() {
    // Set current stage based on current page
    this.updateCurrentStage();

    // Set paginated items to all items from current stage
    if (this.currentStageName && this.technologiesProcessesByStage[this.currentStageName]) {
      this.paginatedTechnologiesProcesses = [...this.technologiesProcessesByStage[this.currentStageName]];
    } else {
      this.paginatedTechnologiesProcesses = [];
    }
  }

  updateCurrentStage() {
    // Map page number to stage (1-based)
    if (this.currentPage >= 1 && this.currentPage <= this.availableStages.length) {
      this.currentStageName = this.availableStages[this.currentPage - 1];
    } else {
      this.currentStageName = this.availableStages[0] || '';
    }
  }

  getCurrentStageName(): string {
    return this.currentStageName;
  }

  getCurrentStageItemCount(): number {
    return this.currentStageName ? (this.technologiesProcessesByStage[this.currentStageName]?.length || 0) : 0;
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

  // Event handlers for child components
  onPillarSelected(pillarId: number): void {
    this.selectedPillarId = pillarId;
    this.onPillarChange();
  }

  onFunctionCapabilitySelected(functionCapabilityId: number): void {
    this.selectedFunctionCapabilityId = functionCapabilityId;
    this.onFunctionCapabilityChange();
  }

  onAssessmentChangeFromChild(event: {index: number, field: 'status' | 'notes', value: AssessmentStatus | null | string}): void {
    this.onAssessmentChange(event.index, event.field, event.value);
  }

  // Helper methods for overall statistics
  getTotalFunctions(): number {
    return this.overallPillarProgress.reduce((total, progress) => total + progress.functionCount, 0);
  }

  getTotalCompletedItems(): number {
    return this.overallPillarProgress.reduce((total, progress) => total + progress.completedItems, 0);
  }

  getTotalItems(): number {
    return this.overallPillarProgress.reduce((total, progress) => total + progress.totalItems, 0);
  }

  getOverallProgress(): number {
    const total = this.getTotalItems();
    const completed = this.getTotalCompletedItems();
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }
}
