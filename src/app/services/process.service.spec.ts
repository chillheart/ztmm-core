import { TestBed } from '@angular/core/testing';
import { ProcessService } from './process.service';
import { IndexedDBService } from './indexeddb.service';
import {
  ProcessTechnologyGroup,
  MaturityStageImplementation,
  Assessment,
  StageImplementationDetail,
  MaturityStageId
} from '../models/ztmm.models';

describe('ProcessService', () => {
  let service: ProcessService;
  let indexedDBService: jasmine.SpyObj<IndexedDBService>;

  const mockProcess1: ProcessTechnologyGroup = {
    id: 1,
    name: 'User Onboarding',
    description: 'Process for onboarding new users',
    type: 'Process',
    function_capability_id: 1,
    order_index: 0
  };

  const mockProcess2: ProcessTechnologyGroup = {
    id: 2,
    name: 'Access Review',
    description: 'Periodic access review process',
    type: 'Process',
    function_capability_id: 1,
    order_index: 1
  };

  const mockTechnology: ProcessTechnologyGroup = {
    id: 3,
    name: 'SSO System',
    description: 'Single sign-on technology',
    type: 'Technology',
    function_capability_id: 1,
    order_index: 0
  };

  const mockStage1: MaturityStageImplementation = {
    id: 1,
    process_technology_group_id: 1,
    maturity_stage_id: MaturityStageId.Initial,
    description: 'Basic onboarding process',
    order_index: 0
  };

  const mockStage2: MaturityStageImplementation = {
    id: 2,
    process_technology_group_id: 1,
    maturity_stage_id: MaturityStageId.Advanced,
    description: 'Advanced onboarding with automation',
    order_index: 1
  };

  const mockAssessment: Assessment = {
    id: 1,
    process_technology_group_id: 1,
    achieved_maturity_stage_id: MaturityStageId.Initial,
    target_maturity_stage_id: MaturityStageId.Advanced,
    implementation_status: 'Partially Implemented',
    notes: 'In progress',
    last_updated: '2025-10-24T00:00:00.000Z'
  };

  const mockDetail: StageImplementationDetail = {
    id: 1,
    assessment_id: 1,
    maturity_stage_id: MaturityStageId.Initial,
    status: 'Completed',
    completion_percentage: 100,
    notes: 'Basic process in place'
  };

  beforeEach(() => {
    const indexedDBServiceSpy = jasmine.createSpyObj('IndexedDBService', [
      'getProcessTechnologyGroups',
      'addProcessTechnologyGroup',
      'updateProcessTechnologyGroup',
      'deleteProcessTechnologyGroup',
      'getMaturityStageImplementations',
      'addMaturityStageImplementation',
      'updateMaturityStageImplementation',
      'deleteMaturityStageImplementation',
      'getAssessmentsV2',
      'addAssessment',
      'updateAssessment',
      'deleteAssessment',
      'getStageImplementationDetails',
      'addStageImplementationDetail',
      'updateStageImplementationDetail',
      'deleteStageImplementationDetail'
    ]);

    TestBed.configureTestingModule({
      providers: [
        ProcessService,
        { provide: IndexedDBService, useValue: indexedDBServiceSpy }
      ]
    });

    service = TestBed.inject(ProcessService);
    indexedDBService = TestBed.inject(IndexedDBService) as jasmine.SpyObj<IndexedDBService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProcesses', () => {
    it('should return only Process-type groups', async () => {
      indexedDBService.getProcessTechnologyGroups.and.returnValue(
        Promise.resolve([mockProcess1, mockProcess2, mockTechnology])
      );

      const result = await service.getProcesses();

      expect(result.length).toBe(2);
      expect(result[0].type).toBe('Process');
      expect(result[1].type).toBe('Process');
      expect(result.every(p => p.type === 'Process')).toBe(true);
    });

    it('should filter by function capability ID', async () => {
      const mockProcess3: ProcessTechnologyGroup = {
        ...mockProcess1,
        id: 4,
        function_capability_id: 2
      };

      indexedDBService.getProcessTechnologyGroups.and.returnValue(
        Promise.resolve([mockProcess1, mockProcess2, mockProcess3])
      );

      const result = await service.getProcesses(1);

      expect(result.length).toBe(2);
      expect(result.every(p => p.function_capability_id === 1)).toBe(true);
    });

    it('should return processes sorted by order_index', async () => {
      const unordered = [
        { ...mockProcess1, order_index: 5 },
        { ...mockProcess2, order_index: 1 }
      ];

      indexedDBService.getProcessTechnologyGroups.and.returnValue(
        Promise.resolve(unordered)
      );

      const result = await service.getProcesses();

      expect(result[0].order_index).toBe(1);
      expect(result[1].order_index).toBe(5);
    });
  });

  describe('getProcess', () => {
    it('should return a specific process by ID', async () => {
      indexedDBService.getProcessTechnologyGroups.and.returnValue(
        Promise.resolve([mockProcess1, mockProcess2])
      );

      const result = await service.getProcess(2);

      expect(result).toBeDefined();
      expect(result?.id).toBe(2);
      expect(result?.name).toBe('Access Review');
    });

    it('should return undefined for non-existent process', async () => {
      indexedDBService.getProcessTechnologyGroups.and.returnValue(
        Promise.resolve([mockProcess1, mockProcess2])
      );

      const result = await service.getProcess(999);

      expect(result).toBeUndefined();
    });
  });

  describe('getProcessWithStages', () => {
    it('should return process with its stages', async () => {
      indexedDBService.getProcessTechnologyGroups.and.returnValue(
        Promise.resolve([mockProcess1])
      );
      indexedDBService.getMaturityStageImplementations.and.returnValue(
        Promise.resolve([mockStage1, mockStage2])
      );

      const result = await service.getProcessWithStages(1);

      expect(result).toBeDefined();
      expect(result?.process.id).toBe(1);
      expect(result?.stages.length).toBe(2);
      expect(result?.stages[0].order_index).toBe(0);
      expect(result?.stages[1].order_index).toBe(1);
    });

    it('should return undefined for non-existent process', async () => {
      indexedDBService.getProcessTechnologyGroups.and.returnValue(
        Promise.resolve([])
      );

      const result = await service.getProcessWithStages(999);

      expect(result).toBeUndefined();
    });
  });

  describe('getProcessAssessment', () => {
    it('should return assessment for a process', async () => {
      indexedDBService.getAssessmentsV2.and.returnValue(
        Promise.resolve([mockAssessment])
      );

      const result = await service.getProcessAssessment(1);

      expect(result).toBeDefined();
      expect(result?.process_technology_group_id).toBe(1);
    });

    it('should return undefined if no assessment exists', async () => {
      indexedDBService.getAssessmentsV2.and.returnValue(
        Promise.resolve([])
      );

      const result = await service.getProcessAssessment(1);

      expect(result).toBeUndefined();
    });
  });

  describe('getProcessAssessmentWithDetails', () => {
    it('should return assessment with stage details', async () => {
      indexedDBService.getAssessmentsV2.and.returnValue(
        Promise.resolve([mockAssessment])
      );
      indexedDBService.getStageImplementationDetails.and.returnValue(
        Promise.resolve([mockDetail])
      );

      const result = await service.getProcessAssessmentWithDetails(1);

      expect(result).toBeDefined();
      expect(result?.assessment.id).toBe(1);
      expect(result?.details.length).toBe(1);
      expect(result?.details[0].assessment_id).toBe(1);
    });

    it('should return undefined if no assessment exists', async () => {
      indexedDBService.getAssessmentsV2.and.returnValue(
        Promise.resolve([])
      );

      const result = await service.getProcessAssessmentWithDetails(1);

      expect(result).toBeUndefined();
    });
  });

  describe('addProcess', () => {
    it('should add a process with type enforced', async () => {
      const newProcess: Omit<ProcessTechnologyGroup, 'id'> = {
        name: 'New Process',
        description: 'Test process',
        type: 'Technology', // Should be overridden
        function_capability_id: 1,
        order_index: 0
      };

      indexedDBService.addProcessTechnologyGroup.and.returnValue(Promise.resolve(10));

      const id = await service.addProcess(newProcess);

      expect(id).toBe(10);
      expect(indexedDBService.addProcessTechnologyGroup).toHaveBeenCalledWith(
        jasmine.objectContaining({ type: 'Process' })
      );
    });
  });

  describe('updateProcess', () => {
    it('should update a process with type enforced', async () => {
      const updatedProcess: ProcessTechnologyGroup = {
        ...mockProcess1,
        type: 'Technology', // Should be overridden
        name: 'Updated Process'
      };

      indexedDBService.updateProcessTechnologyGroup.and.returnValue(Promise.resolve());

      await service.updateProcess(updatedProcess);

      expect(indexedDBService.updateProcessTechnologyGroup).toHaveBeenCalledWith(
        jasmine.objectContaining({ type: 'Process', name: 'Updated Process' })
      );
    });
  });

  describe('deleteProcess', () => {
    it('should perform cascading delete of process and related data', async () => {
      indexedDBService.getMaturityStageImplementations.and.returnValue(
        Promise.resolve([mockStage1, mockStage2])
      );
      indexedDBService.getAssessmentsV2.and.returnValue(
        Promise.resolve([mockAssessment])
      );
      indexedDBService.getStageImplementationDetails.and.returnValue(
        Promise.resolve([mockDetail])
      );
      indexedDBService.deleteStageImplementationDetail.and.returnValue(Promise.resolve());
      indexedDBService.deleteAssessment.and.returnValue(Promise.resolve());
      indexedDBService.deleteMaturityStageImplementation.and.returnValue(Promise.resolve());
      indexedDBService.deleteProcessTechnologyGroup.and.returnValue(Promise.resolve());

      await service.deleteProcess(1);

      expect(indexedDBService.deleteStageImplementationDetail).toHaveBeenCalledWith(1);
      expect(indexedDBService.deleteAssessment).toHaveBeenCalledWith(1);
      expect(indexedDBService.deleteMaturityStageImplementation).toHaveBeenCalledTimes(2);
      expect(indexedDBService.deleteProcessTechnologyGroup).toHaveBeenCalledWith(1);
    });

    it('should handle deletion when no assessment exists', async () => {
      indexedDBService.getMaturityStageImplementations.and.returnValue(
        Promise.resolve([mockStage1])
      );
      indexedDBService.getAssessmentsV2.and.returnValue(
        Promise.resolve([])
      );
      indexedDBService.deleteMaturityStageImplementation.and.returnValue(Promise.resolve());
      indexedDBService.deleteProcessTechnologyGroup.and.returnValue(Promise.resolve());

      await service.deleteProcess(1);

      expect(indexedDBService.deleteAssessment).not.toHaveBeenCalled();
      expect(indexedDBService.deleteMaturityStageImplementation).toHaveBeenCalledWith(1);
      expect(indexedDBService.deleteProcessTechnologyGroup).toHaveBeenCalledWith(1);
    });
  });

  describe('stage management', () => {
    it('should add a process stage', async () => {
      const newStage: Omit<MaturityStageImplementation, 'id'> = {
        process_technology_group_id: 1,
        maturity_stage_id: MaturityStageId.Optimal,
        description: 'Optimal stage',
        order_index: 2
      };

      indexedDBService.addMaturityStageImplementation.and.returnValue(Promise.resolve(5));

      const id = await service.addProcessStage(newStage);

      expect(id).toBe(5);
      expect(indexedDBService.addMaturityStageImplementation).toHaveBeenCalledWith(newStage);
    });

    it('should update a process stage', async () => {
      indexedDBService.updateMaturityStageImplementation.and.returnValue(Promise.resolve());

      await service.updateProcessStage(mockStage1);

      expect(indexedDBService.updateMaturityStageImplementation).toHaveBeenCalledWith(mockStage1);
    });

    it('should delete a process stage', async () => {
      indexedDBService.deleteMaturityStageImplementation.and.returnValue(Promise.resolve());

      await service.deleteProcessStage(1);

      expect(indexedDBService.deleteMaturityStageImplementation).toHaveBeenCalledWith(1);
    });
  });

  describe('saveProcessAssessment', () => {
    it('should create a new assessment', async () => {
      const newAssessment: Omit<Assessment, 'id'> = {
        process_technology_group_id: 1,
        achieved_maturity_stage_id: MaturityStageId.Initial,
        target_maturity_stage_id: MaturityStageId.Advanced,
        implementation_status: 'Partially Implemented',
        notes: 'New assessment',
        last_updated: '2025-10-24T00:00:00.000Z'
      };

      indexedDBService.addAssessment.and.returnValue(Promise.resolve(10));

      const id = await service.saveProcessAssessment(newAssessment);

      expect(id).toBe(10);
      expect(indexedDBService.addAssessment).toHaveBeenCalledWith(newAssessment);
    });

    it('should update an existing assessment', async () => {
      indexedDBService.updateAssessment.and.returnValue(Promise.resolve());

      const id = await service.saveProcessAssessment(mockAssessment);

      expect(id).toBe(1);
      expect(indexedDBService.updateAssessment).toHaveBeenCalledWith(mockAssessment);
    });
  });

  describe('stage detail management', () => {
    it('should add a stage detail', async () => {
      const newDetail: Omit<StageImplementationDetail, 'id'> = {
        assessment_id: 1,
        maturity_stage_id: MaturityStageId.Initial,
        status: 'In Progress',
        completion_percentage: 50,
        notes: 'Working on it'
      };

      indexedDBService.addStageImplementationDetail.and.returnValue(Promise.resolve(5));

      const id = await service.addStageDetail(newDetail);

      expect(id).toBe(5);
      expect(indexedDBService.addStageImplementationDetail).toHaveBeenCalledWith(newDetail);
    });

    it('should update a stage detail', async () => {
      indexedDBService.updateStageImplementationDetail.and.returnValue(Promise.resolve());

      await service.updateStageDetail(mockDetail);

      expect(indexedDBService.updateStageImplementationDetail).toHaveBeenCalledWith(mockDetail);
    });

    it('should delete a stage detail', async () => {
      indexedDBService.deleteStageImplementationDetail.and.returnValue(Promise.resolve());

      await service.deleteStageDetail(1);

      expect(indexedDBService.deleteStageImplementationDetail).toHaveBeenCalledWith(1);
    });
  });

  describe('getProcessCount', () => {
    it('should return total count of processes', async () => {
      indexedDBService.getProcessTechnologyGroups.and.returnValue(
        Promise.resolve([mockProcess1, mockProcess2, mockTechnology])
      );

      const count = await service.getProcessCount();

      expect(count).toBe(2);
    });

    it('should return count filtered by function capability', async () => {
      const mockProcess3: ProcessTechnologyGroup = {
        ...mockProcess1,
        id: 4,
        function_capability_id: 2
      };

      indexedDBService.getProcessTechnologyGroups.and.returnValue(
        Promise.resolve([mockProcess1, mockProcess2, mockProcess3])
      );

      const count = await service.getProcessCount(1);

      expect(count).toBe(2);
    });
  });

  describe('reorderProcesses', () => {
    it('should update order_index for processes', async () => {
      indexedDBService.getProcessTechnologyGroups.and.returnValue(
        Promise.resolve([mockProcess1, mockProcess2])
      );
      indexedDBService.updateProcessTechnologyGroup.and.returnValue(Promise.resolve());

      await service.reorderProcesses(1, [2, 1]);

      expect(indexedDBService.updateProcessTechnologyGroup).toHaveBeenCalledTimes(2);
      expect(indexedDBService.updateProcessTechnologyGroup).toHaveBeenCalledWith(
        jasmine.objectContaining({ id: 2, order_index: 0 })
      );
      expect(indexedDBService.updateProcessTechnologyGroup).toHaveBeenCalledWith(
        jasmine.objectContaining({ id: 1, order_index: 1 })
      );
    });
  });
});
