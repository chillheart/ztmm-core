import { TestBed } from '@angular/core/testing';
import { ZtmmDataService } from './ztmm-data.service';
import { Pillar, FunctionCapability, MaturityStage, TechnologyProcess, AssessmentResponse, AssessmentStatus } from '../models/ztmm.models';

// Mock the Electron API
const mockApi = {
  getPillars: jasmine.createSpy('getPillars'),
  addPillar: jasmine.createSpy('addPillar'),
  removePillar: jasmine.createSpy('removePillar'),
  getFunctionCapabilities: jasmine.createSpy('getFunctionCapabilities'),
  addFunctionCapability: jasmine.createSpy('addFunctionCapability'),
  removeFunctionCapability: jasmine.createSpy('removeFunctionCapability'),
  getMaturityStages: jasmine.createSpy('getMaturityStages'),
  getTechnologiesProcesses: jasmine.createSpy('getTechnologiesProcesses'),
  addTechnologyProcess: jasmine.createSpy('addTechnologyProcess'),
  removeTechnologyProcess: jasmine.createSpy('removeTechnologyProcess'),
  saveAssessment: jasmine.createSpy('saveAssessment'),
  getAssessmentResponses: jasmine.createSpy('getAssessmentResponses'),
  savePillarOrder: jasmine.createSpy('savePillarOrder'),
  saveFunctionOrder: jasmine.createSpy('saveFunctionOrder'),
  editPillar: jasmine.createSpy('editPillar'),
  editFunctionCapability: jasmine.createSpy('editFunctionCapability'),
  editTechnologyProcess: jasmine.createSpy('editTechnologyProcess')
};

describe('ZtmmDataService', () => {
  let service: ZtmmDataService;

  beforeEach(() => {
    // Set up the mock API before TestBed configuration
    (window as any).api = mockApi;

    TestBed.configureTestingModule({});
    service = TestBed.inject(ZtmmDataService);

    // Reset all spies
    Object.values(mockApi).forEach(spy => spy.calls.reset());
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Pillar Operations', () => {
    it('should get pillars', async () => {
      const mockPillars: Pillar[] = [
        { id: 1, name: 'Identity' },
        { id: 2, name: 'Device' }
      ];
      mockApi.getPillars.and.returnValue(Promise.resolve(mockPillars));

      const result = await service.getPillars();

      expect(mockApi.getPillars).toHaveBeenCalled();
      expect(result).toEqual(mockPillars);
    });

    it('should add a pillar', async () => {
      mockApi.addPillar.and.returnValue(Promise.resolve());

      await service.addPillar('Network');

      expect(mockApi.addPillar).toHaveBeenCalledWith('Network');
    });

    it('should remove a pillar', async () => {
      mockApi.removePillar.and.returnValue(Promise.resolve());

      await service.removePillar(1);

      expect(mockApi.removePillar).toHaveBeenCalledWith(1);
    });

    it('should edit a pillar', async () => {
      mockApi.editPillar.and.returnValue(Promise.resolve());

      await service.editPillar(1, 'Updated Identity');

      expect(mockApi.editPillar).toHaveBeenCalledWith(1, 'Updated Identity');
    });

    it('should save pillar order', async () => {
      const order = [2, 1, 3];
      mockApi.savePillarOrder.and.returnValue(Promise.resolve());

      await service.savePillarOrder(order);

      expect(mockApi.savePillarOrder).toHaveBeenCalledWith(order);
    });
  });

  describe('Function Capability Operations', () => {
    it('should get function capabilities', async () => {
      const mockFunctionCapabilities: FunctionCapability[] = [
        { id: 1, name: 'User Identity Management', type: 'Function', pillar_id: 1 },
        { id: 2, name: 'Device Registration', type: 'Capability', pillar_id: 2 }
      ];
      mockApi.getFunctionCapabilities.and.returnValue(Promise.resolve(mockFunctionCapabilities));

      const result = await service.getFunctionCapabilities();

      expect(mockApi.getFunctionCapabilities).toHaveBeenCalled();
      expect(result).toEqual(mockFunctionCapabilities);
    });

    it('should add a function capability', async () => {
      mockApi.addFunctionCapability.and.returnValue(Promise.resolve());

      await service.addFunctionCapability('New Function', 'Function', 1);

      expect(mockApi.addFunctionCapability).toHaveBeenCalledWith('New Function', 'Function', 1);
    });

    it('should remove a function capability', async () => {
      mockApi.removeFunctionCapability.and.returnValue(Promise.resolve());

      await service.removeFunctionCapability(1);

      expect(mockApi.removeFunctionCapability).toHaveBeenCalledWith(1);
    });

    it('should edit a function capability', async () => {
      mockApi.editFunctionCapability.and.returnValue(Promise.resolve());

      await service.editFunctionCapability(1, 'Updated Function', 'Capability', 2);

      expect(mockApi.editFunctionCapability).toHaveBeenCalledWith(1, 'Updated Function', 'Capability', 2);
    });

    it('should save function order', async () => {
      const order = [3, 1, 2];
      mockApi.saveFunctionOrder.and.returnValue(Promise.resolve());

      await service.saveFunctionOrder(order);

      expect(mockApi.saveFunctionOrder).toHaveBeenCalledWith(order);
    });
  });

  describe('Maturity Stage Operations', () => {
    it('should get maturity stages', async () => {
      const mockMaturityStages: MaturityStage[] = [
        { id: 1, name: 'Traditional' },
        { id: 2, name: 'Initial' },
        { id: 3, name: 'Advanced' },
        { id: 4, name: 'Optimal' }
      ];
      mockApi.getMaturityStages.and.returnValue(Promise.resolve(mockMaturityStages));

      const result = await service.getMaturityStages();

      expect(mockApi.getMaturityStages).toHaveBeenCalled();
      expect(result).toEqual(mockMaturityStages);
    });
  });

  describe('Technology Process Operations', () => {
    it('should get technologies processes for a function capability', async () => {
      const mockTechnologiesProcesses: TechnologyProcess[] = [
        { id: 1, description: 'Azure AD', type: 'Technology', function_capability_id: 1, maturity_stage_id: 2 },
        { id: 2, description: 'Identity Lifecycle', type: 'Process', function_capability_id: 1, maturity_stage_id: 3 }
      ];
      mockApi.getTechnologiesProcesses.and.returnValue(Promise.resolve(mockTechnologiesProcesses));

      const result = await service.getTechnologiesProcesses(1);

      expect(mockApi.getTechnologiesProcesses).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockTechnologiesProcesses);
    });

    it('should add a technology process', async () => {
      mockApi.addTechnologyProcess.and.returnValue(Promise.resolve());

      await service.addTechnologyProcess('New Technology', 'Technology', 1, 2);

      expect(mockApi.addTechnologyProcess).toHaveBeenCalledWith('New Technology', 'Technology', 1, 2);
    });

    it('should remove a technology process', async () => {
      mockApi.removeTechnologyProcess.and.returnValue(Promise.resolve());

      await service.removeTechnologyProcess(1);

      expect(mockApi.removeTechnologyProcess).toHaveBeenCalledWith(1);
    });

    it('should edit a technology process', async () => {
      mockApi.editTechnologyProcess.and.returnValue(Promise.resolve());

      await service.editTechnologyProcess(1, 'Updated Technology', 'Process', 2, 3);

      expect(mockApi.editTechnologyProcess).toHaveBeenCalledWith(1, 'Updated Technology', 'Process', 2, 3);
    });
  });

  describe('Assessment Operations', () => {
    it('should save an assessment without notes', async () => {
      mockApi.saveAssessment.and.returnValue(Promise.resolve());

      await service.saveAssessment(1, 'Fully Implemented');

      expect(mockApi.saveAssessment).toHaveBeenCalledWith(1, 'Fully Implemented', undefined);
    });

    it('should save an assessment with notes', async () => {
      mockApi.saveAssessment.and.returnValue(Promise.resolve());

      await service.saveAssessment(1, 'Partially Implemented', 'In progress');

      expect(mockApi.saveAssessment).toHaveBeenCalledWith(1, 'Partially Implemented', 'In progress');
    });

    it('should get assessment responses', async () => {
      const mockResponses: AssessmentResponse[] = [
        { id: 1, tech_process_id: 1, status: 'Fully Implemented', notes: 'Complete' },
        { id: 2, tech_process_id: 2, status: 'Not Implemented' }
      ];
      mockApi.getAssessmentResponses.and.returnValue(Promise.resolve(mockResponses));

      const result = await service.getAssessmentResponses();

      expect(mockApi.getAssessmentResponses).toHaveBeenCalled();
      expect(result).toEqual(mockResponses);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const errorMessage = 'Database connection failed';
      mockApi.getPillars.and.returnValue(Promise.reject(new Error(errorMessage)));

      try {
        await service.getPillars();
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe(errorMessage);
      }
    });

    it('should handle undefined API responses', async () => {
      mockApi.getPillars.and.returnValue(Promise.resolve(undefined));

      const result = await service.getPillars();

      expect(result).toBeUndefined();
    });
  });
});
