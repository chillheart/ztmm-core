import { TestBed } from '@angular/core/testing';
import { ZtmmDataWebService } from './ztmm-data-web-indexeddb.service';
import { IndexedDBService } from './indexeddb.service';
import { TestUtilsIndexedDB } from '../testing/test-utils-indexeddb';

describe('ZtmmDataWebService (IndexedDB)', () => {
  let service: ZtmmDataWebService;
  let mockIndexedDBService: jasmine.SpyObj<IndexedDBService>;

  const mockPillar = { id: 1, name: 'Test Pillar' };
  const mockFunctionCapability = { id: 1, name: 'Test Function', type: 'Function' as const, pillar_id: 1 };
  const mockMaturityStage = { id: 1, name: 'Traditional' as const };
  const mockTechnologyProcess = { id: 1, name: 'Test Technology', description: 'Test Technology', type: 'Technology' as const, function_capability_id: 1, maturity_stage_id: 1 };
  const mockAssessmentResponse = { id: 1, tech_process_id: 1, status: 'Fully Implemented' as const, notes: 'Test notes' };

  beforeEach(() => {
    // Use the mock IndexedDB service to avoid database initialization issues
    const mockIndexedDB = TestUtilsIndexedDB.createMockIndexedDBService();

    TestBed.configureTestingModule({
      providers: [
        ZtmmDataWebService,
        { provide: IndexedDBService, useValue: mockIndexedDB }
      ]
    });

    service = TestBed.inject(ZtmmDataWebService);
    mockIndexedDBService = TestBed.inject(IndexedDBService) as jasmine.SpyObj<IndexedDBService>;

    // Setup default spy returns
    mockIndexedDBService.initialize.and.returnValue(Promise.resolve());
    mockIndexedDBService.getPillars.and.returnValue(Promise.resolve([mockPillar]));
    mockIndexedDBService.addPillar.and.returnValue(Promise.resolve());
    mockIndexedDBService.removePillar.and.returnValue(Promise.resolve());
    mockIndexedDBService.editPillar.and.returnValue(Promise.resolve());
    mockIndexedDBService.savePillarOrder.and.returnValue(Promise.resolve());
    mockIndexedDBService.getFunctionCapabilities.and.returnValue(Promise.resolve([mockFunctionCapability]));
    mockIndexedDBService.addFunctionCapability.and.returnValue(Promise.resolve());
    mockIndexedDBService.removeFunctionCapability.and.returnValue(Promise.resolve());
    mockIndexedDBService.editFunctionCapability.and.returnValue(Promise.resolve());
    mockIndexedDBService.saveFunctionOrder.and.returnValue(Promise.resolve());
    mockIndexedDBService.getMaturityStages.and.returnValue(Promise.resolve([mockMaturityStage]));
    mockIndexedDBService.getTechnologiesProcesses.and.returnValue(Promise.resolve([mockTechnologyProcess]));
    mockIndexedDBService.getAllTechnologiesProcesses.and.returnValue(Promise.resolve([mockTechnologyProcess]));
    mockIndexedDBService.getTechnologiesProcessesByFunction.and.returnValue(Promise.resolve([mockTechnologyProcess]));
    mockIndexedDBService.addTechnologyProcess.and.returnValue(Promise.resolve());
    mockIndexedDBService.removeTechnologyProcess.and.returnValue(Promise.resolve());
    mockIndexedDBService.editTechnologyProcess.and.returnValue(Promise.resolve());
    mockIndexedDBService.saveAssessment.and.returnValue(Promise.resolve());
    mockIndexedDBService.getAssessmentResponses.and.returnValue(Promise.resolve([mockAssessmentResponse]));
    mockIndexedDBService.exportDatabase.and.returnValue(Promise.resolve(new Uint8Array([1, 2, 3, 4])));
    mockIndexedDBService.importDatabase.and.returnValue(Promise.resolve());
    mockIndexedDBService.createBackup.and.returnValue(Promise.resolve());
    mockIndexedDBService.getBackups.and.returnValue(Promise.resolve([
      { name: 'backup1', timestamp: 1640995200000 }
    ]));
    mockIndexedDBService.restoreBackup.and.returnValue(Promise.resolve());
    mockIndexedDBService.clearAllData.and.returnValue(Promise.resolve());
    mockIndexedDBService.resetDatabase.and.returnValue(Promise.resolve());
    mockIndexedDBService.importDataWithPreservedIds.and.returnValue(Promise.resolve());
    mockIndexedDBService.isReady.and.returnValue(true);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Pillar Operations', () => {
    it('should get pillars and ensure database is initialized', async () => {
      const result = await service.getPillars();

      expect(mockIndexedDBService.initialize).toHaveBeenCalled();
      expect(mockIndexedDBService.getPillars).toHaveBeenCalled();
      expect(result).toEqual([mockPillar]);
    });

    it('should add a pillar with proper initialization', async () => {
      await service.addPillar('New Pillar');

      expect(mockIndexedDBService.initialize).toHaveBeenCalled();
      expect(mockIndexedDBService.addPillar).toHaveBeenCalledWith('New Pillar');
    });

    it('should remove a pillar', async () => {
      await service.removePillar(1);

      expect(mockIndexedDBService.initialize).toHaveBeenCalled();
      expect(mockIndexedDBService.removePillar).toHaveBeenCalledWith(1);
    });

    it('should edit a pillar', async () => {
      await service.editPillar(1, 'Updated Pillar');

      expect(mockIndexedDBService.initialize).toHaveBeenCalled();
      expect(mockIndexedDBService.editPillar).toHaveBeenCalledWith(1, 'Updated Pillar');
    });

    it('should save pillar order', async () => {
      const order = [3, 1, 2];
      await service.savePillarOrder(order);

      expect(mockIndexedDBService.initialize).toHaveBeenCalled();
      expect(mockIndexedDBService.savePillarOrder).toHaveBeenCalledWith(order);
    });
  });

  describe('Function Capability Operations', () => {
    it('should get function capabilities', async () => {
      const result = await service.getFunctionCapabilities();

      expect(mockIndexedDBService.initialize).toHaveBeenCalled();
      expect(mockIndexedDBService.getFunctionCapabilities).toHaveBeenCalled();
      expect(result).toEqual([mockFunctionCapability]);
    });

    it('should add a function capability', async () => {
      await service.addFunctionCapability('New Function', 'Function', 1);

      expect(mockIndexedDBService.initialize).toHaveBeenCalled();
      expect(mockIndexedDBService.addFunctionCapability).toHaveBeenCalledWith('New Function', 'Function', 1);
    });

    it('should remove a function capability', async () => {
      await service.removeFunctionCapability(1);

      expect(mockIndexedDBService.initialize).toHaveBeenCalled();
      expect(mockIndexedDBService.removeFunctionCapability).toHaveBeenCalledWith(1);
    });

    it('should edit a function capability', async () => {
      await service.editFunctionCapability(1, 'Updated Function', 'Capability', 2);

      expect(mockIndexedDBService.initialize).toHaveBeenCalled();
      expect(mockIndexedDBService.editFunctionCapability).toHaveBeenCalledWith(1, 'Updated Function', 'Capability', 2);
    });

    it('should save function order', async () => {
      const order = [3, 1, 2];
      await service.saveFunctionOrder(order);

      expect(mockIndexedDBService.initialize).toHaveBeenCalled();
      expect(mockIndexedDBService.saveFunctionOrder).toHaveBeenCalledWith(order);
    });
  });

  describe('Maturity Stage Operations', () => {
    it('should get maturity stages', async () => {
      const result = await service.getMaturityStages();

      expect(mockIndexedDBService.initialize).toHaveBeenCalled();
      expect(mockIndexedDBService.getMaturityStages).toHaveBeenCalled();
      expect(result).toEqual([mockMaturityStage]);
    });
  });

  describe('Technology Process Operations', () => {
    it('should get technology processes', async () => {
      const result = await service.getTechnologiesProcesses();

      expect(mockIndexedDBService.initialize).toHaveBeenCalled();
      expect(mockIndexedDBService.getTechnologiesProcesses).toHaveBeenCalled();
      expect(result).toEqual([mockTechnologyProcess]);
    });

    it('should get technology processes with function capability filter', async () => {
      const result = await service.getTechnologiesProcesses(1);

      expect(mockIndexedDBService.initialize).toHaveBeenCalled();
      expect(mockIndexedDBService.getTechnologiesProcesses).toHaveBeenCalledWith(1);
      expect(result).toEqual([mockTechnologyProcess]);
    });

    it('should get all technology processes', async () => {
      const result = await service.getAllTechnologiesProcesses();

      expect(mockIndexedDBService.initialize).toHaveBeenCalled();
      expect(mockIndexedDBService.getAllTechnologiesProcesses).toHaveBeenCalled();
      expect(result).toEqual([mockTechnologyProcess]);
    });

    it('should get technology processes by function', async () => {
      const result = await service.getTechnologiesProcessesByFunction(1);

      expect(mockIndexedDBService.initialize).toHaveBeenCalled();
      expect(mockIndexedDBService.getTechnologiesProcessesByFunction).toHaveBeenCalledWith(1);
      expect(result).toEqual([mockTechnologyProcess]);
    });

    it('should add a technology process', async () => {
      await service.addTechnologyProcess('New Tech', 'New Tech Description', 'Technology', 1, 1);

      expect(mockIndexedDBService.initialize).toHaveBeenCalled();
      expect(mockIndexedDBService.addTechnologyProcess).toHaveBeenCalledWith('New Tech', 'New Tech Description', 'Technology', 1, 1);
    });

    it('should remove a technology process', async () => {
      await service.removeTechnologyProcess(1);

      expect(mockIndexedDBService.initialize).toHaveBeenCalled();
      expect(mockIndexedDBService.removeTechnologyProcess).toHaveBeenCalledWith(1);
    });

    it('should edit a technology process', async () => {
      await service.editTechnologyProcess(1, 'Updated Tech', 'Updated Tech Description', 'Process', 2, 2);

      expect(mockIndexedDBService.initialize).toHaveBeenCalled();
      expect(mockIndexedDBService.editTechnologyProcess).toHaveBeenCalledWith(1, 'Updated Tech', 'Updated Tech Description', 'Process', 2, 2);
    });
  });

  describe('Assessment Operations', () => {
    it('should save an assessment', async () => {
      await service.saveAssessment(1, 'Partially Implemented', 'Test notes');

      expect(mockIndexedDBService.initialize).toHaveBeenCalled();
      expect(mockIndexedDBService.saveAssessment).toHaveBeenCalledWith(1, 'Partially Implemented', 'Test notes');
    });

    it('should get assessment responses', async () => {
      const result = await service.getAssessmentResponses();

      expect(mockIndexedDBService.initialize).toHaveBeenCalled();
      expect(mockIndexedDBService.getAssessmentResponses).toHaveBeenCalled();
      expect(result).toEqual([mockAssessmentResponse]);
    });
  });

  describe('Data Export/Import Operations', () => {
    it('should export data with timestamp filename', async () => {
      const result = await service.exportData();

      expect(mockIndexedDBService.initialize).toHaveBeenCalled();
      expect(mockIndexedDBService.exportDatabase).toHaveBeenCalled();
      expect(result.data).toEqual(new Uint8Array([1, 2, 3, 4]));
      expect(result.filename).toMatch(/^ztmm-assessment-backup-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.json$/);
    });

    it('should import data from file', async () => {
      const mockFile = new File([new Uint8Array([1, 2, 3, 4])], 'test.json', { type: 'application/json' });

      await service.importData(mockFile);

      expect(mockIndexedDBService.initialize).toHaveBeenCalled();
      expect(mockIndexedDBService.importDatabase).toHaveBeenCalledWith(new Uint8Array([1, 2, 3, 4]));
    });

    it('should handle file read errors during import', async () => {
      const mockFile = {
        ...new File([''], 'test.json'),
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

    it('should import data with preserved IDs', async () => {
      const testData = { pillars: [mockPillar] };
      await service.importDataWithPreservedIds(testData);

      expect(mockIndexedDBService.initialize).toHaveBeenCalled();
      expect(mockIndexedDBService.importDataWithPreservedIds).toHaveBeenCalledWith(testData);
    });
  });

  describe('Backup Operations', () => {
    it('should create a backup', async () => {
      await service.createBackup();

      expect(mockIndexedDBService.initialize).toHaveBeenCalled();
      expect(mockIndexedDBService.createBackup).toHaveBeenCalled();
    });

    it('should get backups', async () => {
      const result = await service.getBackups();

      expect(mockIndexedDBService.initialize).toHaveBeenCalled();
      expect(mockIndexedDBService.getBackups).toHaveBeenCalled();
      expect(result).toEqual([{ name: 'backup1', timestamp: 1640995200000 }]);
    });

    it('should restore a backup', async () => {
      await service.restoreBackup('backup1');

      expect(mockIndexedDBService.initialize).toHaveBeenCalled();
      expect(mockIndexedDBService.restoreBackup).toHaveBeenCalledWith('backup1');
    });
  });

  describe('Database Management Operations', () => {
    it('should clear all data', async () => {
      await service.clearAllData();

      expect(mockIndexedDBService.initialize).toHaveBeenCalled();
      expect(mockIndexedDBService.clearAllData).toHaveBeenCalled();
    });

    it('should reset database', async () => {
      await service.resetDatabase();

      expect(mockIndexedDBService.initialize).toHaveBeenCalled();
      expect(mockIndexedDBService.resetDatabase).toHaveBeenCalled();
    });

    it('should check if database is ready', () => {
      const result = service.isDatabaseReady();

      expect(mockIndexedDBService.isReady).toHaveBeenCalled();
      expect(result).toBeTrue();
    });
  });

  describe('Migration Operations', () => {
    it('should migrate from Electron data format', async () => {
      const electronData = {
        pillars: [{ name: 'Electron Pillar' }],
        functionCapabilities: [{ name: 'Electron Function', type: 'Function', pillar_id: 1 }],
        technologiesProcesses: [{ description: 'Electron Tech', type: 'Technology', function_capability_id: 1, maturity_stage_id: 1 }],
        assessmentResponses: [{ tech_process_id: 1, status: 'Fully Implemented', notes: 'Electron assessment' }]
      };

      await service.migrateFromElectronData(electronData);

      expect(mockIndexedDBService.addPillar).toHaveBeenCalledWith('Electron Pillar');
      expect(mockIndexedDBService.addFunctionCapability).toHaveBeenCalledWith('Electron Function', 'Function', 1);
      expect(mockIndexedDBService.addTechnologyProcess).toHaveBeenCalledWith('Electron Tech', 'Electron Tech', 'Technology', 1, 1);
      expect(mockIndexedDBService.saveAssessment).toHaveBeenCalledWith(1, 'Fully Implemented', 'Electron assessment');
    });

    it('should handle partial Electron data during migration', async () => {
      const partialElectronData = {
        pillars: [{ name: 'Partial Pillar' }]
        // Missing other data types
      };

      await service.migrateFromElectronData(partialElectronData);

      expect(mockIndexedDBService.addPillar).toHaveBeenCalledWith('Partial Pillar');
      // Other methods should not be called due to missing data
      expect(mockIndexedDBService.addFunctionCapability).not.toHaveBeenCalled();
    });

    it('should handle migration errors', async () => {
      spyOn(console, 'error'); // Suppress expected error logging
      const electronData = {
        pillars: [{ name: 'Error Pillar' }]
      };
      mockIndexedDBService.addPillar.and.returnValue(Promise.reject(new Error('Migration failed')));

      await expectAsync(service.migrateFromElectronData(electronData))
        .toBeRejectedWithError('Failed to migrate data from Electron format');
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors with user-friendly messages', async () => {
      spyOn(console, 'error'); // Suppress expected error logging
      const validationError = new Error('validation: Invalid pillar name');
      mockIndexedDBService.addPillar.and.returnValue(Promise.reject(validationError));

      await expectAsync(service.addPillar('Invalid'))
        .toBeRejectedWithError('Invalid input: validation: Invalid pillar name');
    });

    it('should re-throw non-validation errors', async () => {
      spyOn(console, 'error'); // Suppress expected error logging
      const genericError = new Error('Database connection failed');
      mockIndexedDBService.addPillar.and.returnValue(Promise.reject(genericError));

      await expectAsync(service.addPillar('Test'))
        .toBeRejectedWithError('Database connection failed');
    });

    it('should handle API call failures with logging', async () => {
      const error = new Error('Test error');
      mockIndexedDBService.getPillars.and.returnValue(Promise.reject(error));

      spyOn(console, 'error');

      await expectAsync(service.getPillars()).toBeRejected();
      expect(console.error).toHaveBeenCalledWith("API operation 'getPillars' failed:", error);
    });
  });
});
