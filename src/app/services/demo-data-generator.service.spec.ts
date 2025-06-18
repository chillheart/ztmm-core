import { TestBed } from '@angular/core/testing';
import { DemoDataGeneratorService } from './demo-data-generator.service';
import { ZtmmDataWebService } from './ztmm-data-web.service';
import { FunctionCapability, MaturityStage, TechnologyProcess } from '../models/ztmm.models';

describe('DemoDataGeneratorService', () => {
  let service: DemoDataGeneratorService;
  let mockDataService: jasmine.SpyObj<ZtmmDataWebService>;

  const mockFunctionCapabilities: FunctionCapability[] = [
    { id: 1, name: 'Authentication', type: 'Function', pillar_id: 1 },
    { id: 2, name: 'Identity Stores', type: 'Function', pillar_id: 1 },
    { id: 3, name: 'Visibility & Analytics', type: 'Capability', pillar_id: 1 }
  ];

  const mockMaturityStages: MaturityStage[] = [
    { id: 1, name: 'Traditional' },
    { id: 2, name: 'Initial' },
    { id: 3, name: 'Advanced' },
    { id: 4, name: 'Optimal' }
  ];

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ZtmmDataWebService', [
      'getFunctionCapabilities',
      'getMaturityStages',
      'getAllTechnologiesProcesses',
      'addTechnologyProcess'
    ]);

    TestBed.configureTestingModule({
      providers: [
        DemoDataGeneratorService,
        { provide: ZtmmDataWebService, useValue: spy }
      ]
    });

    service = TestBed.inject(DemoDataGeneratorService);
    mockDataService = TestBed.inject(ZtmmDataWebService) as jasmine.SpyObj<ZtmmDataWebService>;

    // Setup default spy returns
    mockDataService.getFunctionCapabilities.and.returnValue(Promise.resolve(mockFunctionCapabilities));
    mockDataService.getMaturityStages.and.returnValue(Promise.resolve(mockMaturityStages));
    mockDataService.getAllTechnologiesProcesses.and.returnValue(Promise.resolve([]));
    mockDataService.addTechnologyProcess.and.returnValue(Promise.resolve());
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('generateDemoData', () => {
    it('should generate demo data for all function capabilities', async () => {
      await service.generateDemoData();

      expect(mockDataService.getFunctionCapabilities).toHaveBeenCalled();
      expect(mockDataService.getMaturityStages).toHaveBeenCalled();
      expect(mockDataService.addTechnologyProcess).toHaveBeenCalled();
    });

    it('should add technologies and processes for Authentication function', async () => {
      await service.generateDemoData();

      // Check that Authentication demo data was added
      const authenticationCalls = mockDataService.addTechnologyProcess.calls.all().filter(call =>
        call.args[3] === 1 // function_capability_id for Authentication (now 4th parameter)
      );

      expect(authenticationCalls.length).toBeGreaterThan(0);

      // Verify some specific items were added
      const descriptions = authenticationCalls.map(call => call.args[0]);
      expect(descriptions).toContain('Azure Active Directory Multi-Factor Authentication');
      expect(descriptions).toContain('Multi-Factor Authentication Policy Framework');
    });

    it('should handle invalid maturity stage IDs', async () => {
      // Mock data service to return limited maturity stages
      mockDataService.getMaturityStages.and.returnValue(Promise.resolve([
        { id: 1, name: 'Traditional' },
        { id: 2, name: 'Initial' }
      ]));

      spyOn(console, 'warn'); // Suppress warning messages

      await service.generateDemoData();

      expect(console.warn).toHaveBeenCalled();
      expect(mockDataService.addTechnologyProcess).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockDataService.addTechnologyProcess.and.returnValue(Promise.reject(new Error('Database error')));
      spyOn(console, 'error'); // Suppress error messages

      await expectAsync(service.generateDemoData()).toBeRejectedWithError('Database error');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('isDemoDataAlreadyGenerated', () => {
    it('should return false when no demo data exists', async () => {
      mockDataService.getAllTechnologiesProcesses.and.returnValue(Promise.resolve([]));

      const result = await service.isDemoDataAlreadyGenerated();

      expect(result).toBe(false);
      expect(mockDataService.getAllTechnologiesProcesses).toHaveBeenCalled();
    });

    it('should return true when signature demo items exist', async () => {
      const existingTechProcesses: TechnologyProcess[] = [
        { id: 1, name: 'Azure Active Directory Multi-Factor Authentication', description: 'Azure Active Directory Multi-Factor Authentication', type: 'Technology', function_capability_id: 1, maturity_stage_id: 3 },
        { id: 2, name: 'Microsoft Intune Device Compliance', description: 'Microsoft Intune Device Compliance', type: 'Technology', function_capability_id: 2, maturity_stage_id: 3 },
        { id: 3, name: 'Azure Virtual Network', description: 'Azure Virtual Network', type: 'Technology', function_capability_id: 3, maturity_stage_id: 2 }
      ];

      mockDataService.getAllTechnologiesProcesses.and.returnValue(Promise.resolve(existingTechProcesses));

      const result = await service.isDemoDataAlreadyGenerated();

      expect(result).toBe(true);
    });

    it('should return false when only some signature items exist', async () => {
      const existingTechProcesses: TechnologyProcess[] = [
        { id: 1, name: 'Azure Active Directory Multi-Factor Authentication', description: 'Azure Active Directory Multi-Factor Authentication', type: 'Technology', function_capability_id: 1, maturity_stage_id: 3 },
        { id: 2, name: 'Some other technology', description: 'Some other technology', type: 'Technology', function_capability_id: 2, maturity_stage_id: 2 }
      ];

      mockDataService.getAllTechnologiesProcesses.and.returnValue(Promise.resolve(existingTechProcesses));

      const result = await service.isDemoDataAlreadyGenerated();

      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      mockDataService.getAllTechnologiesProcesses.and.returnValue(Promise.reject(new Error('Database error')));
      spyOn(console, 'error'); // Suppress error messages

      const result = await service.isDemoDataAlreadyGenerated();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getDemoDataStatistics', () => {
    it('should return correct statistics for demo data', async () => {
      const stats = await service.getDemoDataStatistics();

      expect(stats.functionsWithData).toBeGreaterThan(0);
      expect(stats.totalTechnologies).toBeGreaterThan(0);
      expect(stats.totalProcesses).toBeGreaterThan(0);
      expect(stats.totalItems).toBe(stats.totalTechnologies + stats.totalProcesses);
      expect(mockDataService.getFunctionCapabilities).toHaveBeenCalled();
    });

    it('should count technologies and processes correctly', async () => {
      const stats = await service.getDemoDataStatistics();

      // Authentication function has 3 technologies and 3 processes (from demo data)
      expect(stats.totalTechnologies).toBeGreaterThanOrEqual(3);
      expect(stats.totalProcesses).toBeGreaterThanOrEqual(3);
    });
  });
});
