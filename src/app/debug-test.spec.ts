import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { AssessmentComponent } from './assessment.component';
import { ZtmmDataWebService } from './services/ztmm-data-web.service';
import { TestUtilsIndexedDB } from './testing/test-utils-indexeddb';

describe('Debug Test for technologiesProcesses issue', () => {
  let component: AssessmentComponent;
  let fixture: ComponentFixture<AssessmentComponent>;
  let mockDataService: jasmine.SpyObj<ZtmmDataWebService>;
  let mockApi: any;

  beforeEach(async () => {
    // Mock window.api for browser environment
    (window as any).api = TestUtilsIndexedDB.createMockElectronApi();
    mockApi = (window as any).api;

    const spy = TestUtilsIndexedDB.createServiceSpy<ZtmmDataWebService>('ZtmmDataWebService', [
      'getPillars',
      'getFunctionCapabilities',
      'getMaturityStages',
      'getTechnologiesProcesses',
      'getAllTechnologiesProcesses',
      'getTechnologiesProcessesByFunction',
      'getAssessmentResponses',
      'saveAssessment'
    ]);

    await TestBed.configureTestingModule({
      imports: [AssessmentComponent, FormsModule],
      providers: [
        { provide: ZtmmDataWebService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AssessmentComponent);
    component = fixture.componentInstance;
    mockDataService = spy;
  });

  afterEach(() => {
    TestUtilsIndexedDB.resetApiSpies(mockApi);
    delete (window as any).api;
  });

  it('should load technologiesProcesses when onFunctionCapabilityChange is called', async () => {
    // Set up specific mock for getTechnologiesProcessesByFunction
    const mockData = TestUtilsIndexedDB.createMockData();
    console.log('Available mockTechnologyProcesses:', mockData.mockTechnologyProcesses);
    console.log('Filtered for function_capability_id 1:', mockData.mockTechnologyProcesses.filter(tp => tp.function_capability_id === 1));

    mockDataService.getTechnologiesProcessesByFunction.and.returnValue(
      Promise.resolve(mockData.mockTechnologyProcesses.filter(tp => tp.function_capability_id === 1))
    );

    // Initialize component
    await component.loadAll();

    // Set function capability ID and call the method
    component.selectedFunctionCapabilityId = 1;
    console.log('Before calling onFunctionCapabilityChange, technologiesProcesses length:', component.technologiesProcesses.length);

    await component.onFunctionCapabilityChange();

    console.log('After calling onFunctionCapabilityChange, technologiesProcesses length:', component.technologiesProcesses.length);
    console.log('Actual technologiesProcesses:', component.technologiesProcesses);
    console.log('getTechnologiesProcessesByFunction spy called:', mockDataService.getTechnologiesProcessesByFunction.calls.count());
    console.log('getTechnologiesProcessesByFunction spy args:', mockDataService.getTechnologiesProcessesByFunction.calls.allArgs());

    // Verify the spy was called correctly
    expect(mockDataService.getTechnologiesProcessesByFunction).toHaveBeenCalledWith(1);

    // Check the result
    expect(component.technologiesProcesses.length).toBeGreaterThan(0);
  });
});
