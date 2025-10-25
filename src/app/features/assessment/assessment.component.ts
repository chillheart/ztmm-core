import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { trigger, style, transition, animate, query, stagger } from '@angular/animations';
import { IndexedDBService } from '../../services/indexeddb.service';
import { ProcessService } from '../../services/process.service';
import { TechnologyService } from '../../services/technology.service';
import { Pillar, FunctionCapability, MaturityStage, TechnologyProcess, AssessmentResponse, ProcessTechnologyGroup, MaturityStageImplementation, Assessment } from '../../models/ztmm.models';
import { AssessmentStatus } from '../../models/ztmm.models';
import { OverallProgressSummaryComponent, OverallPillarProgress } from './overall-progress-summary.component';
import { PillarSummaryComponent, PillarSummary } from './pillar-summary.component';
import { AssessmentOverviewComponent } from './assessment-overview.component';
import { V2AssessmentOverviewComponent } from './v2-assessment-overview.component';
import { AssessmentUpdate } from './v2-assessment-item.component';

@Component({
  selector: 'app-assessment',
  templateUrl: './assessment.component.html',
  styleUrls: ['./assessment.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, OverallProgressSummaryComponent, PillarSummaryComponent, AssessmentOverviewComponent, V2AssessmentOverviewComponent],
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

  // V2 Model properties
  useV2Model = false; // Toggle between V1 and V2 UI
  processTechnologyGroups: ProcessTechnologyGroup[] = []; // V2: Combined process+technology groups
  stageImplementations: MaturityStageImplementation[] = []; // V2: Multi-stage implementations
  v2Assessments: Assessment[] = []; // V2: Assessment data
  v2OverallProgress: OverallPillarProgress[] = []; // V2: Progress data

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
  private readonly autoSaveDelay = 300; // 300ms debounce delay
  private activeSaves = new Set<number>(); // Track active saves by index
  isAutoSaving = false;

  // Display options
  showTechnologyDescriptions = true;

  // Make Math available to template
  Math = Math;

  constructor(
    private data: IndexedDBService,
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
      console.log(`Loaded ${this.assessmentResponses.length} assessment responses during initialization`);
    } catch (error) {
      console.error('❌ Error loading assessment responses:', error);
      this.assessmentResponses = [];
    }

    // Build overall progress summary after loading all data
    if (this.pillars.length > 0 && this.functionCapabilities.length > 0) {
      await this.buildOverallPillarProgress();
    }
  }

  // V2 Model: Load V2 data structures
  async loadV2Data(resetUIState = true): Promise<void> {
    if (resetUIState) {
      this.processTechnologyGroups = [];
      this.stageImplementations = [];
      this.v2Assessments = [];
      this.v2OverallProgress = [];
      this.selectedPillarId = null;
      this.selectedFunctionCapabilityId = null;
      this.showOverallSummary = true;
    }

    // Load pillars, function capabilities (shared with V1)
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

    // Load V2-specific data
    try {
      this.processTechnologyGroups = await this.data.getProcessTechnologyGroups();
      console.log(`Loaded ${this.processTechnologyGroups.length} V2 process/technology groups`);
    } catch (error) {
      console.error('❌ Error loading V2 process/technology groups:', error);
      this.processTechnologyGroups = [];
    }

    try {
      this.stageImplementations = await this.data.getMaturityStageImplementations();
      console.log(`Loaded ${this.stageImplementations.length} V2 maturity stage implementations`);
    } catch (error) {
      console.error('❌ Error loading V2 stage implementations:', error);
      this.stageImplementations = [];
    }

    try {
      this.v2Assessments = await this.data.getAssessmentsV2();
      console.log(`Loaded ${this.v2Assessments.length} V2 assessments`);
    } catch (error) {
      console.error('❌ Error loading V2 assessments:', error);
      this.v2Assessments = [];
    }

    // Build V2 overall progress
    if (this.pillars.length > 0 && this.functionCapabilities.length > 0) {
      await this.buildV2OverallProgress();
    }
  }

  // Toggle between V1 and V2 data models
  toggleDataModel(): void {
    this.useV2Model = !this.useV2Model;
    console.log('Data model toggled to:', this.useV2Model ? 'V2' : 'V1');

    // Reload data based on model
    if (this.useV2Model) {
      this.loadV2Data();
    } else {
      this.loadAll();
    }
  }

  async onPillarChange() {
    if (this.selectedPillarId) {
      // Hide overall summary when a pillar is selected
      this.showOverallSummary = false;
      // Build summary for this pillar
      if (this.useV2Model) {
        await this.buildV2PillarSummary();
      } else {
        await this.buildPillarSummary();
      }
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

  // V2 Model: Build overall progress summary using V2 data structures
  async buildV2OverallProgress(): Promise<void> {
    this.v2OverallProgress = [];

    try {
      for (const pillar of this.pillars) {
        const pillarFunctions = this.functionCapabilities.filter(fc => fc.pillar_id === pillar.id);
        let totalItems = 0;
        let completedItems = 0; // Items with achieved stage > 0
        let fullyImplementedItems = 0; // Items with target stage achieved

        for (const func of pillarFunctions) {
          try {
            // Get all V2 groups for this function
            const groupsInFunction = this.processTechnologyGroups.filter(
              ptg => ptg.function_capability_id === func.id
            );
            totalItems += groupsInFunction.length;

            // Count progress based on V2 assessments
            for (const group of groupsInFunction) {
              const assessment = this.v2Assessments.find(a => a.process_technology_group_id === group.id);
              if (assessment) {
                // Count as "completed" if any achieved stage
                if (assessment.achieved_maturity_stage_id && assessment.achieved_maturity_stage_id > 0) {
                  completedItems++;
                }
                // Count as "fully implemented" if target stage is achieved
                if (assessment.target_maturity_stage_id &&
                    assessment.achieved_maturity_stage_id >= assessment.target_maturity_stage_id) {
                  fullyImplementedItems++;
                }
              }
            }
          } catch (error) {
            console.error('Error loading V2 groups for function', func.id, ':', error);
          }
        }

        // Calculate progress based on achieved stages (not just fully implemented)
        const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

        this.v2OverallProgress.push({
          pillar,
          totalItems,
          completedItems,
          progressPercentage,
          functionCount: pillarFunctions.length
        });
      }
    } catch (error) {
      console.error('Error building V2 overall progress:', error);
    }
  }

  async onFunctionCapabilityChange() {
    if (this.selectedFunctionCapabilityId) {
      // Use specialized method for loading technologies/processes by function capability
      this.technologiesProcesses = await this.data.getTechnologiesProcessesByFunction(this.selectedFunctionCapabilityId);

      // Ensure we have the latest assessment responses before populating the arrays
      this.assessmentResponses = await this.data.getAssessmentResponses();

      this.assessmentStatuses = Array(this.technologiesProcesses.length).fill(null);
      this.assessmentNotes = Array(this.technologiesProcesses.length).fill('');

      // Load existing assessment data if available
      console.log(`Loading existing responses for ${this.technologiesProcesses.length} technologies/processes`);
      let loadedResponsesCount = 0;

      for (let i = 0; i < this.technologiesProcesses.length; i++) {
        const tp = this.technologiesProcesses[i];
        const existingAssessment = this.assessmentResponses.find(ar => ar.tech_process_id === tp.id);
        if (existingAssessment) {
          this.assessmentStatuses[i] = existingAssessment.status;
          this.assessmentNotes[i] = existingAssessment.notes || '';
          loadedResponsesCount++;
          console.log(`Loaded existing response for ${tp.name}: status="${existingAssessment.status}" (type: ${typeof existingAssessment.status}), notes="${existingAssessment.notes}"`);
        }
      }

      console.log(`Loaded ${loadedResponsesCount} existing assessment responses out of ${this.technologiesProcesses.length} items`);

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

  // V2 Model: Load V2 data for selected function capability
  async onV2FunctionCapabilityChange() {
    if (this.selectedFunctionCapabilityId && this.useV2Model) {
      // Load V2 process/technology groups for this function
      const allGroups = this.processTechnologyGroups;
      const groupsForFunction = allGroups.filter(
        ptg => ptg.function_capability_id === this.selectedFunctionCapabilityId
      );

      // Store filtered groups (reusing processTechnologyGroups array)
      this.processTechnologyGroups = groupsForFunction;

      // Load stage implementations for these groups
      const groupIds = groupsForFunction.map(g => g.id);
      this.stageImplementations = (await this.data.getMaturityStageImplementations())
        .filter(si => groupIds.includes(si.process_technology_group_id));

      // Load assessments for these groups
      this.v2Assessments = (await this.data.getAssessmentsV2())
        .filter(a => groupIds.includes(a.process_technology_group_id));

      console.log(`Loaded ${groupsForFunction.length} V2 groups, ${this.stageImplementations.length} stage implementations, ${this.v2Assessments.length} assessments`);
    } else {
      // Reset
      this.processTechnologyGroups = [];
      this.stageImplementations = [];
      this.v2Assessments = [];
    }
  }

  // V2 Model: Handle assessment update from V2 child component
  async onV2AssessmentUpdate(event: {groupId: number, update: AssessmentUpdate}) {
    console.log('V2 Assessment update:', event);

    // Find or create assessment
    let assessment = this.v2Assessments.find(a => a.process_technology_group_id === event.groupId);

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
      this.v2Assessments.push(assessment);
    }

    // Save to database
    try {
      if (assessment.id && assessment.id > 1000000000000) {
        // Has a real ID (not temporary), update
        await this.data.updateAssessment(assessment);
      } else {
        // New assessment, add it
        const newId = await this.data.addAssessment(assessment);
        assessment.id = newId;
        // Update in array
        const index = this.v2Assessments.findIndex(a => a.process_technology_group_id === event.groupId);
        if (index >= 0) {
          this.v2Assessments[index] = assessment;
        }
      }
      console.log('V2 assessment saved successfully');

      // Show success indicator
      this.showSuccess = true;
      setTimeout(() => {
        this.showSuccess = false;
      }, 2000);

      // Rebuild progress
      await this.buildV2OverallProgress();
    } catch (error) {
      console.error('Error saving V2 assessment:', error);
    }
  }

  // V2 Model: Save all V2 assessments
  async saveAllV2Assessments() {
    console.log('Saving all V2 assessments...');
    this.isAutoSaving = true;

    try {
      for (const assessment of this.v2Assessments) {
        if (assessment.id && assessment.id > 1000000000000) {
          await this.data.updateAssessment(assessment);
        } else {
          const newId = await this.data.addAssessment(assessment);
          assessment.id = newId;
        }
      }

      this.showSuccess = true;
      setTimeout(() => {
        this.showSuccess = false;
      }, 2000);

      console.log('All V2 assessments saved successfully');
    } catch (error) {
      console.error('Error saving V2 assessments:', error);
    } finally {
      this.isAutoSaving = false;
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

  // V2 Model: Build pillar summary using V2 data
  async buildV2PillarSummary() {
    this.pillarSummary = [];

    try {
      // Get all function capabilities for this pillar
      const filteredFunctionCapabilities = this.functionCapabilities.filter(fc => fc.pillar_id === this.selectedPillarId);

      if (filteredFunctionCapabilities.length === 0) {
        return;
      }

      // Load all V2 data if not already loaded
      if (this.processTechnologyGroups.length === 0) {
        this.processTechnologyGroups = await this.data.getProcessTechnologyGroups();
        this.v2Assessments = await this.data.getAssessmentsV2();
      }

      for (const fc of filteredFunctionCapabilities) {
        try {
          // Get V2 groups for this function capability
          const groups = this.processTechnologyGroups.filter(ptg => ptg.function_capability_id === fc.id);

          // Count completed assessments (achieved stage > 0)
          const completedCount = groups.filter(group => {
            const assessment = this.v2Assessments.find(a => a.process_technology_group_id === group.id);
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
      console.error('Error building V2 pillar summary:', error);
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

  // Force save all pending changes immediately (useful before navigation)
  async saveAllPendingChanges(): Promise<void> {
    // Clear any pending timeout
    if (this.autoSaveTimeout) {
      window.clearTimeout(this.autoSaveTimeout);
      this.autoSaveTimeout = null;
    }

    // Save all items that have data but aren't currently being saved
    const savePromises: Promise<void>[] = [];

    for (let i = 0; i < this.technologiesProcesses.length; i++) {
      const status = this.assessmentStatuses[i];
      const notes = this.assessmentNotes[i];

      // Only save if there's meaningful data and it's not already being saved
      if ((status || (notes && notes.trim())) && !this.activeSaves.has(i)) {
        savePromises.push(this.saveAssessmentItem(i));
      }
    }

    // Wait for all saves to complete
    if (savePromises.length > 0) {
      console.log(`Force saving ${savePromises.length} pending assessment changes...`);
      await Promise.all(savePromises);
      console.log('✅ All pending changes saved successfully');
    }
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

  // Auto-save functionality - immediately save on change with debouncing
  onAssessmentChange(index: number, field: 'status' | 'notes', value: AssessmentStatus | null | string) {
    console.log(`Assessment change detected: index=${index}, field=${field}, value="${value}"`);

    // Update the appropriate array immediately
    if (field === 'status') {
      this.assessmentStatuses[index] = value as AssessmentStatus | null;
    } else {
      this.assessmentNotes[index] = value as string;
    }

    // Clear existing timeout for this item
    if (this.autoSaveTimeout) {
      window.clearTimeout(this.autoSaveTimeout);
    }

    // Debounce the save operation to prevent too many rapid saves
    this.autoSaveTimeout = window.setTimeout(() => {
      this.saveAssessmentItem(index);
    }, this.autoSaveDelay) as number;
  }

  private async saveAssessmentItem(index: number): Promise<void> {
    // Prevent multiple saves for the same item
    if (this.activeSaves.has(index)) {
      console.log(`Save already in progress for item ${index}, skipping...`);
      return;
    }

    const tp = this.technologiesProcesses[index];
    const status = this.assessmentStatuses[index];
    const notes = this.assessmentNotes[index] || '';

    if (!tp) {
      console.warn(`No technology process found at index ${index}`);
      return;
    }

    this.activeSaves.add(index);
    this.isAutoSaving = true;

    try {
      console.log(`Saving assessment for ${tp.name}: status="${status}", notes="${notes}"`);

      if (status) {
        // Save the assessment with the current status and notes
        await this.data.saveAssessment(tp.id, status, notes);
        console.log(`✅ Successfully saved assessment for ${tp.name}`);
      } else {
        // If status is null, we might want to delete the assessment
        // For now, just log as the API doesn't support deletion
        console.log(`⚠️ Status is null for ${tp.name}, notes: "${notes}" - TODO: implement delete/clear assessment`);
        // TODO: Implement deleteAssessment method in the service
        // await this.data.deleteAssessment(tp.id);
      }

      // Reload assessment responses and rebuild summary after successful save
      this.assessmentResponses = await this.data.getAssessmentResponses();
      await this.buildPillarSummary();

    } catch (error) {
      console.error(`❌ Error saving assessment for ${tp.name}:`, error);
      // TODO: Show user-friendly error message
    } finally {
      this.activeSaves.delete(index);

      // Only set isAutoSaving to false if no other saves are active
      if (this.activeSaves.size === 0) {
        this.isAutoSaving = false;
      }
    }
  }

  ngOnDestroy() {
    // Clean up timeout on component destruction
    if (this.autoSaveTimeout) {
      window.clearTimeout(this.autoSaveTimeout);
    }

    // Clear active saves tracking
    this.activeSaves.clear();
  }

  // Helper methods for event handling
  onStatusChange(event: Event, index: number) {
    const target = event.target as HTMLSelectElement;
    const value = target.value === '' ? null : target.value as AssessmentStatus;
    console.log(`Status change from select: "${target.value}" -> ${value}`);
    this.onAssessmentChange(index, 'status', value);
  }

  onNotesChange(event: Event, index: number) {
    const target = event.target as HTMLTextAreaElement;
    console.log(`Notes change: "${target.value}"`);
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
    if (this.useV2Model) {
      this.onV2FunctionCapabilityChange();
    } else {
      this.onFunctionCapabilityChange();
    }
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
