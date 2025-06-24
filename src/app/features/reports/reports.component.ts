import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, style, transition, animate } from '@angular/animations';
import { ZtmmDataWebService } from '../../services/ztmm-data-web.service';
import { Pillar, FunctionCapability, TechnologyProcess, MaturityStage, AssessmentResponse } from '../../models/ztmm.models';

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

  // Computed Data
  pillarSummaries: PillarSummary[] = [];
  selectedPillarSummary: PillarSummary | null = null;
  selectedFunctionSummary: FunctionSummary | null = null;
  selectedFunctionDetails: DetailedAssessmentItem[] = [];

  // Display options
  showTechnologyDescriptions = false;

  constructor(
    private data: ZtmmDataWebService,
    private reportDataService: ReportDataService,
    private maturityCalculation: MaturityCalculationService
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
    this.pillarSummaries = this.reportDataService.buildPillarSummaries(
      this.pillars,
      this.functionCapabilities,
      this.maturityStages,
      this.technologiesProcesses,
      this.assessmentResponses
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

    this.selectedFunctionDetails = this.reportDataService.buildFunctionDetails(
      this.selectedFunctionSummary,
      this.pillars,
      this.maturityStages,
      this.technologiesProcesses,
      this.assessmentResponses
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

  onDescriptionsToggled(show: boolean): void {
    this.showTechnologyDescriptions = show;
  }

  onExportRequested(format: ExportFormat): void {
    this.isExportingDoc = true;

    // TODO: Implement actual export logic based on format
    console.log(`Exporting report in ${format} format...`);

    // Simulate export process
    setTimeout(() => {
      this.isExportingDoc = false;
      console.log(`Export completed for ${format} format`);
    }, 2000);
  }

  // Helper methods for backward compatibility
  get hasData(): boolean {
    return this.pillarSummaries.length > 0;
  }
}
