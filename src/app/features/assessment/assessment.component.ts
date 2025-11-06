import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { trigger, style, transition, animate, query, stagger } from '@angular/animations';
import { IndexedDBService } from '../../services/indexeddb.service';
import { LoggingService } from '../../services/logging.service';
import { ProcessService } from '../../services/process.service';
import { TechnologyService } from '../../services/technology.service';
import { Pillar, FunctionCapability, MaturityStage, TechnologyProcess, AssessmentResponse, ProcessTechnologyGroup, MaturityStageImplementation, Assessment, StageImplementationDetail, StageImplementationStatus } from '../../models/ztmm.models';
import { AssessmentStatus } from '../../models/ztmm.models';
import { OverallProgressSummaryComponent, OverallPillarProgress } from './overall-progress-summary.component';
import { PillarSummaryComponent, PillarSummary } from './pillar-summary.component';
import { AssessmentOverviewComponent } from './assessment-overview.component';
import { AssessmentUpdate } from './assessment-item.component';

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
export class AssessmentComponent implements OnInit {
  pillars: Pillar[] = [];
  functionCapabilities: FunctionCapability[] = [];
  maturityStages: MaturityStage[] = [];
  technologiesProcesses: TechnologyProcess[] = []; // Legacy - kept for shared components
  assessmentResponses: AssessmentResponse[] = [];
  pillarSummary: PillarSummary[] = [];
  overallPillarProgress: OverallPillarProgress[] = [];

  // Model properties (current implementation)
  allProcessTechnologyGroups: ProcessTechnologyGroup[] = []; // Store all groups
  processTechnologyGroups: ProcessTechnologyGroup[] = []; // Filtered groups for current function
  stageImplementations: MaturityStageImplementation[] = [];
  assessments: Assessment[] = [];
  stageImplementationDetails: StageImplementationDetail[] = []; // Individual stage selections
  overallProgress: OverallPillarProgress[] = [];

  selectedPillarId: number | null = null;
  selectedFunctionCapabilityId: number | null = null;
  showOverallSummary = true; // Controls visibility of overall summary

  assessmentStatuses: (AssessmentStatus | null)[] = [];
  assessmentNotes: string[] = [];
  statusOptions: AssessmentStatus[] = ['Not Implemented', 'Partially Implemented', 'Fully Implemented', 'Superseded'];
  showSuccess = false;

  // Pagination properties - legacy, kept for potential shared components
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 0;
  paginatedTechnologiesProcesses: TechnologyProcess[] = [];

  // Maturity stage pagination properties
  technologiesProcessesByStage: Record<string, TechnologyProcess[]> = {};
  stageOrder: string[] = ['Traditional', 'Initial', 'Advanced', 'Optimal'];
  availableStages: string[] = [];
  currentStageName = '';

  // Auto-save indicator
  isAutoSaving = false;

  // Display options
  showTechnologyDescriptions = true;

  // Make Math available to template
  Math = Math;

  private readonly LOG_CONTEXT = 'AssessmentComponent';

  constructor(
    private data: IndexedDBService,
    private logger: LoggingService,
    private processService: ProcessService,
    private technologyService: TechnologyService
  ) {
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
      this.overallProgress = [];
      this.processTechnologyGroups = [];
      this.stageImplementations = [];
      this.assessments = [];
      this.selectedPillarId = null;
      this.selectedFunctionCapabilityId = null;
      this.showOverallSummary = true;
    }

    // Load each data source independently with error handling
    try {
      this.pillars = await this.data.getPillars();
    } catch (error) {
      this.logger.error('Error loading pillars', error as Error, this.LOG_CONTEXT);
      this.pillars = [];
    }

    try {
      this.functionCapabilities = await this.data.getFunctionCapabilities();
    } catch (error) {
      this.logger.error('Error loading function capabilities', error as Error, this.LOG_CONTEXT);
      this.functionCapabilities = [];
    }

    try {
      this.maturityStages = await this.data.getMaturityStages();
    } catch (error) {
      this.logger.error('Error loading maturity stages', error as Error, this.LOG_CONTEXT);
      this.maturityStages = [];
    }

    // Load data structures
    try {
      this.allProcessTechnologyGroups = await this.data.getProcessTechnologyGroups();
      this.processTechnologyGroups = [...this.allProcessTechnologyGroups]; // Copy for filtering
    } catch (error) {
      this.logger.error('Error loading process/technology groups', error as Error, this.LOG_CONTEXT);
      this.allProcessTechnologyGroups = [];
      this.processTechnologyGroups = [];
    }

    try {
      this.stageImplementations = await this.data.getMaturityStageImplementations();
    } catch (error) {
      this.logger.error('Error loading stage implementations', error as Error, this.LOG_CONTEXT);
      this.stageImplementations = [];
    }

    try {
      this.assessments = await this.data.getAssessmentsV2();
    } catch (error) {
      this.logger.error('Error loading assessments', error as Error, this.LOG_CONTEXT);
      this.assessments = [];
    }

    try {
      this.stageImplementationDetails = await this.data.getStageImplementationDetails();
    } catch (error) {
      this.logger.error('Error loading stage implementation details', error as Error, this.LOG_CONTEXT);
      this.stageImplementationDetails = [];
    }

    try {
      this.assessmentResponses = await this.data.getAssessmentResponses();
    } catch (error) {
      this.logger.error('Error loading assessment responses', error as Error, this.LOG_CONTEXT);
      this.assessmentResponses = [];
    }

    // Build overall progress summary after loading all data
    if (this.pillars.length > 0 && this.functionCapabilities.length > 0) {
      await this.buildOverallProgress();
    }
  }

  // Model: Load data structures
  async loadData(resetUIState = true): Promise<void> {
    if (resetUIState) {
      this.processTechnologyGroups = [];
      this.stageImplementations = [];
      this.assessments = [];
      this.overallProgress = [];
      this.selectedPillarId = null;
      this.selectedFunctionCapabilityId = null;
      this.showOverallSummary = true;
    }

    // Load pillars, function capabilities (shared with V1)
    try {
      this.pillars = await this.data.getPillars();
    } catch (error) {
      this.logger.error('Error loading pillars', error as Error, this.LOG_CONTEXT);
      this.pillars = [];
    }

    try {
      this.functionCapabilities = await this.data.getFunctionCapabilities();
    } catch (error) {
      this.logger.error('Error loading function capabilities', error as Error, this.LOG_CONTEXT);
      this.functionCapabilities = [];
    }

    // Load specific data
    try {
      this.allProcessTechnologyGroups = await this.data.getProcessTechnologyGroups();
      this.processTechnologyGroups = [...this.allProcessTechnologyGroups]; // Copy for initial display
    } catch (error) {
      this.logger.error('Error loading process/technology groups', error as Error, this.LOG_CONTEXT);
      this.allProcessTechnologyGroups = [];
      this.processTechnologyGroups = [];
    }

    try {
      this.stageImplementations = await this.data.getMaturityStageImplementations();
    } catch (error) {
      this.logger.error('Error loading stage implementations', error as Error, this.LOG_CONTEXT);
      this.stageImplementations = [];
    }

    try {
      this.assessments = await this.data.getAssessmentsV2();
    } catch (error) {
      this.logger.error('Error loading assessments', error as Error, this.LOG_CONTEXT);
      this.assessments = [];
    }

    try {
      this.stageImplementationDetails = await this.data.getStageImplementationDetails();
    } catch (error) {
      this.logger.error('Error loading stage implementation details', error as Error, this.LOG_CONTEXT);
      this.stageImplementationDetails = [];
    }

    // Build overall progress
    if (this.pillars.length > 0 && this.functionCapabilities.length > 0) {
      await this.buildOverallProgress();
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

  // Method to go back to pillar summary (from assessment overview)
  goBackToPillarSummary(): void {
    this.selectedFunctionCapabilityId = null;
    this.processTechnologyGroups = [];
    this.stageImplementations = [];
    this.assessments = [];
  }

  // Build overall progress summary for all pillars (V2)
  async buildOverallPillarProgress(): Promise<void> {
    this.overallProgress = [];

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
            this.logger.error('Error loading tech processes for function', error as Error, this.LOG_CONTEXT, { functionId: func.id });
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
      this.logger.error('Error building overall pillar progress', error as Error, this.LOG_CONTEXT);
    }
  }

  // Model: Build overall progress summary using data structures
  async buildOverallProgress(): Promise<void> {
    this.overallProgress = [];

    try {
      for (const pillar of this.pillars) {
        const pillarFunctions = this.functionCapabilities.filter(fc => fc.pillar_id === pillar.id);
        let totalItems = 0;
        let completedItems = 0; // Items with achieved stage > 0

        for (const func of pillarFunctions) {
          try {
            // Get all groups for this function
            const groupsInFunction = this.allProcessTechnologyGroups.filter(
              ptg => ptg.function_capability_id === func.id
            );
            totalItems += groupsInFunction.length;

            // Count progress based on assessments
            for (const group of groupsInFunction) {
              const assessment = this.assessments.find(a => a.process_technology_group_id === group.id);
              if (assessment) {
                // Count as "completed" if any achieved stage
                if (assessment.achieved_maturity_stage_id && assessment.achieved_maturity_stage_id > 0) {
                  completedItems++;
                }
              }
            }
          } catch (error) {
            this.logger.error('Error loading groups for function', error as Error, this.LOG_CONTEXT, { functionId: func.id });
          }
        }

        // Calculate progress based on achieved stages (not just fully implemented)
        const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

        this.overallProgress.push({
          pillar,
          totalItems,
          completedItems,
          progressPercentage,
          functionCount: pillarFunctions.length
        });
      }
    } catch (error) {
      this.logger.error('Error building overall progress', error as Error, this.LOG_CONTEXT);
    }
  }

  // Load data for selected function capability
  async onFunctionCapabilityChange() {
    if (this.selectedFunctionCapabilityId) {
      // Load process/technology groups for this function
      const groupsForFunction = this.allProcessTechnologyGroups.filter(
        ptg => ptg.function_capability_id === this.selectedFunctionCapabilityId
      );

      // Store filtered groups
      this.processTechnologyGroups = groupsForFunction;

      // Load stage implementations for these groups
      const groupIds = groupsForFunction.map(g => g.id);
      this.stageImplementations = (await this.data.getMaturityStageImplementations())
        .filter(si => groupIds.includes(si.process_technology_group_id));

      // Load assessments for these groups
      this.assessments = (await this.data.getAssessmentsV2())
        .filter(a => groupIds.includes(a.process_technology_group_id));

      // Load stage implementation details for these assessments
      const assessmentIds = this.assessments.map(a => a.id);
      this.stageImplementationDetails = (await this.data.getStageImplementationDetails())
        .filter(d => assessmentIds.includes(d.assessment_id));
    } else {
      // Reset
      this.processTechnologyGroups = [];
      this.stageImplementations = [];
      this.assessments = [];
      this.stageImplementationDetails = [];
    }
  }

  // Model: Handle assessment update from child component
  async onAssessmentUpdate(event: {groupId: number, update: AssessmentUpdate}) {

    // Show saving indicator
    this.isAutoSaving = true;

    // Find or create assessment
    let assessment = this.assessments.find(a => a.process_technology_group_id === event.groupId);

    if (assessment) {
      // Update existing
      assessment.achieved_maturity_stage_id = event.update.achieved_maturity_stage_id;
      assessment.target_maturity_stage_id = event.update.target_maturity_stage_id;
      assessment.implementation_status = event.update.implementation_status;
      assessment.notes = event.update.notes;
      assessment.last_updated = new Date().toISOString();
    } else {
      // Create new
      assessment = {
        id: Date.now(), // Temporary ID
        process_technology_group_id: event.groupId,
        achieved_maturity_stage_id: event.update.achieved_maturity_stage_id,
        target_maturity_stage_id: event.update.target_maturity_stage_id,
        implementation_status: event.update.implementation_status,
        notes: event.update.notes,
        last_updated: new Date().toISOString()
      };
      this.assessments.push(assessment);
    }

    // Save to database immediately
    try {
      if (assessment.id && assessment.id > 1000000000000) {
        // Has a real ID (not temporary), update
        await this.data.updateAssessment(assessment);
      } else {
        // New assessment, add it
        const newId = await this.data.addAssessment(assessment);
        assessment.id = newId;
        // Update in array
        const index = this.assessments.findIndex(a => a.process_technology_group_id === event.groupId);
        if (index >= 0) {
          this.assessments[index] = assessment;
        }
      }

      // Save individual stage implementation details
      await this.saveStageDetails(assessment.id, event.update.stageDetails);

      // Hide saving indicator and show success
      this.isAutoSaving = false;
      this.showSuccess = true;
      setTimeout(() => {
        this.showSuccess = false;
      }, 1500);

      // Rebuild progress in background
      await this.buildOverallProgress();
    } catch (error) {
      this.logger.error('Error saving assessment', error as Error, this.LOG_CONTEXT);
      this.isAutoSaving = false;
      // Could show error indicator here
    }
  }

  // Save individual stage implementation details
  private async saveStageDetails(assessmentId: number, stageDetails: Map<number, AssessmentStatus | null>): Promise<void> {
    try {
      // Get existing stage details for this assessment
      const existingDetails = this.stageImplementationDetails.filter(d => d.assessment_id === assessmentId);

      // Process each stage selection
      for (const [stageId, status] of stageDetails.entries()) {
        if (status === null) {
          // User hasn't selected this stage - remove any existing detail
          const existingDetail = existingDetails.find(d => d.maturity_stage_id === stageId);
          if (existingDetail && existingDetail.id) {
            await this.data.deleteStageImplementationDetail(existingDetail.id);
            // Remove from local array
            const index = this.stageImplementationDetails.findIndex(d => d.id === existingDetail.id);
            if (index >= 0) {
              this.stageImplementationDetails.splice(index, 1);
            }
          }
        } else {
          // User has selected a status for this stage
          const detailStatus = this.mapAssessmentStatusToDetailStatus(status);
          const completionPercentage = this.getCompletionPercentage(status);

          const existingDetail = existingDetails.find(d => d.maturity_stage_id === stageId);

          if (existingDetail) {
            // Update existing detail
            existingDetail.status = detailStatus;
            existingDetail.completion_percentage = completionPercentage;
            await this.data.updateStageImplementationDetail(existingDetail);
          } else {
            // Create new detail
            const newDetail: Omit<StageImplementationDetail, 'id'> = {
              assessment_id: assessmentId,
              maturity_stage_id: stageId,
              status: detailStatus,
              completion_percentage: completionPercentage,
              notes: undefined
            };
            const newId = await this.data.addStageImplementationDetail(newDetail);
            // Add to local array
            this.stageImplementationDetails.push({
              ...newDetail,
              id: newId
            });
          }
        }
      }
    } catch (error) {
      this.logger.error('Error saving stage details', error as Error, this.LOG_CONTEXT, { assessmentId });
      throw error;
    }
  }

  // Map AssessmentStatus to StageImplementationStatus
  private mapAssessmentStatusToDetailStatus(status: AssessmentStatus): StageImplementationStatus {
    switch (status) {
      case 'Not Implemented':
        return 'Not Started';
      case 'Partially Implemented':
        return 'In Progress';
      case 'Fully Implemented':
      case 'Superseded':
        return 'Completed';
      default:
        return 'Not Started';
    }
  }

  // Get completion percentage based on status
  private getCompletionPercentage(status: AssessmentStatus): number {
    switch (status) {
      case 'Not Implemented':
        return 0;
      case 'Partially Implemented':
        return 50;
      case 'Fully Implemented':
      case 'Superseded':
        return 100;
      default:
        return 0;
    }
  }

  // Note: saveAllV2Assessments() method removed - assessments now auto-save on change in onAssessmentUpdate()

  getMaturityStageName(id: number) {
    return this.maturityStages.find(ms => ms.id === id)?.name || 'Unknown';
  }

  groupTechnologiesProcessesByStage() {
    this.technologiesProcessesByStage = {};
    this.availableStages = [];

    // Group technologies/processes by maturity stage
    for (const tp of this.technologiesProcesses) {
      const stageName = this.getMaturityStageName(tp.maturity_stage_id);
      if (!Object.prototype.hasOwnProperty.call(this.technologiesProcessesByStage, stageName)) {
        this.technologiesProcessesByStage[stageName] = [];
      }
      const stageGroup = this.technologiesProcessesByStage[stageName];
      if (stageGroup) {
        stageGroup.push(tp);
      }
    }

    // Get available stages in the correct order
    this.availableStages = this.stageOrder.filter(stage => {
      const stageGroup = this.technologiesProcessesByStage[stage];
      return Object.prototype.hasOwnProperty.call(this.technologiesProcessesByStage, stage) &&
             stageGroup &&
             stageGroup.length > 0;
    });

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

  // Model: Build pillar summary using data
  async buildPillarSummary() {
    this.pillarSummary = [];

    try {
      // Get all function capabilities for this pillar
      const filteredFunctionCapabilities = this.functionCapabilities.filter(fc => fc.pillar_id === this.selectedPillarId);

      if (filteredFunctionCapabilities.length === 0) {
        return;
      }

      // Load all data if not already loaded
      if (this.allProcessTechnologyGroups.length === 0) {
        this.allProcessTechnologyGroups = await this.data.getProcessTechnologyGroups();
        this.assessments = await this.data.getAssessmentsV2();
      }

      for (const fc of filteredFunctionCapabilities) {
        try {
          // Get groups for this function capability
          const groups = this.allProcessTechnologyGroups.filter(ptg => ptg.function_capability_id === fc.id);

          // Count completed assessments (achieved stage > 0)
          const completedCount = groups.filter(group => {
            const assessment = this.assessments.find(a => a.process_technology_group_id === group.id);
            return assessment && assessment.achieved_maturity_stage_id > 0;
          }).length;

          const summary = {
            functionCapability: fc,
            totalCount: groups.length,
            completedCount: completedCount,
            completionPercentage: groups.length > 0 ? Math.round((completedCount / groups.length) * 100) : 0
          };

          this.pillarSummary.push(summary);
        } catch (fcError) {
          this.logger.error('Error processing function capability', fcError as Error, this.LOG_CONTEXT, { functionCapabilityId: fc.id });
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
      this.logger.error('Error building pillar summary', error as Error, this.LOG_CONTEXT);
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
      this.logger.error('Error saving assessment', error as Error, this.LOG_CONTEXT);
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

  // Note: Legacy V1 saveAllPendingChanges method removed - uses immediate auto-save in onAssessmentUpdate

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

  // Note: Legacy V1 timer-based auto-save methods removed (onAssessmentChange, saveAssessmentItem, ngOnDestroy)
  // uses immediate auto-save in onAssessmentUpdate

  // Note: Legacy V1 event handlers removed (onStatusChange, onNotesChange, onAssessmentChangeFromChild)
  // uses direct event binding from child components

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

  // Helper methods for overall statistics (V2)
  getTotalFunctions(): number {
    return this.overallProgress.reduce((total, progress) => total + progress.functionCount, 0);
  }

  getTotalCompletedItems(): number {
    return this.overallProgress.reduce((total, progress) => total + progress.completedItems, 0);
  }

  getTotalItems(): number {
    return this.overallProgress.reduce((total, progress) => total + progress.totalItems, 0);
  }

  getOverallProgress(): number {
    const total = this.getTotalItems();
    const completed = this.getTotalCompletedItems();
    return total > 0 ? Math.round((completed / total) * 100) : 0;
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

  toggleTechnologyDescriptions(): void {
    this.showTechnologyDescriptions = !this.showTechnologyDescriptions;
  }
}
