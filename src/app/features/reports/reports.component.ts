import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, style, transition, animate } from '@angular/animations';
import { IndexedDBService } from '../../services/indexeddb.service';
import { LoggingService } from '../../services/logging.service';
import {
  Pillar,
  FunctionCapability,
  TechnologyProcess,
  MaturityStage,
  AssessmentResponse,
  ProcessTechnologyGroup,
  MaturityStageImplementation,
  Assessment,
  StageImplementationDetail
} from '../../models/ztmm.models';

// Import new components and services
import { PillarOverviewComponent } from './components/pillar-overview.component';
import { PillarDetailComponent } from './components/pillar-detail.component';
import { FunctionDetailComponent } from './components/function-detail.component';
import { ReportsBreadcrumbComponent } from './components/reports-breadcrumb.component';
import { ReportExportComponent, ExportFormat } from './components/report-export.component';

// Import new models and services
import {
  PillarSummary,
  FunctionSummary,
  DetailedAssessmentItem,
  ViewLevel
} from './models/report.models';
import { ReportDataService } from './services/report-data.service';
import { MaturityCalculationService } from './services/maturity-calculation.service';
import { HtmlExportService } from './services/html-export.service';
import { CsvExportService } from './services/csv-export.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PillarOverviewComponent,
    PillarDetailComponent,
    FunctionDetailComponent,
    ReportsBreadcrumbComponent,
    ReportExportComponent
  ],
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
  // V1 Data - kept for import/migration support only
  pillars: Pillar[] = [];
  functionCapabilities: FunctionCapability[] = [];
  maturityStages: MaturityStage[] = [];
  technologiesProcesses: TechnologyProcess[] = [];
  assessmentResponses: AssessmentResponse[] = [];

  // V2 Data (now the default and only UI model)
  processTechnologyGroups: ProcessTechnologyGroup[] = [];
  maturityStageImplementations: MaturityStageImplementation[] = [];
  assessmentsV2: Assessment[] = [];
  stageImplementationDetails: StageImplementationDetail[] = [];

  // UI State
  currentView: ViewLevel = 'pillar-overview';
  selectedPillarId: number | null = null;
  selectedFunctionId: number | null = null;
  isExportingDoc = false;

  // Computed Data
  pillarSummaries: PillarSummary[] = [];
  selectedPillarSummary: PillarSummary | null = null;
  selectedFunctionSummary: FunctionSummary | null = null;
  selectedFunctionDetails: DetailedAssessmentItem[] = [];

  // Display options
  // showTechnologyDescriptions removed - descriptions are now always visible

  private readonly LOG_CONTEXT = 'ReportsComponent';

  constructor(
    private data: IndexedDBService,
    private logger: LoggingService,
    private reportDataService: ReportDataService,
    private maturityCalculation: MaturityCalculationService,
    private htmlExportService: HtmlExportService,
    private csvExportService: CsvExportService
  ) {}

  async ngOnInit() {
    await this.loadAll();
  }

  async loadAll() {
    try {
      // Load common data
      this.pillars = await this.data.getPillars();
      this.functionCapabilities = await this.data.getFunctionCapabilities();
      this.maturityStages = await this.data.getMaturityStages();

      // Load V1 data (for backwards compatibility checks only)
      this.technologiesProcesses = await this.data.getAllTechnologiesProcesses();
      this.assessmentResponses = await this.data.getAssessmentResponses();

      // Load V2 data (primary data model)
      this.processTechnologyGroups = await this.data.getProcessTechnologyGroups();
      this.maturityStageImplementations = await this.data.getMaturityStageImplementations();
      this.assessmentsV2 = await this.data.getAssessmentsV2();
      this.stageImplementationDetails = await this.data.getStageImplementationDetails();

      this.buildPillarSummaries();
    } catch (error) {
      this.logger.error('Error loading data', error as Error, this.LOG_CONTEXT);
    }
  }

  buildPillarSummaries() {
    // Always use V2 data model
    this.pillarSummaries = this.reportDataService.buildV2PillarSummaries(
      this.pillars,
      this.functionCapabilities,
      this.maturityStages,
      this.processTechnologyGroups,
      this.maturityStageImplementations,
      this.assessmentsV2,
      this.stageImplementationDetails
    );
  }

  // Navigation methods
  onNavigationRequested(view: ViewLevel): void {
    switch (view) {
      case 'pillar-overview':
        this.goBackToPillarOverview();
        break;
      case 'pillar-detail':
        this.goBackToPillarDetail();
        break;
    }
  }

  onPillarSelected(pillarSummary: PillarSummary): void {
    this.selectedPillarSummary = pillarSummary;
    this.selectedPillarId = pillarSummary.pillar.id;
    this.currentView = 'pillar-detail';
  }

  onFunctionSelected(functionSummary: FunctionSummary): void {
    this.selectedFunctionSummary = functionSummary;
    this.selectedFunctionId = functionSummary.functionCapability.id;
    this.currentView = 'function-detail';
    this.loadFunctionDetails();
  }

  loadFunctionDetails() {
    if (!this.selectedFunctionSummary) return;

    // Always use V2 data model with stage implementation details
    this.selectedFunctionDetails = this.reportDataService.buildV2FunctionDetails(
      this.selectedFunctionSummary,
      this.pillars,
      this.maturityStages,
      this.processTechnologyGroups,
      this.maturityStageImplementations,
      this.assessmentsV2,
      this.stageImplementationDetails
    );
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

  onExportRequested(format: ExportFormat): void {
    this.isExportingDoc = true;

    try {
      if (format === 'html') {
        this.exportToHtml();
      } else if (format === 'csv') {
        this.exportToCsv();
      } else {
        // TODO: Implement PDF export
        setTimeout(() => {
          this.isExportingDoc = false;
        }, 2000);
      }
    } catch (error) {
      this.logger.error('Export failed', error as Error, this.LOG_CONTEXT, { format });
      this.isExportingDoc = false;
    }
  }

  private async exportToHtml(): Promise<void> {
    try {
      // Collect all function details for all functions
      const allFunctionDetails = new Map<number, DetailedAssessmentItem[]>();

      for (const pillarSummary of this.pillarSummaries) {
        for (const functionSummary of pillarSummary.functions) {
          // Always use V2 data model with stage implementation details
          const details = this.reportDataService.buildV2FunctionDetails(
            functionSummary,
            this.pillars,
            this.maturityStages,
            this.processTechnologyGroups,
            this.maturityStageImplementations,
            this.assessmentsV2,
            this.stageImplementationDetails
          );

          allFunctionDetails.set(functionSummary.functionCapability.id, details);
        }
      }

      // Generate HTML content
      const htmlContent = this.htmlExportService.generateHtmlReport(
        this.pillarSummaries,
        allFunctionDetails
      );

      // Download the HTML file
      this.htmlExportService.downloadHtmlReport(htmlContent);

      this.isExportingDoc = false;
    } catch (error) {
      this.logger.error('HTML export failed', error as Error, this.LOG_CONTEXT);
      this.isExportingDoc = false;
    }
  }

  private async exportToCsv(): Promise<void> {
    try {
      // Collect all function details for all functions
      const allFunctionDetails = new Map<number, DetailedAssessmentItem[]>();

      for (const pillarSummary of this.pillarSummaries) {
        for (const functionSummary of pillarSummary.functions) {
          // Always use V2 data model with stage implementation details
          const details = this.reportDataService.buildV2FunctionDetails(
            functionSummary,
            this.pillars,
            this.maturityStages,
            this.processTechnologyGroups,
            this.maturityStageImplementations,
            this.assessmentsV2,
            this.stageImplementationDetails
          );

          allFunctionDetails.set(functionSummary.functionCapability.id, details);
        }
      }

      // Generate CSV content
      const csvContent = this.csvExportService.generateCsvReport(
        this.pillarSummaries,
        allFunctionDetails
      );

      // Create filename with current date
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
      const filename = `zero-trust-maturity-assessment-${dateStr}`;

      // Download the CSV file
      this.csvExportService.downloadCsv(csvContent, filename);

      this.isExportingDoc = false;
    } catch (error) {
      this.logger.error('CSV export failed', error as Error, this.LOG_CONTEXT);
      this.isExportingDoc = false;
    }
  }

  // Helper methods for backward compatibility
  get hasData(): boolean {
    return this.pillarSummaries.length > 0;
  }
}
