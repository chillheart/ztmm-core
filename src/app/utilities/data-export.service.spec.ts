import { TestBed } from '@angular/core/testing';
import { DataExportService, ExportedData } from './data-export.service';
import { ZtmmDataWebService } from '../services/ztmm-data-web.service';
import { SqlJsService } from '../services/sqljs.service';
import { Pillar, FunctionCapability, MaturityStage, TechnologyProcess, AssessmentResponse, AssessmentStatus } from '../models/ztmm.models';
import { TestUtils } from '../testing/test-utils';

describe('DataExportService', () => {
  let service: DataExportService;
  let mockDataService: jasmine.SpyObj<ZtmmDataWebService>;

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
    const dataServiceSpy = jasmine.createSpyObj('ZtmmDataWebService', [
      'getPillars',
      'addPillar',
      'getFunctionCapabilities',
      'addFunctionCapability',
      'getMaturityStages',
      'getTechnologiesProcesses',
      'addTechnologyProcess',
      'getAssessmentResponses',
      'saveAssessment',
      'clearAllData',
      'resetDatabase',
      'importDataWithPreservedIds'
    ]);

    // Create mock SqljsService to avoid WebAssembly initialization issues
    const mockSqlJsService = TestUtils.createMockSqlJsService();

    TestBed.configureTestingModule({
      providers: [
        DataExportService,
        { provide: ZtmmDataWebService, useValue: dataServiceSpy },
        { provide: SqlJsService, useValue: mockSqlJsService }
      ]
    });

    service = TestBed.inject(DataExportService);
    mockDataService = TestBed.inject(ZtmmDataWebService) as jasmine.SpyObj<ZtmmDataWebService>;

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
    it('should export all data to JSON format', async () => {
      const result = await service.exportToJson();

      expect(mockDataService.getPillars).toHaveBeenCalled();
      expect(mockDataService.getFunctionCapabilities).toHaveBeenCalled();
      expect(mockDataService.getMaturityStages).toHaveBeenCalled();
      expect(mockDataService.getTechnologiesProcesses).toHaveBeenCalled();
      expect(mockDataService.getAssessmentResponses).toHaveBeenCalled();

      expect(result.pillars).toEqual([mockPillar]);
      expect(result.functionCapabilities).toEqual([mockFunctionCapability]);
      expect(result.maturityStages).toEqual([mockMaturityStage]);
      expect(result.technologiesProcesses).toEqual([mockTechnologyProcess]);
      expect(result.assessmentResponses).toEqual([mockAssessmentResponse]);
      expect(result.version).toBe('1.0.0');
      expect(result.exportDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should handle export errors gracefully', async () => {
      const error = new Error('Database export failed');
      mockDataService.getPillars.and.returnValue(Promise.reject(error));

      await expectAsync(service.exportToJson()).toBeRejectedWith(error);
    });

    it('should download exported data as JSON file', async () => {
      // Mock DOM elements
      const mockLink = jasmine.createSpyObj('HTMLAnchorElement', ['click']);

      // Mock URL static methods
      const createObjectURLSpy = spyOn(URL, 'createObjectURL').and.returnValue('blob:mock-url');
      const revokeObjectURLSpy = spyOn(URL, 'revokeObjectURL');

      spyOn(document, 'createElement').and.returnValue(mockLink);

      await service.downloadExport();

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(mockLink.href).toBe('blob:mock-url');
      expect(mockLink.download).toMatch(/^ztmm-export-\d{4}-\d{2}-\d{2}\.json$/);
      expect(mockLink.click).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should handle download errors', async () => {
      const error = new Error('Export failed');
      mockDataService.getPillars.and.returnValue(Promise.reject(error));

      await expectAsync(service.downloadExport()).toBeRejectedWith(error);
    });
  });

  describe('Import Operations', () => {
    it('should import data from JSON in correct dependency order', async () => {
      await service.importFromJson(mockExportedData);

      // Verify correct order of operations
      expect(mockDataService.resetDatabase).toHaveBeenCalled();
      expect(mockDataService.importDataWithPreservedIds).toHaveBeenCalledWith(mockExportedData);
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
      expect(mockDataService.importDataWithPreservedIds).toHaveBeenCalledWith(emptyData);
    });

    it('should handle import errors and propagate them', async () => {
      const error = new Error('Import failed');
      mockDataService.importDataWithPreservedIds.and.returnValue(Promise.reject(error));

      await expectAsync(service.importFromJson(mockExportedData)).toBeRejectedWith(error);
    });

    it('should upload and import data from file', async () => {
      const mockFileContent = JSON.stringify(mockExportedData);
      const mockFile = new File([mockFileContent], 'test-export.json', { type: 'application/json' });

      await service.uploadAndImport(mockFile);

      expect(mockDataService.resetDatabase).toHaveBeenCalled();
      expect(mockDataService.importDataWithPreservedIds).toHaveBeenCalledWith(mockExportedData);
    });

    it('should validate import data format', async () => {
      const invalidData = { invalid: 'data' };
      const mockFile = new File([JSON.stringify(invalidData)], 'invalid.json', { type: 'application/json' });

      await expectAsync(service.uploadAndImport(mockFile))
        .toBeRejectedWithError('Invalid import data format');
    });

    it('should handle file read errors during upload', async () => {
      const mockFile = new File(['invalid json content'], 'invalid.json', { type: 'application/json' });

      await expectAsync(service.uploadAndImport(mockFile)).toBeRejected();
    });

    it('should handle file text conversion errors', async () => {
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
      const stats = await service.getDataStatistics();

      expect(mockDataService.getPillars).toHaveBeenCalled();
      expect(mockDataService.getFunctionCapabilities).toHaveBeenCalled();
      expect(mockDataService.getMaturityStages).toHaveBeenCalled();
      expect(mockDataService.getTechnologiesProcesses).toHaveBeenCalled();
      expect(mockDataService.getAssessmentResponses).toHaveBeenCalled();

      expect(stats).toEqual({
        pillars: 1,
        functionCapabilities: 1,
        maturityStages: 1,
        technologiesProcesses: 1,
        assessmentResponses: 1
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
        pillars: 0,
        functionCapabilities: 0,
        maturityStages: 0,
        technologiesProcesses: 0,
        assessmentResponses: 0
      });
      expect(console.error).toHaveBeenCalledWith('Error getting data statistics:', error);
    });

    it('should handle empty data arrays in statistics', async () => {
      mockDataService.getPillars.and.returnValue(Promise.resolve([]));
      mockDataService.getFunctionCapabilities.and.returnValue(Promise.resolve([]));
      mockDataService.getMaturityStages.and.returnValue(Promise.resolve([]));
      mockDataService.getTechnologiesProcesses.and.returnValue(Promise.resolve([]));
      mockDataService.getAssessmentResponses.and.returnValue(Promise.resolve([]));

      const stats = await service.getDataStatistics();

      expect(stats).toEqual({
        pillars: 0,
        functionCapabilities: 0,
        maturityStages: 0,
        technologiesProcesses: 0,
        assessmentResponses: 0
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
      expect(mockDataService.importDataWithPreservedIds).toHaveBeenCalledWith(multiPillarData);
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
      expect(mockDataService.importDataWithPreservedIds).toHaveBeenCalledWith(multiFunctionData);
    });

    it('should handle technology and process types in import', async () => {
      const mixedTechProcessData: ExportedData = {
        ...mockExportedData,
        technologiesProcesses: [
          { id: 1, description: 'Tech 1', type: 'Technology', function_capability_id: 1, maturity_stage_id: 1 },
          { id: 2, description: 'Process 1', type: 'Process', function_capability_id: 1, maturity_stage_id: 2 }
        ]
      };

      await service.importFromJson(mixedTechProcessData);

      expect(mockDataService.resetDatabase).toHaveBeenCalled();
      expect(mockDataService.importDataWithPreservedIds).toHaveBeenCalledWith(mixedTechProcessData);
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
      expect(mockDataService.importDataWithPreservedIds).toHaveBeenCalledWith(multiAssessmentData);
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
      mockDataService.getPillars.and.returnValue(Promise.reject(error));

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
      mockDataService.getPillars.and.returnValue(Promise.reject(error));

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
