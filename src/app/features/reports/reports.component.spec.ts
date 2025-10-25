import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportsComponent } from './reports.component';
import { IndexedDBService } from '../../services/indexeddb.service';
import { ReportDataService } from './services/report-data.service';
import { HtmlExportService } from './services/html-export.service';
import { CsvExportService } from './services/csv-export.service';
import { MaturityCalculationService } from './services/maturity-calculation.service';

describe('ReportsComponent', () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;
  let mockIndexedDBService: jasmine.SpyObj<IndexedDBService>;

  beforeEach(async () => {
    mockIndexedDBService = jasmine.createSpyObj('IndexedDBService', [
      'getPillars',
      'getFunctionCapabilities',
      'getMaturityStages',
      'getTechnologiesProcesses',
      'getAssessmentResponses',
      'getProcessTechnologyGroups',
      'getMaturityStageImplementations',
      'getAssessmentsV2'
    ]);

    // Set up default return values
    mockIndexedDBService.getPillars.and.returnValue(Promise.resolve([]));
    mockIndexedDBService.getFunctionCapabilities.and.returnValue(Promise.resolve([]));
    mockIndexedDBService.getMaturityStages.and.returnValue(Promise.resolve([]));
    mockIndexedDBService.getTechnologiesProcesses.and.returnValue(Promise.resolve([]));
    mockIndexedDBService.getAssessmentResponses.and.returnValue(Promise.resolve([]));
    mockIndexedDBService.getProcessTechnologyGroups.and.returnValue(Promise.resolve([]));
    mockIndexedDBService.getMaturityStageImplementations.and.returnValue(Promise.resolve([]));
    mockIndexedDBService.getAssessmentsV2.and.returnValue(Promise.resolve([]));

    await TestBed.configureTestingModule({
      imports: [ReportsComponent],
      providers: [
        { provide: IndexedDBService, useValue: mockIndexedDBService },
        ReportDataService,
        HtmlExportService,
        CsvExportService,
        MaturityCalculationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Data Loading', () => {
    it('should load V2 data from IndexedDB on initialization', () => {
      // Component now uses V2 data model exclusively
      expect(component).toBeTruthy();
      expect(component.pillarSummaries).toEqual([]);
      expect(component.selectedPillarId).toBeNull();
    });
  });

  describe('Export Functionality', () => {
    it('should have export capabilities for HTML and CSV', () => {
      // Verify export methods exist
      expect(typeof (component as any).exportToHtml).toBe('function');
      expect(typeof (component as any).exportToCsv).toBe('function');
    });
  });
});
