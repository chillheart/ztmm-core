import { TestBed } from '@angular/core/testing';
import { IndexedDBService } from './indexeddb.service';

// IndexedDB mock is already set up in test-setup.ts
// No need to import fake-indexeddb/auto here to avoid conflicts

// Declare resetIndexedDB function from test-setup
declare const window: any;

describe('IndexedDBService', () => {
  let service: IndexedDBService;
  let testDbName: string;

  beforeEach(async () => {
    // Reset IndexedDB before each test to ensure isolation
    if (window.resetIndexedDB) {
      window.resetIndexedDB();
    }

    // Generate a unique database name for this test
    testDbName = `ztmm-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    await TestBed.configureTestingModule({
      providers: [IndexedDBService]
    }).compileComponents();

    service = TestBed.inject(IndexedDBService);
    // service.setDatabaseName(testDbName); // Removed, no longer needed
  });

  afterEach(async () => {
    // Clean up after each test
    try {
      if (service && (service as any).db) {
        (service as any).db.close();
      }

      // Wait for database deletion to complete
      if (testDbName && window.indexedDB && window.indexedDB.deleteDatabase) {
        await new Promise<void>((resolve, _reject) => {
          const deleteRequest = window.indexedDB.deleteDatabase(testDbName);
          deleteRequest.onsuccess = () => {
            console.log(`Deleted test database: ${testDbName}`);
            resolve();
          };
          deleteRequest.onerror = () => {
            console.warn(`Failed to delete test database: ${testDbName}`);
            resolve(); // Still resolve to not block tests
          };
          deleteRequest.onblocked = () => {
            console.warn(`Database deletion blocked: ${testDbName}`);
            setTimeout(() => resolve(), 100); // Wait a bit and continue
          };
        });
      }

      // Reset the service state
      (service as any).isInitialized = false;
      (service as any).db = null;

      // Reset IndexedDB after each test for complete isolation
      if (window.resetIndexedDB) {
        window.resetIndexedDB();
      }
    } catch (error) {
      // Ignore cleanup errors
      console.warn('Cleanup error (expected):', error);
    }
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have initial state', () => {
      expect(service.isReady()).toBeFalse();
    });
  });

  describe('Database Initialization', () => {
    it('should initialize successfully', async () => {
      await service.initialize();
      expect(service.isReady()).toBeTrue();
    });

    it('should initialize with default data', async () => {
      await service.initialize();

      const pillars = await service.getPillars();
      expect(pillars.length).toBe(5);
      expect(pillars.map(p => p.name)).toContain('Identity');
      expect(pillars.map(p => p.name)).toContain('Devices');
      expect(pillars.map(p => p.name)).toContain('Networks');
      expect(pillars.map(p => p.name)).toContain('Applications & Workloads');
      expect(pillars.map(p => p.name)).toContain('Data');

      const maturityStages = await service.getMaturityStages();
      expect(maturityStages.length).toBe(4);
      expect(maturityStages.map(ms => ms.name)).toContain('Traditional');
      expect(maturityStages.map(ms => ms.name)).toContain('Initial');
      expect(maturityStages.map(ms => ms.name)).toContain('Advanced');
      expect(maturityStages.map(ms => ms.name)).toContain('Optimal');

      const functionCapabilities = await service.getFunctionCapabilities();
      expect(functionCapabilities.length).toBe(37);
    });

    it('should not initialize multiple times', async () => {
      await service.initialize();
      const firstReady = service.isReady();

      await service.initialize();
      const secondReady = service.isReady();

      expect(firstReady).toBeTrue();
      expect(secondReady).toBeTrue();
    });
  });

  describe('Pillar Operations', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should get pillars with default data', async () => {
      const pillars = await service.getPillars();
      expect(pillars.length).toBe(5);
      expect(pillars[0].name).toBe('Identity');
    });

    it('should add a new pillar', async () => {
      // Generate a truly unique pillar name with multiple sources of uniqueness
      const uniquePillarName = `Test Pillar ${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${performance.now()}-${Math.floor(Math.random() * 1000000)}`;

      // Verify the pillar doesn't already exist before adding it
      const existingPillars = await service.getPillars();
      expect(existingPillars.some(p => p.name === uniquePillarName)).toBeFalse();

      await service.addPillar(uniquePillarName);
      const pillars = await service.getPillars();
      expect(pillars.some(p => p.name === uniquePillarName)).toBeTrue();
    });

    it('should handle addPillar with empty name', async () => {
      await expectAsync(service.addPillar(''))
        .toBeRejectedWithError('Pillar name is required');
    });

    it('should handle addPillar with duplicate name', async () => {
      const duplicateName = `Duplicate Test ${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${performance.now()}-${Math.floor(Math.random() * 1000000)}`;

      // Verify the pillar doesn't already exist before adding it
      const existingPillars = await service.getPillars();
      expect(existingPillars.some(p => p.name === duplicateName)).toBeFalse();

      await service.addPillar(duplicateName);
      await expectAsync(service.addPillar(duplicateName))
        .toBeRejectedWithError('Pillar with this name already exists');
    });

    it('should remove a pillar', async () => {
      const pillars = await service.getPillars();
      const pillarToRemove = pillars[pillars.length - 1]; // Remove the last pillar to avoid removing default ones

      await service.removePillar(pillarToRemove.id);
      const updatedPillars = await service.getPillars();
      expect(updatedPillars.some(p => p.id === pillarToRemove.id)).toBeFalse();
    });

    it('should edit a pillar', async () => {
      const pillars = await service.getPillars();
      const pillarToEdit = pillars[0];

      await service.editPillar(pillarToEdit.id, 'Updated Identity');
      const updatedPillars = await service.getPillars();
      const updatedPillar = updatedPillars.find(p => p.id === pillarToEdit.id);

      expect(updatedPillar?.name).toBe('Updated Identity');
    });

    it('should save pillar order', async () => {
      const pillars = await service.getPillars();
      const originalOrder = pillars.map(p => p.id);
      const newOrder = [...originalOrder].reverse();

      await service.savePillarOrder(newOrder);
      const reorderedPillars = await service.getPillars();
      const reorderedIds = reorderedPillars.map(p => p.id);

      expect(reorderedIds).toEqual(newOrder);
    });
  });

  describe('Function Capability Operations', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should get function capabilities with default data', async () => {
      const capabilities = await service.getFunctionCapabilities();
      expect(capabilities.length).toBe(37);
      expect(capabilities.some(c => c.name === 'Authentication')).toBeTrue();
      expect(capabilities.some(c => c.name === 'Identity Stores')).toBeTrue();
    });

    it('should add a function capability', async () => {
      await service.addFunctionCapability('Test Function', 'Function', 1);
      const capabilities = await service.getFunctionCapabilities();
      expect(capabilities.some(c => c.name === 'Test Function')).toBeTrue();
    });

    it('should add a capability', async () => {
      await service.addFunctionCapability('Test Capability', 'Capability', 1);
      const capabilities = await service.getFunctionCapabilities();
      expect(capabilities.some(c => c.name === 'Test Capability' && c.type === 'Capability')).toBeTrue();
    });

    it('should validate function capability type', async () => {
      await expectAsync(service.addFunctionCapability('Invalid', 'InvalidType' as any, 1))
        .toBeRejectedWithError('Type must be either Function or Capability');
    });

    it('should remove a function capability', async () => {
      // Add a test function capability first
      await service.addFunctionCapability('To Be Removed', 'Function', 1);
      const capabilities = await service.getFunctionCapabilities();
      const capabilityToRemove = capabilities.find(c => c.name === 'To Be Removed');

      expect(capabilityToRemove).toBeDefined();
      await service.removeFunctionCapability(capabilityToRemove!.id);

      const updatedCapabilities = await service.getFunctionCapabilities();
      expect(updatedCapabilities.some(c => c.id === capabilityToRemove!.id)).toBeFalse();
    });

    it('should edit a function capability', async () => {
      const capabilities = await service.getFunctionCapabilities();
      const capabilityToEdit = capabilities[0];

      await service.editFunctionCapability(capabilityToEdit.id, 'Updated Function', 'Function', 1);
      const updatedCapabilities = await service.getFunctionCapabilities();
      const updatedCapability = updatedCapabilities.find(c => c.id === capabilityToEdit.id);

      expect(updatedCapability?.name).toBe('Updated Function');
    });
  });

  describe('Technology Process Operations', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should get all technology processes', async () => {
      const techProcesses = await service.getAllTechnologiesProcesses();
      expect(Array.isArray(techProcesses)).toBeTrue();
    });

    it('should add a technology process', async () => {
      await service.addTechnologyProcess('Test Tech', 'Test Technology Description', 'Technology', 1, 1);
      const techProcesses = await service.getAllTechnologiesProcesses();
      expect(techProcesses.some(tp => tp.name === 'Test Tech' && tp.description === 'Test Technology Description')).toBeTrue();
    });

    it('should add a process', async () => {
      await service.addTechnologyProcess('Test Process', 'Test Process Description', 'Process', 1, 1);
      const techProcesses = await service.getAllTechnologiesProcesses();
      expect(techProcesses.some(tp => tp.name === 'Test Process' && tp.description === 'Test Process Description' && tp.type === 'Process')).toBeTrue();
    });

    it('should validate technology process type', async () => {
      await expectAsync(service.addTechnologyProcess('Invalid', 'Invalid description', 'InvalidType' as any, 1, 1))
        .toBeRejectedWithError('Type must be either Technology or Process');
    });

    it('should get technology processes by function capability', async () => {
      // Add some test technology processes
      await service.addTechnologyProcess('Tech1', 'Tech for Function 1', 'Technology', 1, 1);
      await service.addTechnologyProcess('Tech2', 'Tech for Function 2', 'Technology', 2, 1);

      const techProcessesForFunction1 = await service.getTechnologiesProcessesByFunction(1);
      expect(techProcessesForFunction1.some(tp => tp.name === 'Tech1')).toBeTrue();
      expect(techProcessesForFunction1.every(tp => tp.function_capability_id === 1)).toBeTrue();
    });

    it('should remove a technology process', async () => {
      await service.addTechnologyProcess('To Remove', 'To Be Removed', 'Technology', 1, 1);
      const techProcesses = await service.getAllTechnologiesProcesses();
      const processToRemove = techProcesses.find(tp => tp.name === 'To Remove');

      expect(processToRemove).toBeDefined();
      await service.removeTechnologyProcess(processToRemove!.id);

      const updatedProcesses = await service.getAllTechnologiesProcesses();
      expect(updatedProcesses.some(tp => tp.id === processToRemove!.id)).toBeFalse();
    });

    it('should edit a technology process', async () => {
      await service.addTechnologyProcess('Original', 'Original Tech', 'Technology', 1, 1);
      const techProcesses = await service.getAllTechnologiesProcesses();
      const processToEdit = techProcesses.find(tp => tp.name === 'Original');

      expect(processToEdit).toBeDefined();
      await service.editTechnologyProcess(processToEdit!.id, 'Updated', 'Updated Tech', 'Process', 2, 2);

      const updatedProcesses = await service.getAllTechnologiesProcesses();
      const updatedProcess = updatedProcesses.find(tp => tp.id === processToEdit!.id);

      expect(updatedProcess?.description).toBe('Updated Tech');
      expect(updatedProcess?.type).toBe('Process');
      expect(updatedProcess?.function_capability_id).toBe(2);
      expect(updatedProcess?.maturity_stage_id).toBe(2);
    });
  });

  describe('Assessment Operations', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should save an assessment', async () => {
      // First add a technology process
      await service.addTechnologyProcess('Test Tech for Assessment', 'Test Tech for Assessment Description', 'Technology', 1, 1);
      const techProcesses = await service.getAllTechnologiesProcesses();
      const testTech = techProcesses.find(tp => tp.name === 'Test Tech for Assessment');

      expect(testTech).toBeDefined();
      await service.saveAssessment(testTech!.id, 'Partially Implemented', 'Test notes');

      const assessments = await service.getAssessmentResponses();
      const savedAssessment = assessments.find(a => a.tech_process_id === testTech!.id);

      expect(savedAssessment).toBeDefined();
      expect(savedAssessment?.status).toBe('Partially Implemented');
      expect(savedAssessment?.notes).toBe('Test notes');
    });

    it('should update an existing assessment', async () => {
      // Add a technology process and assessment
      await service.addTechnologyProcess('Tech for Update Test', 'Tech for Update Test Description', 'Technology', 1, 1);
      const techProcesses = await service.getAllTechnologiesProcesses();
      const testTech = techProcesses.find(tp => tp.name === 'Tech for Update Test');

      expect(testTech).toBeDefined();
      await service.saveAssessment(testTech!.id, 'Not Implemented', 'Initial notes');

      // Update the assessment
      await service.saveAssessment(testTech!.id, 'Fully Implemented', 'Updated notes');

      const assessments = await service.getAssessmentResponses();
      const updatedAssessment = assessments.find(a => a.tech_process_id === testTech!.id);

      expect(updatedAssessment?.status).toBe('Fully Implemented');
      expect(updatedAssessment?.notes).toBe('Updated notes');
    });

    it('should validate assessment status', async () => {
      await expectAsync(service.saveAssessment(1, 'InvalidStatus' as any))
        .toBeRejectedWithError('Invalid assessment status');
    });
  });

  describe('Database Management', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should export database', async () => {
      const exportData = await service.exportDatabase();
      expect(exportData).toBeInstanceOf(Uint8Array);
      expect(exportData.length).toBeGreaterThan(0);
    });

    it('should import database', async () => {
      // Export current data
      const exportData = await service.exportDatabase();

      // Add some test data with unique name
      const testPillarName = `Test Import Pillar ${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${performance.now()}-${Math.floor(Math.random() * 1000000)}`;

      // Verify the pillar doesn't already exist before adding it
      const existingPillars = await service.getPillars();
      expect(existingPillars.some(p => p.name === testPillarName)).toBeFalse();

      await service.addPillar(testPillarName);

      // Import the original data
      await service.importDatabase(exportData);

      // Verify the test pillar is gone (replaced by imported data)
      const pillars = await service.getPillars();
      expect(pillars.some(p => p.name === testPillarName)).toBeFalse();
    });

    it('should create and restore backups', async () => {
      // Add some test data with unique names
      const backupPillarName = `Backup Test Pillar ${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${performance.now()}-${Math.floor(Math.random() * 1000000)}`;
      const afterBackupPillarName = `After Backup Pillar ${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${performance.now()}-${Math.floor(Math.random() * 1000000)}`;

      // Verify the pillars don't already exist before adding them
      const existingPillars = await service.getPillars();
      expect(existingPillars.some(p => p.name === backupPillarName)).toBeFalse();
      expect(existingPillars.some(p => p.name === afterBackupPillarName)).toBeFalse();

      await service.addPillar(backupPillarName);

      // Create backup
      await service.createBackup();

      // Verify backup exists
      const backups = await service.getBackups();
      expect(backups.length).toBeGreaterThan(0);

      // Add more data
      await service.addPillar(afterBackupPillarName);

      // Restore backup
      await service.restoreBackup(backups[0].name);

      // Verify the data after backup is gone
      const pillars = await service.getPillars();
      expect(pillars.some(p => p.name === afterBackupPillarName)).toBeFalse();
    });

    it('should clear all user data while preserving defaults', async () => {
      // Add some user data with unique names
      const uniquePillarName = `User Pillar ${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${performance.now()}-${Math.floor(Math.random() * 1000000)}`;
      const uniqueFunctionName = `User Function ${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${performance.now()}-${Math.floor(Math.random() * 1000000)}`;

      // Verify the pillar doesn't already exist before adding it
      const existingPillars = await service.getPillars();
      expect(existingPillars.some(p => p.name === uniquePillarName)).toBeFalse();

      await service.addPillar(uniquePillarName);
      await service.addFunctionCapability(uniqueFunctionName, 'Function', 1);

      // Clear all data
      await service.clearAllData();

      // Verify user data is gone but defaults remain
      const pillars = await service.getPillars();
      const functionCapabilities = await service.getFunctionCapabilities();

      expect(pillars.some(p => p.name === uniquePillarName)).toBeFalse();
      expect(pillars.some(p => p.name === 'Identity')).toBeTrue(); // Default pillar should remain
      expect(functionCapabilities.some(fc => fc.name === uniqueFunctionName)).toBeFalse();
      expect(functionCapabilities.length).toBe(37); // Default function capabilities should remain
    });

    it('should reset database completely', async () => {
      // Add some user data with unique name
      const uniquePillarName = `User Pillar ${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${performance.now()}-${Math.floor(Math.random() * 1000000)}`;

      // Verify the pillar doesn't already exist before adding it
      const existingPillars = await service.getPillars();
      expect(existingPillars.some(p => p.name === uniquePillarName)).toBeFalse();

      await service.addPillar(uniquePillarName);

      // Verify the pillar was added
      let pillars = await service.getPillars();
      expect(pillars.some(p => p.name === uniquePillarName)).toBeTrue();

      // Reset database
      await service.resetDatabase();

      // Verify database is reset to defaults
      pillars = await service.getPillars();
      const functionCapabilities = await service.getFunctionCapabilities();
      const maturityStages = await service.getMaturityStages();

      expect(pillars.length).toBe(5);
      expect(functionCapabilities.length).toBe(37);
      expect(maturityStages.length).toBe(4);
      expect(pillars.some(p => p.name === uniquePillarName)).toBeFalse();
    });
  });

  describe('Data Import with Preserved IDs', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should import data with preserved IDs', async () => {
      // Use very high IDs to avoid conflicts with existing data
      const uniqueId = Date.now() + Math.floor(Math.random() * 100000);
      const testData = {
        maturityStages: [
          { id: uniqueId + 1000, name: `Advanced ${uniqueId}` }
        ],
        pillars: [
          { id: uniqueId + 2000, name: `Custom Pillar ${uniqueId}`, order_index: 1 }
        ],
        functionCapabilities: [
          { id: uniqueId + 3000, name: `Custom Function ${uniqueId}`, type: 'Function', pillar_id: uniqueId + 2000, order_index: 1 }
        ],
        technologiesProcesses: [
          { id: uniqueId + 4000, description: `Custom Tech ${uniqueId}`, type: 'Technology', function_capability_id: uniqueId + 3000, maturity_stage_id: uniqueId + 1000 }
        ],
        assessmentResponses: [
          { id: uniqueId + 5000, tech_process_id: uniqueId + 4000, status: 'Fully Implemented', notes: 'Custom assessment' }
        ]
      };

      await service.importDataWithPreservedIds(testData);

      // Verify the data was imported with preserved IDs
      const maturityStages = await service.getMaturityStages();
      const pillars = await service.getPillars();
      const functionCapabilities = await service.getFunctionCapabilities();
      const techProcesses = await service.getAllTechnologiesProcesses();
      const assessments = await service.getAssessmentResponses();

      expect(maturityStages.some(ms => ms.id === uniqueId + 1000 && ms.name === `Advanced ${uniqueId}`)).toBeTrue();
      expect(pillars.some(p => p.id === uniqueId + 2000 && p.name === `Custom Pillar ${uniqueId}`)).toBeTrue();
      expect(functionCapabilities.some(fc => fc.id === uniqueId + 3000 && fc.name === `Custom Function ${uniqueId}`)).toBeTrue();
      expect(techProcesses.some(tp => tp.id === uniqueId + 4000 && tp.description === `Custom Tech ${uniqueId}`)).toBeTrue();
      expect(assessments.some(a => a.id === uniqueId + 5000 && a.tech_process_id === uniqueId + 4000)).toBeTrue();
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should handle invalid pillar ID for removal', async () => {
      await expectAsync(service.removePillar(-1))
        .toBeRejectedWithError('Invalid pillar ID');
    });

    it('should handle invalid function capability ID for removal', async () => {
      await expectAsync(service.removeFunctionCapability(0))
        .toBeRejectedWithError('Invalid function capability ID');
    });

    it('should handle invalid technology process ID for removal', async () => {
      await expectAsync(service.removeTechnologyProcess(0))
        .toBeRejectedWithError('Invalid technology process ID');
    });

    it('should handle long pillar names', async () => {
      const longName = 'a'.repeat(300);
      await expectAsync(service.addPillar(longName))
        .toBeRejectedWithError('Pillar name cannot exceed 255 characters');
    });

    it('should handle long technology process descriptions', async () => {
      const longDescription = 'a'.repeat(600);
      await expectAsync(service.addTechnologyProcess('Valid Name', longDescription, 'Technology', 1, 1))
        .toBeRejectedWithError('Description cannot exceed 500 characters');
    });

    it('should handle long assessment notes', async () => {
      const longNotes = 'a'.repeat(2100);
      await expectAsync(service.saveAssessment(1, 'Not Implemented', longNotes))
        .toBeRejectedWithError('Notes cannot exceed 2000 characters');
    });
  });
});
