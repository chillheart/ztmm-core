import { TestBed } from '@angular/core/testing';
import { ZtmmDataWebService } from './ztmm-data-web.service';
import { SqlJsService } from './sqljs.service';
import { Pillar, FunctionCapability, MaturityStage, TechnologyProcess, AssessmentResponse, AssessmentStatus } from '../models/ztmm.models';
import { TestUtils } from '../testing/test-utils';

describe('ZtmmDataWebService', () => {
  let service: ZtmmDataWebService;
  let mockSqlJsService: any;

  // Mock data for testing
  const mockPillar: Pillar = { id: 1, name: 'Test Pillar' };
  const mockFunctionCapability: FunctionCapability = {
    id: 1,
    name: 'Test Function',
    type: 'Function',
    pillar_id: 1
  };
  const mockMaturityStage: MaturityStage = {
    id: 1,
    name: 'Initial'
  };
  const mockTechnologyProcess: TechnologyProcess = {
    id: 1,
    description: 'Test Technology',
    type: 'Technology',
    function_capability_id: 1,
    maturity_stage_id: 1
  };
  const mockAssessmentResponse: AssessmentResponse = {
    id: 1,
    tech_process_id: 1,
    status: 'Fully Implemented' as AssessmentStatus,
    notes: 'Test notes'
  };

  beforeEach(() => {
    // Use the mock SqljsService to avoid WebAssembly initialization issues
    const sqlJsServiceMock = TestUtils.createMockSqlJsService();

    TestBed.configureTestingModule({
      providers: [
        ZtmmDataWebService,
        { provide: SqlJsService, useValue: sqlJsServiceMock }
      ]
    });

    service = TestBed.inject(ZtmmDataWebService);
    mockSqlJsService = TestBed.inject(SqlJsService) as any;

    // Setup default spy returns
    mockSqlJsService.initialize.and.returnValue(Promise.resolve());
    mockSqlJsService.getPillars.and.returnValue(Promise.resolve([mockPillar]));
    mockSqlJsService.addPillar.and.returnValue(Promise.resolve());
    mockSqlJsService.removePillar.and.returnValue(Promise.resolve());
    mockSqlJsService.editPillar.and.returnValue(Promise.resolve());
    mockSqlJsService.savePillarOrder.and.returnValue(Promise.resolve());
    mockSqlJsService.getFunctionCapabilities.and.returnValue(Promise.resolve([mockFunctionCapability]));
    mockSqlJsService.addFunctionCapability.and.returnValue(Promise.resolve());
    mockSqlJsService.removeFunctionCapability.and.returnValue(Promise.resolve());
    mockSqlJsService.editFunctionCapability.and.returnValue(Promise.resolve());
    mockSqlJsService.saveFunctionOrder.and.returnValue(Promise.resolve());
    mockSqlJsService.getMaturityStages.and.returnValue(Promise.resolve([mockMaturityStage]));
    mockSqlJsService.getTechnologiesProcesses.and.returnValue(Promise.resolve([mockTechnologyProcess]));
    mockSqlJsService.addTechnologyProcess.and.returnValue(Promise.resolve());
    mockSqlJsService.removeTechnologyProcess.and.returnValue(Promise.resolve());
    mockSqlJsService.editTechnologyProcess.and.returnValue(Promise.resolve());
    mockSqlJsService.saveAssessment.and.returnValue(Promise.resolve());
    mockSqlJsService.getAssessmentResponses.and.returnValue(Promise.resolve([mockAssessmentResponse]));
    mockSqlJsService.exportDatabase.and.returnValue(Promise.resolve(new Uint8Array([1, 2, 3, 4])));
    mockSqlJsService.importDatabase.and.returnValue(Promise.resolve());
    mockSqlJsService.createBackup.and.returnValue(Promise.resolve());
    mockSqlJsService.getBackups.and.returnValue(Promise.resolve([
      { name: 'backup1', timestamp: 1640995200000 }
    ]));
    mockSqlJsService.restoreBackup.and.returnValue(Promise.resolve());
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Pillar Operations', () => {
    it('should get pillars and ensure database is initialized', async () => {
      const result = await service.getPillars();

      expect(mockSqlJsService.initialize).toHaveBeenCalled();
      expect(mockSqlJsService.getPillars).toHaveBeenCalled();
      expect(result).toEqual([mockPillar]);
    });

    it('should add a pillar with proper initialization', async () => {
      await service.addPillar('New Pillar');

      expect(mockSqlJsService.initialize).toHaveBeenCalled();
      expect(mockSqlJsService.addPillar).toHaveBeenCalledWith('New Pillar');
    });

    it('should remove a pillar by id', async () => {
      await service.removePillar(1);

      expect(mockSqlJsService.initialize).toHaveBeenCalled();
      expect(mockSqlJsService.removePillar).toHaveBeenCalledWith(1);
    });

    it('should edit a pillar', async () => {
      await service.editPillar(1, 'Updated Pillar');

      expect(mockSqlJsService.initialize).toHaveBeenCalled();
      expect(mockSqlJsService.editPillar).toHaveBeenCalledWith(1, 'Updated Pillar');
    });

    it('should save pillar order', async () => {
      const order = [3, 1, 2];
      await service.savePillarOrder(order);

      expect(mockSqlJsService.initialize).toHaveBeenCalled();
      expect(mockSqlJsService.savePillarOrder).toHaveBeenCalledWith(order);
    });

    it('should handle pillar operation errors gracefully', async () => {
      const error = new Error('Database error');
      mockSqlJsService.getPillars.and.returnValue(Promise.reject(error));

      await expectAsync(service.getPillars()).toBeRejectedWith(error);
    });
  });

  describe('Function Capability Operations', () => {
    it('should get function capabilities', async () => {
      const result = await service.getFunctionCapabilities();

      expect(mockSqlJsService.initialize).toHaveBeenCalled();
      expect(mockSqlJsService.getFunctionCapabilities).toHaveBeenCalled();
      expect(result).toEqual([mockFunctionCapability]);
    });

    it('should add a function capability', async () => {
      await service.addFunctionCapability('New Function', 'Function', 1);

      expect(mockSqlJsService.initialize).toHaveBeenCalled();
      expect(mockSqlJsService.addFunctionCapability).toHaveBeenCalledWith('New Function', 'Function', 1);
    });

    it('should remove a function capability', async () => {
      await service.removeFunctionCapability(1);

      expect(mockSqlJsService.initialize).toHaveBeenCalled();
      expect(mockSqlJsService.removeFunctionCapability).toHaveBeenCalledWith(1);
    });

    it('should edit a function capability', async () => {
      await service.editFunctionCapability(1, 'Updated Function', 'Capability', 2);

      expect(mockSqlJsService.initialize).toHaveBeenCalled();
      expect(mockSqlJsService.editFunctionCapability).toHaveBeenCalledWith(1, 'Updated Function', 'Capability', 2);
    });

    it('should save function order', async () => {
      const order = [2, 1, 3];
      await service.saveFunctionOrder(order);

      expect(mockSqlJsService.initialize).toHaveBeenCalled();
      expect(mockSqlJsService.saveFunctionOrder).toHaveBeenCalledWith(order);
    });
  });

  describe('Maturity Stage Operations', () => {
    it('should get maturity stages', async () => {
      const result = await service.getMaturityStages();

      expect(mockSqlJsService.initialize).toHaveBeenCalled();
      expect(mockSqlJsService.getMaturityStages).toHaveBeenCalled();
      expect(result).toEqual([mockMaturityStage]);
    });
  });

  describe('Technology Process Operations', () => {
    it('should get technologies processes', async () => {
      const result = await service.getTechnologiesProcesses();

      expect(mockSqlJsService.initialize).toHaveBeenCalled();
      expect(mockSqlJsService.getTechnologiesProcesses).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([mockTechnologyProcess]);
    });

    it('should get technologies processes for specific function capability', async () => {
      await service.getTechnologiesProcesses(1);

      expect(mockSqlJsService.initialize).toHaveBeenCalled();
      expect(mockSqlJsService.getTechnologiesProcesses).toHaveBeenCalledWith(1);
    });

    it('should add a technology process', async () => {
      await service.addTechnologyProcess('New Tech', 'Technology', 1, 1);

      expect(mockSqlJsService.initialize).toHaveBeenCalled();
      expect(mockSqlJsService.addTechnologyProcess).toHaveBeenCalledWith('New Tech', 'Technology', 1, 1);
    });

    it('should remove a technology process', async () => {
      await service.removeTechnologyProcess(1);

      expect(mockSqlJsService.initialize).toHaveBeenCalled();
      expect(mockSqlJsService.removeTechnologyProcess).toHaveBeenCalledWith(1);
    });

    it('should edit a technology process', async () => {
      await service.editTechnologyProcess(1, 'Updated Tech', 'Process', 2, 2);

      expect(mockSqlJsService.initialize).toHaveBeenCalled();
      expect(mockSqlJsService.editTechnologyProcess).toHaveBeenCalledWith(1, 'Updated Tech', 'Process', 2, 2);
    });
  });

  describe('Assessment Operations', () => {
    it('should save an assessment', async () => {
      await service.saveAssessment(1, 'Fully Implemented', 'Test notes');

      expect(mockSqlJsService.initialize).toHaveBeenCalled();
      expect(mockSqlJsService.saveAssessment).toHaveBeenCalledWith(1, 'Fully Implemented', 'Test notes');
    });

    it('should save an assessment without notes', async () => {
      await service.saveAssessment(1, 'Not Implemented');

      expect(mockSqlJsService.initialize).toHaveBeenCalled();
      expect(mockSqlJsService.saveAssessment).toHaveBeenCalledWith(1, 'Not Implemented', undefined);
    });

    it('should get assessment responses', async () => {
      const result = await service.getAssessmentResponses();

      expect(mockSqlJsService.initialize).toHaveBeenCalled();
      expect(mockSqlJsService.getAssessmentResponses).toHaveBeenCalled();
      expect(result).toEqual([mockAssessmentResponse]);
    });
  });

  describe('Data Export/Import Operations', () => {
    it('should export data with timestamp filename', async () => {
      const result = await service.exportData();

      expect(mockSqlJsService.initialize).toHaveBeenCalled();
      expect(mockSqlJsService.exportDatabase).toHaveBeenCalled();
      expect(result.data).toEqual(new Uint8Array([1, 2, 3, 4]));
      expect(result.filename).toMatch(/^ztmm-assessment-backup-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.db$/);
    });

    it('should import data from file', async () => {
      const mockFile = new File([new Uint8Array([1, 2, 3, 4])], 'test.db', { type: 'application/octet-stream' });

      await service.importData(mockFile);

      expect(mockSqlJsService.initialize).toHaveBeenCalled();
      expect(mockSqlJsService.importDatabase).toHaveBeenCalledWith(new Uint8Array([1, 2, 3, 4]));
    });

    it('should handle file read errors during import', async () => {
      const mockFile = {
        ...new File([''], 'test.db'),
        // Mock FileReader that fails
      } as File;

      // Create a spy on FileReader to simulate error
      spyOn(window, 'FileReader').and.returnValue({
        readAsArrayBuffer: function() {
          setTimeout(() => this.onerror({ target: { error: new Error('Read failed') } }), 0);
        },
        onload: null,
        onerror: null
      } as any);

      await expectAsync(service.importData(mockFile)).toBeRejected();
    });
  });

  describe('Backup Operations', () => {
    it('should create a backup', async () => {
      await service.createBackup();

      expect(mockSqlJsService.initialize).toHaveBeenCalled();
      expect(mockSqlJsService.createBackup).toHaveBeenCalled();
    });

    it('should get backups with formatted dates', async () => {
      const result = await service.getBackups();

      expect(mockSqlJsService.initialize).toHaveBeenCalled();
      expect(mockSqlJsService.getBackups).toHaveBeenCalled();
      expect(result).toEqual([{
        name: 'backup1',
        timestamp: 1640995200000,
        date: new Date(1640995200000).toLocaleString()
      }]);
    });

    it('should restore a backup', async () => {
      await service.restoreBackup('backup1');

      expect(mockSqlJsService.initialize).toHaveBeenCalled();
      expect(mockSqlJsService.restoreBackup).toHaveBeenCalledWith('backup1');
    });
  });

  describe('Migration Operations', () => {
    it('should migrate from electron data successfully', async () => {
      const electronData = {
        pillars: [{ name: 'Electron Pillar' }],
        functionCapabilities: [{ name: 'Electron Function', type: 'Function', pillar_id: 1 }],
        technologiesProcesses: [{ description: 'Electron Tech', type: 'Technology', function_capability_id: 1, maturity_stage_id: 1 }],
        assessmentResponses: [{ tech_process_id: 1, status: 'Fully Implemented', notes: 'Electron notes' }]
      };

      await service.migrateFromElectronData(electronData);

      expect(mockSqlJsService.addPillar).toHaveBeenCalledWith('Electron Pillar');
      expect(mockSqlJsService.addFunctionCapability).toHaveBeenCalledWith('Electron Function', 'Function', 1);
      expect(mockSqlJsService.addTechnologyProcess).toHaveBeenCalledWith('Electron Tech', 'Technology', 1, 1);
      expect(mockSqlJsService.saveAssessment).toHaveBeenCalledWith(1, 'Fully Implemented', 'Electron notes');
    });

    it('should handle partial electron data migration', async () => {
      const partialElectronData = {
        pillars: [{ name: 'Partial Pillar' }]
        // Missing other arrays
      };

      await service.migrateFromElectronData(partialElectronData);

      expect(mockSqlJsService.addPillar).toHaveBeenCalledWith('Partial Pillar');
      // Other methods should not be called due to missing data
      expect(mockSqlJsService.addFunctionCapability).not.toHaveBeenCalled();
    });

    it('should handle migration errors', async () => {
      const electronData = {
        pillars: [{ name: 'Error Pillar' }]
      };
      mockSqlJsService.addPillar.and.returnValue(Promise.reject(new Error('Migration failed')));

      await expectAsync(service.migrateFromElectronData(electronData))
        .toBeRejectedWithError('Failed to migrate data from Electron format');
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors with user-friendly messages', async () => {
      const validationError = new Error('validation: Invalid pillar name');
      mockSqlJsService.addPillar.and.returnValue(Promise.reject(validationError));

      await expectAsync(service.addPillar('Invalid'))
        .toBeRejectedWithError('Invalid input: validation: Invalid pillar name');
    });

    it('should propagate non-validation errors unchanged', async () => {
      const networkError = new Error('Network connection failed');
      mockSqlJsService.getPillars.and.returnValue(Promise.reject(networkError));

      await expectAsync(service.getPillars()).toBeRejectedWith(networkError);
    });

    it('should handle initialization failures', async () => {
      const initError = new Error('Database initialization failed');
      mockSqlJsService.initialize.and.returnValue(Promise.reject(initError));

      await expectAsync(service.getPillars()).toBeRejectedWith(initError);
    });
  });

  describe('API Call Logging', () => {
    beforeEach(() => {
      spyOn(console, 'log');
      spyOn(console, 'error');
    });

    it('should log successful operations', async () => {
      await service.getPillars();

      expect(console.log).toHaveBeenCalledWith("API operation 'getPillars' completed successfully");
    });

    it('should log failed operations', async () => {
      const error = new Error('Operation failed');
      mockSqlJsService.getPillars.and.returnValue(Promise.reject(error));

      await expectAsync(service.getPillars()).toBeRejected();
      expect(console.error).toHaveBeenCalledWith("API operation 'getPillars' failed:", error);
    });
  });
});
