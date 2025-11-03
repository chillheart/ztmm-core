import { TestBed } from '@angular/core/testing';
import { DataExportService } from './data-export.service';
import { IndexedDBService } from '../services/indexeddb.service';
import { DataMigrationService } from '../services/data-migration.service';
import {
  Pillar,
  FunctionCapability,
  MaturityStage,
  TechnologyProcess,
  AssessmentResponse,
  AssessmentStatus,
  ExportedData
} from '../models/ztmm.models';
import { TestUtilsIndexedDB } from '../testing/test-utils-indexeddb';

describe('DataExportService', () => {
  let service: DataExportService;
  let mockDataService: jasmine.SpyObj<IndexedDBService>;

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
    name: 'Test Technology',
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

  const mockExportedData: ExportedData = {
    pillars: [mockPillar],
    functionCapabilities: [mockFunctionCapability],
    maturityStages: [mockMaturityStage],
    technologiesProcesses: [mockTechnologyProcess],
    assessmentResponses: [mockAssessmentResponse],
    exportDate: '2024-01-01T00:00:00Z',
    version: '1.0.0'
  };

  beforeEach(() => {
    // Create mock services for testing
    const mockIndexedDBService = TestUtilsIndexedDB.createMockIndexedDBService();
    const mockMigrationService = jasmine.createSpyObj('DataMigrationService', ['migrateV1ToV2']);
    mockMigrationService.migrateV1ToV2.and.returnValue(Promise.resolve({
      success: true,
      message: 'Migration successful'
    }));

    TestBed.configureTestingModule({
      providers: [
        DataExportService,
        { provide: IndexedDBService, useValue: mockIndexedDBService },
        { provide: DataMigrationService, useValue: mockMigrationService }
      ]
    });

    service = TestBed.inject(DataExportService);
    mockDataService = TestBed.inject(IndexedDBService) as jasmine.SpyObj<IndexedDBService>;

    // Setup default spy returns
    mockDataService.getPillars.and.returnValue(Promise.resolve([mockPillar]));
    mockDataService.addPillar.and.returnValue(Promise.resolve());
    mockDataService.getFunctionCapabilities.and.returnValue(Promise.resolve([mockFunctionCapability]));
    mockDataService.addFunctionCapability.and.returnValue(Promise.resolve());
    mockDataService.getMaturityStages.and.returnValue(Promise.resolve([mockMaturityStage]));
    mockDataService.getTechnologiesProcesses.and.returnValue(Promise.resolve([mockTechnologyProcess]));
    mockDataService.addTechnologyProcess.and.returnValue(Promise.resolve());
    mockDataService.getAssessmentResponses.and.returnValue(Promise.resolve([mockAssessmentResponse]));
    mockDataService.saveAssessment.and.returnValue(Promise.resolve());
    mockDataService.clearAllData.and.returnValue(Promise.resolve());
    mockDataService.resetDatabase.and.returnValue(Promise.resolve());
    mockDataService.importDataWithPreservedIds.and.returnValue(Promise.resolve());
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Export Operations', () => {
    it('should export all data to JSON format in V2 format', async () => {
      const result = await service.exportToJson();

      expect(mockDataService.getAllRawPillars).toHaveBeenCalled();
      expect(mockDataService.getAllRawFunctionCapabilities).toHaveBeenCalled();
      expect(mockDataService.getMaturityStages).toHaveBeenCalled();
      expect(mockDataService.getProcessTechnologyGroups).toHaveBeenCalled();
      expect(mockDataService.getMaturityStageImplementations).toHaveBeenCalled();
      expect(mockDataService.getAssessmentsV2).toHaveBeenCalled();
      expect(mockDataService.getStageImplementationDetails).toHaveBeenCalled();

      mockDataService.getAllRawPillars.and.returnValue(Promise.resolve([mockPillar]));
      mockDataService.getAllRawFunctionCapabilities.and.returnValue(Promise.resolve([mockFunctionCapability]));
      expect(result.pillars[0].name).toBeDefined();
      expect(result.functionCapabilities.length).toBeGreaterThan(0);
      expect(result.functionCapabilities[0].name).toBeDefined();
      expect(result.maturityStages).toEqual([mockMaturityStage]);
      expect(result.version).toBe('2.0.0');
      // V2 fields should be present (even if empty from mock)
      expect(result.processTechnologyGroups).toBeDefined();
      expect(result.maturityStageImplementations).toBeDefined();
      expect(result.assessments).toBeDefined();
      expect(result.stageImplementationDetails).toBeDefined();
      expect(result.exportDate).toMatch(/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$/);
    });

    it('should handle export errors gracefully', async () => {
  spyOn(console, 'error'); // Suppress expected error logging
  const error = new Error('Database export failed');
  mockDataService.getAllRawPillars.and.returnValue(Promise.reject(error));
  mockDataService.getAllRawFunctionCapabilities.and.returnValue(Promise.resolve([]));
  mockDataService.getMaturityStages.and.returnValue(Promise.resolve([]));
  mockDataService.getTechnologiesProcesses.and.returnValue(Promise.resolve([]));
  mockDataService.getAssessmentResponses.and.returnValue(Promise.resolve([]));

  await expectAsync(service.exportToJson()).toBeRejectedWith(error);
    });

    it('should download exported data as JSON file', async () => {
      // Mock DOM elements
      const mockLink = jasmine.createSpyObj('HTMLAnchorElement', ['click']);

      // Mock URL static methods
      const createObjectURLSpy = spyOn(URL, 'createObjectURL').and.returnValue('blob:mock-url');
      spyOn(URL, 'revokeObjectURL');

      spyOn(document, 'createElement').and.returnValue(mockLink);
      await service.downloadExport();

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(mockLink.href).toBe('blob:mock-url');
      expect(mockLink.download).toMatch(/^ztmm-export-\d{4}-\d{2}-\d{2}\.json$/);
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should handle download errors', async () => {
  spyOn(console, 'error'); // Suppress expected error logging
  const error = new Error('Export failed');
  mockDataService.getAllRawPillars.and.returnValue(Promise.reject(error));

  await expectAsync(service.downloadExport()).toBeRejectedWith(error);
    });
  });

  describe('Import Operations', () => {
    it('should import data from JSON in correct dependency order', async () => {
      await service.importFromJson(mockExportedData);

      // Verify correct order of operations
      expect(mockDataService.resetDatabase).toHaveBeenCalled();
      // V1 import only passes data fields, not exportDate/version
      expect(mockDataService.importDataWithPreservedIds).toHaveBeenCalledWith({
        pillars: mockExportedData.pillars,
        functionCapabilities: mockExportedData.functionCapabilities,
        maturityStages: mockExportedData.maturityStages,
        technologiesProcesses: mockExportedData.technologiesProcesses || [],
        assessmentResponses: mockExportedData.assessmentResponses || []
      });
    });

    it('should handle empty data arrays during import', async () => {
      const emptyData: ExportedData = {
        pillars: [],
        functionCapabilities: [],
        maturityStages: [],
        technologiesProcesses: [],
        assessmentResponses: [],
        exportDate: '2024-01-01T00:00:00Z',
        version: '1.0.0'
      };

      await service.importFromJson(emptyData);

      expect(mockDataService.resetDatabase).toHaveBeenCalled();
      // V1 import only passes data fields, not exportDate/version
      expect(mockDataService.importDataWithPreservedIds).toHaveBeenCalledWith({
        pillars: [],
        functionCapabilities: [],
        maturityStages: [],
        technologiesProcesses: [],
        assessmentResponses: []
      });
    });

    it('should handle import errors and propagate them', async () => {
      spyOn(console, 'error'); // Suppress expected error logging
      const error = new Error('Import failed');
      mockDataService.importDataWithPreservedIds.and.returnValue(Promise.reject(error));

      await expectAsync(service.importFromJson(mockExportedData)).toBeRejectedWith(error);
    });

    it('should upload and import data from file', async () => {
      const mockFileContent = JSON.stringify(mockExportedData);
      const mockFile = new File([mockFileContent], 'test-export.json', { type: 'application/json' });

      await service.uploadAndImport(mockFile);

      expect(mockDataService.resetDatabase).toHaveBeenCalled();
      // V1 import only passes data fields, not exportDate/version
      expect(mockDataService.importDataWithPreservedIds).toHaveBeenCalledWith({
        pillars: mockExportedData.pillars,
        functionCapabilities: mockExportedData.functionCapabilities,
        maturityStages: mockExportedData.maturityStages,
        technologiesProcesses: mockExportedData.technologiesProcesses || [],
        assessmentResponses: mockExportedData.assessmentResponses || []
      });
    });


    it('should handle file read errors during upload', async () => {
      spyOn(console, 'error'); // Suppress expected error logging
      const mockFile = new File(['invalid json content'], 'invalid.json', { type: 'application/json' });

      await expectAsync(service.uploadAndImport(mockFile)).toBeRejected();
    });

    it('should handle file text conversion errors', async () => {
      spyOn(console, 'error'); // Suppress expected error logging
      const mockFile = jasmine.createSpyObj('File', ['text']);
      mockFile.text.and.returnValue(Promise.reject(new Error('Text conversion failed')));

      await expectAsync(service.uploadAndImport(mockFile))
        .toBeRejectedWithError('Text conversion failed');
    });
  });

  describe('Data Validation', () => {
    it('should validate correct import data structure', () => {
      const isValid = (service as any).validateImportData(mockExportedData);
      expect(isValid).toBe(true);
    });

    it('should reject data missing required arrays', () => {
      const invalidData = {
        pillars: [mockPillar],
        // Missing other required arrays
        exportDate: '2024-01-01T00:00:00Z',
        version: '1.0.0'
      };

      const isValid = (service as any).validateImportData(invalidData);
      expect(isValid).toBe(false);
    });

    it('should reject data with non-array properties', () => {
      const invalidData = {
        pillars: 'not an array',
        functionCapabilities: [mockFunctionCapability],
        maturityStages: [mockMaturityStage],
        technologiesProcesses: [mockTechnologyProcess],
        assessmentResponses: [mockAssessmentResponse],
        exportDate: '2024-01-01T00:00:00Z',
        version: '1.0.0'
      };

      const isValid = (service as any).validateImportData(invalidData);
      expect(isValid).toBe(false);
    });

    it('should reject data missing exportDate or version', () => {
      const invalidData = {
        pillars: [mockPillar],
        functionCapabilities: [mockFunctionCapability],
        maturityStages: [mockMaturityStage],
        technologiesProcesses: [mockTechnologyProcess],
        assessmentResponses: [mockAssessmentResponse],
        // Missing exportDate and version
      };

      const isValid = (service as any).validateImportData(invalidData);
      expect(isValid).toBe(false);
    });

    it('should reject null or undefined data', () => {
      expect((service as any).validateImportData(null)).toBe(false);
      expect((service as any).validateImportData(undefined)).toBe(false);
      expect((service as any).validateImportData({})).toBe(false);
    });
  });

  describe('Data Statistics', () => {
    it('should return correct data statistics', async () => {
      // Setup mocks to return some V2 data
      mockDataService.getProcessTechnologyGroups.and.returnValue(Promise.resolve([{
        id: 1,
        name: 'Test PTG',
        description: 'Test description',
        type: 'Technology',
        function_capability_id: 1,
        order_index: 1
      }]));

      const stats = await service.getDataStatistics();

      expect(mockDataService.getPillars).toHaveBeenCalled();
      expect(mockDataService.getFunctionCapabilities).toHaveBeenCalled();
      expect(mockDataService.getMaturityStages).toHaveBeenCalled();
      expect(mockDataService.getTechnologiesProcesses).toHaveBeenCalled();
      expect(mockDataService.getAssessmentResponses).toHaveBeenCalled();
      expect(mockDataService.getProcessTechnologyGroups).toHaveBeenCalled();
      expect(mockDataService.getMaturityStageImplementations).toHaveBeenCalled();
      expect(mockDataService.getAssessmentsV2).toHaveBeenCalled();
      expect(mockDataService.getStageImplementationDetails).toHaveBeenCalled();

      expect(stats).toEqual({
        version: '2.0.0',
        pillars: 1,
        functionCapabilities: 1,
        maturityStages: 1,
        technologiesProcesses: 1,
        assessmentResponses: 1,
        processTechnologyGroups: 1,
        maturityStageImplementations: 0,
        assessments: 3, // TestUtilsIndexedDB now provides 3 mock assessments
        stageImplementationDetails: 0
      });
    });

    it('should return zero statistics when data service fails', async () => {
      const error = new Error('Service failed');
      mockDataService.getPillars.and.returnValue(Promise.reject(error));
      mockDataService.getFunctionCapabilities.and.returnValue(Promise.reject(error));
      mockDataService.getMaturityStages.and.returnValue(Promise.reject(error));
      mockDataService.getTechnologiesProcesses.and.returnValue(Promise.reject(error));
      mockDataService.getAssessmentResponses.and.returnValue(Promise.reject(error));

      spyOn(console, 'error');

      const stats = await service.getDataStatistics();

      expect(stats).toEqual({
        version: '2.0.0',
        pillars: 0,
        functionCapabilities: 0,
        maturityStages: 0,
        technologiesProcesses: 0,
        assessmentResponses: 0,
        processTechnologyGroups: 0,
        maturityStageImplementations: 0,
        assessments: 0,
        stageImplementationDetails: 0
      });
      expect(console.error).toHaveBeenCalledWith('Error getting data statistics:', error);
    });

    it('should handle empty data arrays in statistics', async () => {
      mockDataService.getPillars.and.returnValue(Promise.resolve([]));
      mockDataService.getFunctionCapabilities.and.returnValue(Promise.resolve([]));
      mockDataService.getMaturityStages.and.returnValue(Promise.resolve([]));
      mockDataService.getTechnologiesProcesses.and.returnValue(Promise.resolve([]));
      mockDataService.getAssessmentResponses.and.returnValue(Promise.resolve([]));
      // Override V2 data to be empty as well
      mockDataService.getProcessTechnologyGroups.and.returnValue(Promise.resolve([]));
      mockDataService.getMaturityStageImplementations.and.returnValue(Promise.resolve([]));
      mockDataService.getAssessmentsV2.and.returnValue(Promise.resolve([]));
      mockDataService.getStageImplementationDetails.and.returnValue(Promise.resolve([]));

      const stats = await service.getDataStatistics();

      expect(stats).toEqual({
        version: '2.0.0', // Updated to V2 format
        pillars: 0,
        functionCapabilities: 0,
        maturityStages: 0,
        technologiesProcesses: 0,
        assessmentResponses: 0,
        processTechnologyGroups: 0,
        maturityStageImplementations: 0,
        assessments: 0,
        stageImplementationDetails: 0
      });
    });
  });

  describe('Import Data Processing', () => {
    it('should handle multiple pillars in import', async () => {
      const multiPillarData: ExportedData = {
        ...mockExportedData,
        pillars: [
          { id: 1, name: 'Pillar 1' },
          { id: 2, name: 'Pillar 2' },
          { id: 3, name: 'Pillar 3' }
        ]
      };

      await service.importFromJson(multiPillarData);

      expect(mockDataService.resetDatabase).toHaveBeenCalled();
      // V1 import only passes the data fields, not exportDate/version
      expect(mockDataService.importDataWithPreservedIds).toHaveBeenCalledWith({
        pillars: multiPillarData.pillars,
        functionCapabilities: multiPillarData.functionCapabilities,
        maturityStages: multiPillarData.maturityStages,
        technologiesProcesses: multiPillarData.technologiesProcesses || [],
        assessmentResponses: multiPillarData.assessmentResponses || []
      });
    });

    it('should handle multiple function capabilities in import', async () => {
      const multiFunctionData: ExportedData = {
        ...mockExportedData,
        functionCapabilities: [
          { id: 1, name: 'Function 1', type: 'Function', pillar_id: 1 },
          { id: 2, name: 'Capability 1', type: 'Capability', pillar_id: 1 }
        ]
      };

      await service.importFromJson(multiFunctionData);

      expect(mockDataService.resetDatabase).toHaveBeenCalled();
      // V1 import only passes data fields, not exportDate/version
      expect(mockDataService.importDataWithPreservedIds).toHaveBeenCalledWith({
        pillars: multiFunctionData.pillars,
        functionCapabilities: multiFunctionData.functionCapabilities,
        maturityStages: multiFunctionData.maturityStages,
        technologiesProcesses: multiFunctionData.technologiesProcesses || [],
        assessmentResponses: multiFunctionData.assessmentResponses || []
      });
    });

    it('should handle technology and process types in import', async () => {
      const mixedTechProcessData: ExportedData = {
        ...mockExportedData,
        technologiesProcesses: [
          { id: 1, name: 'Tech 1', description: 'Tech 1', type: 'Technology', function_capability_id: 1, maturity_stage_id: 1 },
          { id: 2, name: 'Process 1', description: 'Process 1', type: 'Process', function_capability_id: 1, maturity_stage_id: 2 }
        ]
      };

      await service.importFromJson(mixedTechProcessData);

      expect(mockDataService.resetDatabase).toHaveBeenCalled();
      // V1 import only passes data fields, not exportDate/version
      expect(mockDataService.importDataWithPreservedIds).toHaveBeenCalledWith({
        pillars: mixedTechProcessData.pillars,
        functionCapabilities: mixedTechProcessData.functionCapabilities,
        maturityStages: mixedTechProcessData.maturityStages,
        technologiesProcesses: mixedTechProcessData.technologiesProcesses || [],
        assessmentResponses: mixedTechProcessData.assessmentResponses || []
      });
    });

    it('should handle different assessment statuses in import', async () => {
      const multiAssessmentData: ExportedData = {
        ...mockExportedData,
        assessmentResponses: [
          { id: 1, tech_process_id: 1, status: 'Fully Implemented', notes: 'Notes 1' },
          { id: 2, tech_process_id: 2, status: 'Partially Implemented', notes: 'Notes 2' },
          { id: 3, tech_process_id: 3, status: 'Not Implemented', notes: undefined }
        ]
      };

      await service.importFromJson(multiAssessmentData);

      expect(mockDataService.resetDatabase).toHaveBeenCalled();
      // V1 import only passes data fields, not exportDate/version
      expect(mockDataService.importDataWithPreservedIds).toHaveBeenCalledWith({
        pillars: multiAssessmentData.pillars,
        functionCapabilities: multiAssessmentData.functionCapabilities,
        maturityStages: multiAssessmentData.maturityStages,
        technologiesProcesses: multiAssessmentData.technologiesProcesses || [],
        assessmentResponses: multiAssessmentData.assessmentResponses || []
      });
    });
  });

  describe('Error Handling and Logging', () => {
    beforeEach(() => {
      spyOn(console, 'log');
      spyOn(console, 'error');
      spyOn(console, 'warn');
    });

    it('should log successful import completion', async () => {
      await service.importFromJson(mockExportedData);

      expect(console.log).toHaveBeenCalledWith('Data import completed successfully');
    });

    it('should log export errors', async () => {
      const error = new Error('Export error');
      mockDataService.getAllRawPillars.and.returnValue(Promise.reject(error));

      await expectAsync(service.exportToJson()).toBeRejected();
      expect(console.error).toHaveBeenCalledWith('Error exporting data:', error);
    });

    it('should log import errors', async () => {
      const error = new Error('Import error');
      mockDataService.importDataWithPreservedIds.and.returnValue(Promise.reject(error));

      await expectAsync(service.importFromJson(mockExportedData)).toBeRejected();
      expect(console.error).toHaveBeenCalledWith('Error importing data:', error);
    });

    it('should log download errors', async () => {
      const error = new Error('Download error');
      mockDataService.getAllRawPillars.and.returnValue(Promise.reject(error));

      await expectAsync(service.downloadExport()).toBeRejected();
      expect(console.error).toHaveBeenCalledWith('Error downloading export:', error);
    });

    it('should log upload and import errors', async () => {
      const invalidJson = 'invalid json';
      const mockFile = new File([invalidJson], 'invalid.json', { type: 'application/json' });

      await expectAsync(service.uploadAndImport(mockFile)).toBeRejected();
      expect(console.error).toHaveBeenCalledWith('Error uploading and importing data:', jasmine.any(Error));
    });
  });
});
