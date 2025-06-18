import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { AdminComponent } from './admin.component';
import { ZtmmDataWebService } from '../../services/ztmm-data-web.service';
import { DataExportService } from '../../utilities/data-export.service';
import { DemoDataGeneratorService } from '../../services/demo-data-generator.service';
import { Pillar, FunctionCapability, MaturityStage, TechnologyProcess } from '../../models/ztmm.models';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;
  let mockDataService: jasmine.SpyObj<ZtmmDataWebService>;
  let _mockExportService: jasmine.SpyObj<DataExportService>; // eslint-disable-line @typescript-eslint/no-unused-vars
  let mockDemoDataService: jasmine.SpyObj<DemoDataGeneratorService>;

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
    { id: 1, name: 'Azure AD', description: 'Azure AD', type: 'Technology', function_capability_id: 1, maturity_stage_id: 2 }
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ZtmmDataWebService', [
      'getPillars',
      'addPillar',
      'removePillar',
      'editPillar',
      'savePillarOrder',
      'getFunctionCapabilities',
      'addFunctionCapability',
      'removeFunctionCapability',
      'editFunctionCapability',
      'saveFunctionOrder',
      'getMaturityStages',
      'getTechnologiesProcesses',
      'getAllTechnologiesProcesses',
      'getTechnologiesProcessesByFunction',
      'addTechnologyProcess',
      'removeTechnologyProcess',
      'editTechnologyProcess',
      'resetDatabase'
    ]);

    const exportSpy = jasmine.createSpyObj('DataExportService', [
      'getDataStatistics',
      'downloadExport',
      'importData'
    ]);

    const demoDataSpy = jasmine.createSpyObj('DemoDataGeneratorService', [
      'generateDemoData',
      'generateCompleteDemoData',
      'isDemoDataAlreadyGenerated',
      'getDemoDataStatistics'
    ]);

    // Setup default spy returns BEFORE component creation
    spy.getPillars.and.returnValue(Promise.resolve(mockPillars));
    spy.addPillar.and.returnValue(Promise.resolve());
    spy.removePillar.and.returnValue(Promise.resolve());
    spy.editPillar.and.returnValue(Promise.resolve());
    spy.savePillarOrder.and.returnValue(Promise.resolve());
    spy.getFunctionCapabilities.and.returnValue(Promise.resolve(mockFunctionCapabilities));
    spy.addFunctionCapability.and.returnValue(Promise.resolve());
    spy.removeFunctionCapability.and.returnValue(Promise.resolve());
    spy.editFunctionCapability.and.returnValue(Promise.resolve());
    spy.saveFunctionOrder.and.returnValue(Promise.resolve());
    spy.getMaturityStages.and.returnValue(Promise.resolve(mockMaturityStages));

    // Mock getTechnologiesProcesses to return different data for different function capabilities
    spy.getTechnologiesProcesses.and.callFake((fcId: number) => {
      if (fcId === 1) {
        return Promise.resolve(mockTechnologiesProcesses);
      } else {
        return Promise.resolve([]);
      }
    });

    spy.getAllTechnologiesProcesses.and.returnValue(Promise.resolve(mockTechnologiesProcesses));
    spy.getTechnologiesProcessesByFunction.and.returnValue(Promise.resolve(mockTechnologiesProcesses));

    spy.addTechnologyProcess.and.returnValue(Promise.resolve());
    spy.removeTechnologyProcess.and.returnValue(Promise.resolve());
    spy.editTechnologyProcess.and.returnValue(Promise.resolve());
    spy.resetDatabase.and.returnValue(Promise.resolve());

    // Setup export service spies
    exportSpy.getDataStatistics.and.returnValue(Promise.resolve({
      pillars: 2,
      functionCapabilities: 2,
      maturityStages: 4,
      technologiesProcesses: 1,
      assessmentResponses: 0
    }));
    exportSpy.downloadExport.and.returnValue(Promise.resolve());
    exportSpy.importData.and.returnValue(Promise.resolve());

    // Setup demo data service spies
    demoDataSpy.generateDemoData.and.returnValue(Promise.resolve());
    demoDataSpy.generateCompleteDemoData.and.returnValue(Promise.resolve());
    demoDataSpy.isDemoDataAlreadyGenerated.and.returnValue(Promise.resolve(false));
    demoDataSpy.getDemoDataStatistics.and.returnValue(Promise.resolve({
      functionsWithData: 37,
      totalTechnologies: 111,
      totalProcesses: 111,
      totalItems: 222
    }));

    await TestBed.configureTestingModule({
      imports: [AdminComponent, FormsModule],
      providers: [
        { provide: ZtmmDataWebService, useValue: spy },
        { provide: DataExportService, useValue: exportSpy },
        { provide: DemoDataGeneratorService, useValue: demoDataSpy }
      ]
    }).compileComponents();

    mockDataService = spy; // Store reference to spy directly
    _mockExportService = exportSpy;
    mockDemoDataService = demoDataSpy;

    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;

    // Explicitly wait for loadAll to complete during ngOnInit
    await component.loadAll();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with loaded data and default form values', async () => {
    // Ensure data is loaded
    await component.loadAll();
    fixture.detectChanges();

    // Data arrays should be populated from loadAll() during initialization
    expect(component.pillars).toEqual(mockPillars);
    expect(component.functionCapabilities).toEqual(mockFunctionCapabilities);
    expect(component.maturityStages).toEqual(mockMaturityStages);
    expect(component.technologiesProcesses).toEqual(mockTechnologiesProcesses);

    // Form fields should have default values
    expect(component.newPillar).toBe('');
    expect(component.newFunctionCapability).toBe('');
    expect(component.newFunctionCapabilityType).toBe('Function');
    expect(component.selectedPillarId).toBeNull();
    expect(component.newTechnologyProcessName).toBe('');
    expect(component.newTechnologyProcessDescription).toBe('');
    expect(component.newTechnologyProcessType).toBe('Technology');
    expect(component.selectedFunctionCapabilityId).toBeNull();
    expect(component.selectedMaturityStageId).toBeNull();
    expect(component.activeTab).toBe('pillars');
  });

  describe('Data Loading', () => {
    it('should load all data on initialization', async () => {
      await component.loadAll();

      expect(mockDataService.getPillars).toHaveBeenCalled();
      expect(mockDataService.getFunctionCapabilities).toHaveBeenCalled();
      expect(mockDataService.getMaturityStages).toHaveBeenCalled();

      expect(component.pillars).toEqual(mockPillars);
      expect(component.functionCapabilities).toEqual(mockFunctionCapabilities);
      expect(component.maturityStages).toEqual(mockMaturityStages);
    });
  });

  describe('Pillar Management', () => {
    it('should add a new pillar', async () => {
      component.newPillar = 'Network';

      await component.addPillar();

      expect(mockDataService.addPillar).toHaveBeenCalledWith('Network');
      expect(mockDataService.getPillars).toHaveBeenCalled();
      expect(component.newPillar).toBe('');
    });

    it('should not add pillar with empty name', async () => {
      component.newPillar = '';

      await component.addPillar();

      expect(mockDataService.addPillar).not.toHaveBeenCalled();
    });

    it('should remove a pillar with confirmation', async () => {
      spyOn(window, 'confirm').and.returnValue(true);

      await component.removePillar(1);

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this pillar? This will also delete all associated function/capabilities and technologies/processes.');
      expect(mockDataService.removePillar).toHaveBeenCalledWith(1);
      expect(mockDataService.getPillars).toHaveBeenCalled();
      expect(mockDataService.getFunctionCapabilities).toHaveBeenCalled();
    });

    it('should not remove pillar without confirmation', async () => {
      spyOn(window, 'confirm').and.returnValue(false);

      await component.removePillar(1);

      expect(mockDataService.removePillar).not.toHaveBeenCalled();
    });

    it('should edit a pillar', async () => {
      const pillar = { id: 1, name: 'Identity' };

      component.startEditPillar(pillar);
      component.editingPillarName = 'Updated Identity';
      await component.saveEditPillar();

      expect(mockDataService.editPillar).toHaveBeenCalledWith(1, 'Updated Identity');
      expect(mockDataService.getPillars).toHaveBeenCalled();
    });
  });

  describe('Function Capability Management', () => {
    beforeEach(() => {
      component.pillars = mockPillars;
      component.selectedPillarId = 1;
    });

    it('should add a new function capability', async () => {
      component.newFunctionCapability = 'New Function';
      component.newFunctionCapabilityType = 'Function';

      await component.addFunctionCapability();

      expect(mockDataService.addFunctionCapability).toHaveBeenCalledWith('New Function', 'Function', 1);
      expect(mockDataService.getFunctionCapabilities).toHaveBeenCalled();
      expect(component.newFunctionCapability).toBe('');
      expect(component.newFunctionCapabilityType).toBe('Function');
    });

    it('should not add function capability with empty name', async () => {
      component.newFunctionCapability = '';

      await component.addFunctionCapability();

      expect(mockDataService.addFunctionCapability).not.toHaveBeenCalled();
    });

    it('should not add function capability without selected pillar', async () => {
      component.selectedPillarId = null;
      component.newFunctionCapability = 'Test Function';

      await component.addFunctionCapability();

      expect(mockDataService.addFunctionCapability).not.toHaveBeenCalled();
    });

    it('should remove a function capability with confirmation', async () => {
      spyOn(window, 'confirm').and.returnValue(true);

      await component.removeFunctionCapability(1);

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this function/capability? This will also delete all associated technologies/processes.');
      expect(mockDataService.removeFunctionCapability).toHaveBeenCalledWith(1);
      expect(mockDataService.getFunctionCapabilities).toHaveBeenCalled();
    });

    it('should edit a function capability', async () => {
      const functionCapability = { id: 1, name: 'User Identity Management', type: 'Function' as const, pillar_id: 1 };

      component.startEditFunction(functionCapability);
      component.editingFunction = { name: 'Updated Function', type: 'Capability', pillar_id: 2 };
      await component.saveEditFunction();

      expect(mockDataService.editFunctionCapability).toHaveBeenCalledWith(1, 'Updated Function', 'Capability', 2);
      expect(mockDataService.getFunctionCapabilities).toHaveBeenCalled();
    });

    it('should get pillar name by id', () => {
      component.pillars = mockPillars;

      expect(component.getPillarName(1)).toBe('Identity');
      expect(component.getPillarName(999)).toBe('Unknown');
    });
  });

  describe('Technology Process Management', () => {
    beforeEach(() => {
      component.functionCapabilities = mockFunctionCapabilities;
      component.maturityStages = mockMaturityStages;
      component.selectedFunctionCapabilityId = 1;
      component.selectedMaturityStageId = 2;
    });

    it('should load technologies/processes for function capability', async () => {
      await component.loadTechnologiesProcesses();

      expect(mockDataService.getTechnologiesProcessesByFunction).toHaveBeenCalledWith(1);
      expect(component.technologiesProcesses).toEqual(mockTechnologiesProcesses);
    });

    it('should add a new technology process', async () => {
      component.newTechnologyProcessName = 'New Technology';
      component.newTechnologyProcessDescription = 'New Technology Description';
      component.newTechnologyProcessType = 'Technology';

      await component.addTechnologyProcess();

      expect(mockDataService.addTechnologyProcess).toHaveBeenCalledWith('New Technology', 'New Technology Description', 'Technology', 1, 2);
      expect(mockDataService.getTechnologiesProcessesByFunction).toHaveBeenCalledWith(1);
      expect(component.newTechnologyProcessName).toBe('');
      expect(component.newTechnologyProcessDescription).toBe('');
      expect(component.newTechnologyProcessType).toBe('Technology');
    });

    it('should not add technology process with empty name', async () => {
      component.newTechnologyProcessName = '';

      await component.addTechnologyProcess();

      expect(mockDataService.addTechnologyProcess).not.toHaveBeenCalled();
    });

    it('should not add technology process without selections', async () => {
      component.selectedFunctionCapabilityId = null;
      component.newTechnologyProcessName = 'Test';

      await component.addTechnologyProcess();

      expect(mockDataService.addTechnologyProcess).not.toHaveBeenCalled();
    });

    it('should remove a technology process with confirmation', async () => {
      spyOn(window, 'confirm').and.returnValue(true);
      component.selectedFunctionCapabilityId = 1;

      await component.removeTechnologyProcess(1);

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this technology/process?');
      expect(mockDataService.removeTechnologyProcess).toHaveBeenCalledWith(1);
      expect(component.loadTechnologiesProcesses).toBeDefined();
    });

    it('should edit a technology process', async () => {
      const techProcess = mockTechnologiesProcesses[0];
      component.selectedFunctionCapabilityId = 1;

      component.startEditTechProcess(techProcess);
      component.editingTechProcess = { name: 'Updated Name', description: 'Updated Description', type: 'Process', function_capability_id: 2, maturity_stage_id: 3 };
      await component.saveEditTechProcess();

      expect(mockDataService.editTechnologyProcess).toHaveBeenCalledWith(1, 'Updated Name', 'Updated Description', 'Process', 2, 3);
      expect(component.loadTechnologiesProcesses).toBeDefined();
    });

    it('should get function capability name by id', () => {
      component.functionCapabilities = mockFunctionCapabilities;

      expect(component.getFunctionCapabilityName(1)).toBe('User Identity Management');
      expect(component.getFunctionCapabilityName(999)).toBe('Unknown');
    });

    it('should get maturity stage name by id', () => {
      component.maturityStages = mockMaturityStages;

      expect(component.getMaturityStageName(1)).toBe('Traditional');
      expect(component.getMaturityStageName(999)).toBe('Unknown');
    });
  });

  describe('Tab Management', () => {
    it('should manage active tab', () => {
      component.activeTab = 'functions';

      expect(component.activeTab).toBe('functions');
    });

    it('should check if tab is active', () => {
      component.activeTab = 'pillars';

      expect(component.activeTab).toBe('pillars');

      component.activeTab = 'functions';
      expect(component.activeTab).toBe('functions');
    });
  });

  describe('Drag and Drop', () => {
    it('should handle pillar reorder', async () => {
      const newOrder = [2, 1];
      component.pillars = newOrder.map((id, _index) => ({ id, name: `Pillar ${id}` }));

      await component.savePillarOrder();

      expect(mockDataService.savePillarOrder).toHaveBeenCalledWith(newOrder);
      expect(mockDataService.getPillars).toHaveBeenCalled();
    });

    it('should handle function capability reorder', async () => {
      const newOrder = [2, 1];
      component.functionCapabilities = newOrder.map((id, _index) => ({
        id,
        name: `Function ${id}`,
        type: 'Function' as const,
        pillar_id: 1
      }));

      await component.saveFunctionOrder();

      expect(mockDataService.saveFunctionOrder).toHaveBeenCalledWith(newOrder);
      expect(mockDataService.getFunctionCapabilities).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle errors during data loading', async () => {
      mockDataService.getPillars.and.returnValue(Promise.reject(new Error('Database error')));
      spyOn(console, 'error');

      await component.loadAll();

      expect(console.error).toHaveBeenCalled();
    });

    it('should handle errors during pillar addition', async () => {
      mockDataService.addPillar.and.returnValue(Promise.reject(new Error('Add error')));
      spyOn(console, 'error');
      component.newPillar = 'Test Pillar';

      await component.addPillar();

      expect(console.error).toHaveBeenCalled();
      expect(component.newPillar).toBe('Test Pillar'); // Should not clear on error
    });
  });

  describe('Form Validation', () => {
    it('should validate pillar name is not empty', async () => {
      component.newPillar = '   '; // Whitespace

      await component.addPillar();

      expect(mockDataService.addPillar).not.toHaveBeenCalled();
    });

    it('should validate function capability requirements', async () => {
      // No pillar selected
      component.selectedPillarId = null;
      component.newFunctionCapability = 'Test';

      await component.addFunctionCapability();

      expect(mockDataService.addFunctionCapability).not.toHaveBeenCalled();

      // No function name
      component.selectedPillarId = 1;
      component.newFunctionCapability = '';

      await component.addFunctionCapability();

      expect(mockDataService.addFunctionCapability).not.toHaveBeenCalled();
    });

    it('should validate technology process requirements', async () => {
      // Missing selections
      component.selectedFunctionCapabilityId = null;
      component.selectedMaturityStageId = null;
      component.newTechnologyProcessName = 'Test';

      await component.addTechnologyProcess();

      expect(mockDataService.addTechnologyProcess).not.toHaveBeenCalled();
    });
  });

  describe('Technologies/Processes Filtering', () => {
    beforeEach(() => {
      component.pillars = mockPillars;
      component.functionCapabilities = mockFunctionCapabilities;
      component.maturityStages = mockMaturityStages;
    });

    describe('filteredFunctionCapabilities getter', () => {
      it('should return all function capabilities when no pillar filter is selected', () => {
        component.selectedTechPillarId = null;

        const result = component.filteredFunctionCapabilities;

        expect(result).toEqual(mockFunctionCapabilities);
        expect(result.length).toBe(2);
      });

      it('should return filtered function capabilities for a specific pillar', () => {
        component.selectedTechPillarId = 1; // Identity pillar

        const result = component.filteredFunctionCapabilities;

        expect(result.length).toBe(1);
        expect(result[0].name).toBe('User Identity Management');
        expect(result[0].pillar_id).toBe(1);
      });

      it('should return empty array when pillar has no function capabilities', () => {
        // Add a pillar with no function capabilities
        const emptyPillar = { id: 3, name: 'Empty Pillar' };
        component.pillars = [...mockPillars, emptyPillar];
        component.selectedTechPillarId = 3;

        const result = component.filteredFunctionCapabilities;

        expect(result.length).toBe(0);
      });

      it('should update when pillar filter changes', () => {
        // Start with Identity pillar
        component.selectedTechPillarId = 1;
        expect(component.filteredFunctionCapabilities.length).toBe(1);

        // Change to Device pillar
        component.selectedTechPillarId = 2;
        expect(component.filteredFunctionCapabilities.length).toBe(1);
        expect(component.filteredFunctionCapabilities[0].name).toBe('Device Registration');

        // Clear filter
        component.selectedTechPillarId = null;
        expect(component.filteredFunctionCapabilities.length).toBe(2);
      });
    });

    describe('onTechPillarChange method', () => {
      it('should reset function capability selection when it does not match new filter', async () => {
        // Set up initial state
        component.selectedFunctionCapabilityId = 1; // User Identity Management (pillar 1)
        component.selectedTechPillarId = 2; // Change to Device pillar

        spyOn(component, 'loadTechnologiesProcesses').and.returnValue(Promise.resolve());

        component.onTechPillarChange();

        expect(component.selectedFunctionCapabilityId).toBeNull();
        expect(component.loadTechnologiesProcesses).toHaveBeenCalled();
      });

      it('should keep function capability selection when it matches new filter', () => {
        // Set up initial state
        component.selectedFunctionCapabilityId = 1; // User Identity Management (pillar 1)
        component.selectedTechPillarId = 1; // Same pillar

        spyOn(component, 'loadTechnologiesProcesses').and.returnValue(Promise.resolve());

        component.onTechPillarChange();

        expect(component.selectedFunctionCapabilityId).toBe(1);
        expect(component.loadTechnologiesProcesses).not.toHaveBeenCalled();
      });

      it('should not reset function capability when no pillar filter is applied', () => {
        // Set up initial state
        component.selectedFunctionCapabilityId = 1;
        component.selectedTechPillarId = null; // No filter

        spyOn(component, 'loadTechnologiesProcesses').and.returnValue(Promise.resolve());

        component.onTechPillarChange();

        expect(component.selectedFunctionCapabilityId).toBe(1);
        expect(component.loadTechnologiesProcesses).not.toHaveBeenCalled();
      });

      it('should handle case when no function capability is selected', () => {
        component.selectedFunctionCapabilityId = null;
        component.selectedTechPillarId = 1;

        spyOn(component, 'loadTechnologiesProcesses').and.returnValue(Promise.resolve());

        expect(() => component.onTechPillarChange()).not.toThrow();
        expect(component.loadTechnologiesProcesses).not.toHaveBeenCalled();
      });
    });

    describe('Integration Tests', () => {
      it('should properly filter function capabilities in form dropdown', () => {
        // Start with all function capabilities available
        component.selectedTechPillarId = null;
        expect(component.filteredFunctionCapabilities.length).toBe(2);

        // Filter by Identity pillar
        component.selectedTechPillarId = 1;
        expect(component.filteredFunctionCapabilities.length).toBe(1);
        expect(component.filteredFunctionCapabilities[0].name).toBe('User Identity Management');

        // Filter by Device pillar
        component.selectedTechPillarId = 2;
        expect(component.filteredFunctionCapabilities.length).toBe(1);
        expect(component.filteredFunctionCapabilities[0].name).toBe('Device Registration');
      });

      it('should maintain filtering state across operations', async () => {
        // Set up filtered state
        component.selectedTechPillarId = 1;
        component.selectedFunctionCapabilityId = 1;

        // Add a new technology process
        component.newTechnologyProcessName = 'Test Technology';
        component.newTechnologyProcessDescription = 'Test Technology Description';
        component.selectedMaturityStageId = 1;
        await component.addTechnologyProcess();

        // Filter state should be maintained
        expect(component.selectedTechPillarId).toBe(1);
        expect(component.selectedFunctionCapabilityId).toBe(1);
        expect(component.filteredFunctionCapabilities.length).toBe(1);
      });

      it('should handle edge case with empty data arrays', () => {
        // Clear all data
        component.functionCapabilities = [];
        component.selectedTechPillarId = 1;

        const result = component.filteredFunctionCapabilities;
        expect(result).toEqual([]);
        expect(result.length).toBe(0);
      });
    });

    describe('Demo Data Generation', () => {
      it('should generate demo data successfully', async () => {
        spyOn(window, 'alert'); // Suppress alert messages
        spyOn(window, 'confirm').and.returnValue(true); // Mock confirmation dialog

        // Set up component state to trigger confirmation dialog
        component.demoDataExists = true;

        await component.onGenerateDemoData();

        expect(mockDemoDataService.generateCompleteDemoData).toHaveBeenCalledWith(true);
        expect(component.isGeneratingDemo).toBe(false);
        expect(window.alert).toHaveBeenCalledWith(jasmine.stringContaining('Demo data has been successfully generated'));
      });

      it('should not generate demo data if already exists', async () => {
        spyOn(window, 'confirm').and.returnValue(false); // Mock user cancellation
        component.demoDataExists = true;

        await component.onGenerateDemoData();

        expect(mockDemoDataService.generateCompleteDemoData).not.toHaveBeenCalled();
      });

      it('should generate demo data if user confirms when data already exists', async () => {
        spyOn(window, 'alert'); // Suppress alert messages
        component.demoDataExists = true;
        spyOn(window, 'confirm').and.returnValue(true); // User confirms the generation

        await component.onGenerateDemoData();

        expect(mockDemoDataService.generateCompleteDemoData).toHaveBeenCalledWith(true);
        expect(component.isGeneratingDemo).toBe(false);
        expect(window.alert).toHaveBeenCalledWith(jasmine.stringContaining('Demo data has been successfully generated'));
      });

      it('should handle demo data generation errors', async () => {
        spyOn(window, 'alert'); // Suppress alert messages
        spyOn(window, 'confirm').and.returnValue(true); // Mock confirmation dialog
        spyOn(console, 'error'); // Suppress error messages
        mockDemoDataService.generateCompleteDemoData.and.returnValue(Promise.reject(new Error('Generation failed')));

        // Set up component state to trigger confirmation dialog
        component.demoDataExists = true;

        await component.onGenerateDemoData();

        expect(console.error).toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith(jasmine.stringContaining('Failed to generate demo data'));
        expect(component.isGeneratingDemo).toBe(false);
      });

      it('should load demo data info on initialization', async () => {
        await component.loadDemoDataInfo();

        expect(mockDemoDataService.isDemoDataAlreadyGenerated).toHaveBeenCalled();
        expect(mockDemoDataService.getDemoDataStatistics).toHaveBeenCalled();
        expect(component.demoDataExists).toBe(false);
        expect(component.demoDataStats).toBeDefined();
      });
    });
  });
});
