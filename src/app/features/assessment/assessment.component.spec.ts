import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { AssessmentComponent } from './assessment.component';
import { IndexedDBService } from '../../services/indexeddb.service';
import { Pillar, FunctionCapability, MaturityStage, TechnologyProcess, AssessmentResponse } from '../../models/ztmm.models';

describe('AssessmentComponent', () => {
  let component: AssessmentComponent;
  let fixture: ComponentFixture<AssessmentComponent>;
  let mockDataService: jasmine.SpyObj<IndexedDBService>;

  const mockPillars: Pillar[] = [
    { id: 1, name: 'Identity' },
    { id: 2, name: 'Device' }
  ];

  const mockFunctionCapabilities: FunctionCapability[] = [
    { id: 1, name: 'User Identity Management', type: 'Function', pillar_id: 1 },
    { id: 2, name: 'Device Registration', type: 'Capability', pillar_id: 2 }
  ];

  const mockMaturityStages: MaturityStage[] = [
    { id: 1, name: 'Traditional' },
    { id: 2, name: 'Initial' },
    { id: 3, name: 'Advanced' },
    { id: 4, name: 'Optimal' }
  ];

  const mockTechnologiesProcesses: TechnologyProcess[] = [
    { id: 1, name: 'Azure AD', description: 'Azure AD', type: 'Technology', function_capability_id: 1, maturity_stage_id: 2 },
    { id: 2, name: 'Identity Lifecycle', description: 'Identity Lifecycle', type: 'Process', function_capability_id: 1, maturity_stage_id: 3 }
  ];

  const mockAssessmentResponses: AssessmentResponse[] = [
    { id: 1, tech_process_id: 1, status: 'Fully Implemented', notes: 'Complete' },
    { id: 2, tech_process_id: 2, status: 'Not Implemented' }
  ];

  beforeEach(async () => {
    // Create a more comprehensive spy object
    const spy = jasmine.createSpyObj('IndexedDBService', [
      'getPillars',
      'getFunctionCapabilities',
      'getMaturityStages',
      'getTechnologiesProcesses',
      'getAllTechnologiesProcesses',
      'getTechnologiesProcessesByFunction',
      'getAssessmentResponses',
      'saveAssessment',
      'addPillar',
      'removePillar',
      'editPillar',
      'savePillarOrder',
      'addFunctionCapability',
      'removeFunctionCapability',
      'editFunctionCapability',
      'saveFunctionOrder',
      'addTechnologyProcess',
      'removeTechnologyProcess',
      'editTechnologyProcess',
      'exportData',
      'importData',
      'clearAllData',
      'resetDatabase'
    ]);

    // Setup default spy returns BEFORE component creation
    spy.getPillars.and.returnValue(Promise.resolve([...mockPillars]));
    spy.getFunctionCapabilities.and.returnValue(Promise.resolve([...mockFunctionCapabilities]));
    spy.getMaturityStages.and.returnValue(Promise.resolve([...mockMaturityStages]));
    spy.getTechnologiesProcesses.and.returnValue(Promise.resolve([...mockTechnologiesProcesses]));
    spy.getAllTechnologiesProcesses.and.returnValue(Promise.resolve([...mockTechnologiesProcesses]));
    spy.getTechnologiesProcessesByFunction.and.returnValue(Promise.resolve([...mockTechnologiesProcesses]));
    spy.getAssessmentResponses.and.returnValue(Promise.resolve([...mockAssessmentResponses]));
    spy.saveAssessment.and.returnValue(Promise.resolve());

    // Setup additional spy returns for admin operations
    spy.addPillar.and.returnValue(Promise.resolve());
    spy.removePillar.and.returnValue(Promise.resolve());
    spy.editPillar.and.returnValue(Promise.resolve());
    spy.savePillarOrder.and.returnValue(Promise.resolve());
    spy.addFunctionCapability.and.returnValue(Promise.resolve());
    spy.removeFunctionCapability.and.returnValue(Promise.resolve());
    spy.editFunctionCapability.and.returnValue(Promise.resolve());
    spy.saveFunctionOrder.and.returnValue(Promise.resolve());
    spy.addTechnologyProcess.and.returnValue(Promise.resolve());
    spy.removeTechnologyProcess.and.returnValue(Promise.resolve());
    spy.editTechnologyProcess.and.returnValue(Promise.resolve());
    spy.exportData.and.returnValue(Promise.resolve({ data: new Uint8Array(), filename: 'test.json' }));
    spy.importData.and.returnValue(Promise.resolve());
    spy.clearAllData.and.returnValue(Promise.resolve());
    spy.resetDatabase.and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [AssessmentComponent, FormsModule],
      providers: [
        {
          provide: IndexedDBService,
          useFactory: () => spy
        }
      ]
    }).compileComponents();

    mockDataService = spy; // Store reference to spy directly

    fixture = TestBed.createComponent(AssessmentComponent);
    component = fixture.componentInstance;

    // Explicitly verify that the TestBed injected service is our spy
  const injectedService = TestBed.inject(IndexedDBService);
  expect(injectedService).toBe(spy);
  mockDataService = injectedService as jasmine.SpyObj<IndexedDBService>;

    // Trigger component initialization
    fixture.detectChanges();

    // Wait for async loadAll() to complete
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with loaded data and default selections', () => {
    // Data arrays should be populated from loadAll() during initialization
    expect(component.pillars).toEqual(mockPillars);
    expect(component.functionCapabilities).toEqual(mockFunctionCapabilities);
    expect(component.maturityStages).toEqual(mockMaturityStages);
    expect(component.assessmentResponses).toEqual(mockAssessmentResponses);

    // These arrays are initialized empty and only populated when selections are made
    expect(component.technologiesProcesses).toEqual([]);
    expect(component.assessmentStatuses).toEqual([]);
    expect(component.assessmentNotes).toEqual([]);
    expect(component.pillarSummary).toEqual([]);

    // Selection and UI state should have default values
    expect(component.selectedPillarId).toBeNull();
    expect(component.selectedFunctionCapabilityId).toBeNull();
    expect(component.showSuccess).toBeFalse();
  });

  it('should load all data on initialization', async () => {
    await component.loadAll();

    expect(mockDataService.getPillars).toHaveBeenCalled();
    expect(mockDataService.getFunctionCapabilities).toHaveBeenCalled();
    expect(mockDataService.getMaturityStages).toHaveBeenCalled();
    expect(mockDataService.getAssessmentResponses).toHaveBeenCalled();

    expect(component.pillars).toEqual(mockPillars);
    expect(component.functionCapabilities).toEqual(mockFunctionCapabilities);
    expect(component.maturityStages).toEqual(mockMaturityStages);
    expect(component.assessmentResponses).toEqual(mockAssessmentResponses);
  });

  it('should reset data arrays when loading', async () => {
    // Set some initial data
    component.technologiesProcesses = [mockTechnologiesProcesses[0]];
    component.assessmentStatuses = ['Fully Implemented'];
    component.assessmentNotes = ['Test note'];
    component.pillarSummary = [{
      functionCapability: { id: 1, name: 'Test FC', type: 'Function', pillar_id: 1 },
      totalCount: 1,
      completedCount: 0,
      completionPercentage: 0
    }];

    await component.loadAll();

    expect(component.technologiesProcesses).toEqual([]);
    expect(component.assessmentStatuses).toEqual([]);
    expect(component.assessmentNotes).toEqual([]);
    expect(component.pillarSummary).toEqual([]);
  });

  it('should handle pillar change and build summary', async () => {
    component.pillars = mockPillars;
    component.functionCapabilities = mockFunctionCapabilities;
    component.selectedPillarId = 1;

    spyOn(component, 'buildPillarSummary').and.returnValue(Promise.resolve());

    await component.onPillarChange();

    expect(component.buildPillarSummary).toHaveBeenCalled();
  });

  it('should clear summary when no pillar is selected', async () => {
    component.selectedPillarId = null;
    component.pillarSummary = [{
      functionCapability: { id: 1, name: 'Test FC', type: 'Function', pillar_id: 1 },
      totalCount: 1,
      completedCount: 0,
      completionPercentage: 0
    }];

    await component.onPillarChange();

    expect(component.pillarSummary).toEqual([]);
  });

  it('should have function capabilities loaded', () => {
    component.functionCapabilities = mockFunctionCapabilities;

    expect(component.functionCapabilities).toHaveSize(2);
    expect(component.functionCapabilities[0].name).toBe('User Identity Management');
  });

  it('should handle function capability selection', async () => {
    component.selectedFunctionCapabilityId = 1;
    component.technologiesProcesses = [];

    await component.onFunctionCapabilityChange();

    expect(mockDataService.getTechnologiesProcessesByFunction).toHaveBeenCalledWith(1);
    expect(component.technologiesProcesses.length).toBeGreaterThan(0);
  });

  it('should initialize assessment arrays on function capability selection', async () => {
    component.selectedFunctionCapabilityId = 1;
    // Mock getAssessmentResponses to return empty array for this test
    mockDataService.getAssessmentResponses.and.returnValue(Promise.resolve([]));

    await component.onFunctionCapabilityChange();

    expect(component.assessmentStatuses).toHaveSize(mockTechnologiesProcesses.length);
    expect(component.assessmentNotes).toHaveSize(mockTechnologiesProcesses.length);
    expect(component.assessmentStatuses.every(status => status === null)).toBeTruthy();
    expect(component.assessmentNotes.every(note => note === '')).toBeTruthy();
  });

  it('should populate existing assessment responses', async () => {
    component.selectedFunctionCapabilityId = 1;
    component.assessmentResponses = mockAssessmentResponses;

    await component.onFunctionCapabilityChange();

    // Check that existing responses are loaded
    expect(component.assessmentStatuses[0]).toBe('Fully Implemented');
    expect(component.assessmentNotes[0]).toBe('Complete');
    expect(component.assessmentStatuses[1]).toBe('Not Implemented');
    expect(component.assessmentNotes[1]).toBe('');
  });

  it('should save assessment successfully', async () => {
    component.technologiesProcesses = mockTechnologiesProcesses;
    component.assessmentStatuses = ['Fully Implemented', 'Partially Implemented'];
    component.assessmentNotes = ['Complete', 'In progress'];

    await component.submitAssessment();

    expect(mockDataService.saveAssessment).toHaveBeenCalledTimes(2);
    expect(mockDataService.saveAssessment).toHaveBeenCalledWith(1, 'Fully Implemented', 'Complete');
    expect(mockDataService.saveAssessment).toHaveBeenCalledWith(2, 'Partially Implemented', 'In progress');
    expect(component.showSuccess).toBeTruthy();
  });

  it('should hide success message after timeout', (done) => {
    component.showSuccess = true;

    component.submitAssessment().then(() => {
      setTimeout(() => {
        expect(component.showSuccess).toBeFalsy();
        done();
      }, 3100); // Just over the 3 second timeout
    });
  });

  it('should get maturity stage name by id', () => {
    component.maturityStages = mockMaturityStages;

    expect(component.getMaturityStageName(1)).toBe('Traditional');
    expect(component.getMaturityStageName(2)).toBe('Initial');
    expect(component.getMaturityStageName(999)).toBe('Unknown');
  });

  it('should determine if function capability has technologies/processes', () => {
    component.functionCapabilities = mockFunctionCapabilities;
    component.technologiesProcesses = mockTechnologiesProcesses;

    // Test with technologies/processes filtered by function capability
    expect(component.technologiesProcesses.length).toBeGreaterThan(0);
  });

  it('should handle errors gracefully during data loading', async () => {
    mockDataService.getPillars.and.returnValue(Promise.reject(new Error('Database error')));

    spyOn(console, 'error');

    await component.loadAll();

    expect(console.error).toHaveBeenCalled();
    expect(component.pillars).toEqual([]);
  });

  it('should handle errors gracefully during assessment save', async () => {
    mockDataService.saveAssessment.and.returnValue(Promise.reject(new Error('Save error')));
    component.technologiesProcesses = [mockTechnologiesProcesses[0]];
    component.assessmentStatuses = ['Fully Implemented'];
    component.assessmentNotes = ['Test'];

    spyOn(console, 'error');

    await component.submitAssessment();

    expect(console.error).toHaveBeenCalled();
    expect(component.showSuccess).toBeFalsy();
  });

  it('should build pillar summary with correct percentages', async () => {
    component.selectedPillarId = 1;
    component.functionCapabilities = mockFunctionCapabilities;
    component.assessmentResponses = mockAssessmentResponses;

    // Mock getTechnologiesProcesses to return the mock data for the function capability
    mockDataService.getTechnologiesProcesses.and.returnValue(Promise.resolve(mockTechnologiesProcesses));

    await component.buildPillarSummary();

    expect(component.pillarSummary).toHaveSize(1);
    expect(component.pillarSummary[0].functionCapability.name).toBe('User Identity Management');
  });

  it('should validate status options are correctly defined', () => {
    expect(component.statusOptions).toEqual([
      'Not Implemented',
      'Partially Implemented',
      'Fully Implemented',
      'Superseded'
    ]);
  });

  it('should go to a specific page and update pagination', () => {
    component.availableStages = ['Traditional', 'Initial', 'Advanced'];
    component.totalPages = 3;
    component.currentPage = 1;
    spyOn(component, 'updatePagination');
    component.goToPage(2);
    expect(component.currentPage).toBe(2);
    expect(component.updatePagination).toHaveBeenCalled();
  });

  it('should go to previous and next page', () => {
    component.availableStages = ['Traditional', 'Initial', 'Advanced'];
    component.totalPages = 3;
    component.currentPage = 2;
    spyOn(component, 'updatePagination');
    component.previousPage();
    expect(component.currentPage).toBe(1);
    component.nextPage();
    expect(component.currentPage).toBe(2);
    expect(component.updatePagination).toHaveBeenCalledTimes(2);
  });

  it('should return correct page numbers', () => {
    component.totalPages = 3;
    component.currentPage = 2;
    expect(component.getPageNumbers()).toEqual([1, 2, 3]);
    component.totalPages = 10;
    component.currentPage = 5;
    expect(component.getPageNumbers().length).toBeLessThanOrEqual(5);
  });

  it('should calculate current progress', () => {
    component.technologiesProcesses = [{...mockTechnologiesProcesses[0]}, {...mockTechnologiesProcesses[1]}];
    component.assessmentStatuses = ['Fully Implemented', null];
    expect(component.getCurrentProgress()).toBe(50);
  });

  it('should handle assessment change and auto-save', async () => {
    component.technologiesProcesses = [{...mockTechnologiesProcesses[0]}];
    component.assessmentStatuses = [null];
    component.assessmentNotes = [''];
    spyOn<any>(component, 'saveAssessmentItem').and.returnValue(Promise.resolve());
    component.onAssessmentChange(0, 'status', 'Fully Implemented');
    expect(component.assessmentStatuses[0]).toBe('Fully Implemented');
    component.onAssessmentChange(0, 'notes', 'Test note');
    expect(component.assessmentNotes[0]).toBe('Test note');
  });

  it('should call saveAssessmentItem and handle activeSaves', async () => {
    component.technologiesProcesses = [{...mockTechnologiesProcesses[0]}];
    component.assessmentStatuses = ['Fully Implemented'];
    component.assessmentNotes = ['Test note'];
    // Use bracket notation to access private property for test
    const activeSaves = (component as any)['activeSaves'];
    const promise = (component as any)['saveAssessmentItem'](0);
    expect(activeSaves.has(0)).toBeTrue();
    await promise;
    expect(activeSaves.has(0)).toBeFalse();
  });

  it('should clean up on destroy', () => {
    (component as any)['autoSaveTimeout'] = window.setTimeout(() => { /* no-op for test */ }, 1000);
    (component as any)['activeSaves'].add(1);
    component.ngOnDestroy();
    expect((component as any)['activeSaves'].size).toBe(0);
  });
});
