import { TestBed } from '@angular/core/testing';
import { TechnologyService } from './technology.service';
import { IndexedDBService } from './indexeddb.service';
import {
  ProcessTechnologyGroup,
  MaturityStageImplementation,
  Assessment,
  StageImplementationDetail,
  MaturityStageId
} from '../models/ztmm.models';

describe('TechnologyService', () => {
  let service: TechnologyService;
  let indexedDBService: jasmine.SpyObj<IndexedDBService>;

  const mockTechnology1: ProcessTechnologyGroup = {
    id: 1,
    name: 'Multi-Factor Authentication',
    description: 'MFA system for authentication',
    type: 'Technology',
    function_capability_id: 1,
    order_index: 0
  };

  const mockTechnology2: ProcessTechnologyGroup = {
    id: 2,
    name: 'Single Sign-On',
    description: 'SSO solution',
    type: 'Technology',
    function_capability_id: 1,
    order_index: 1
  };

  const mockProcess: ProcessTechnologyGroup = {
    id: 3,
    name: 'User Onboarding',
    description: 'Process for onboarding',
    type: 'Process',
    function_capability_id: 1,
    order_index: 0
  };

  const mockStage1: MaturityStageImplementation = {
    id: 1,
    process_technology_group_id: 1,
    maturity_stage_id: MaturityStageId.Initial,
    description: 'Basic MFA implementation',
    order_index: 0
  };

  const mockStage2: MaturityStageImplementation = {
    id: 2,
    process_technology_group_id: 1,
    maturity_stage_id: MaturityStageId.Advanced,
    description: 'Advanced MFA with biometrics',
    order_index: 1
  };

  const mockAssessment: Assessment = {
    id: 1,
    process_technology_group_id: 1,
    achieved_maturity_stage_id: MaturityStageId.Initial,
    target_maturity_stage_id: MaturityStageId.Advanced,
    implementation_status: 'Partially Implemented',
    notes: 'Working on advanced features',
    last_updated: '2025-10-24T00:00:00.000Z'
  };

  const mockDetail: StageImplementationDetail = {
    id: 1,
    assessment_id: 1,
    maturity_stage_id: MaturityStageId.Initial,
    status: 'Completed',
    completion_percentage: 100,
    notes: 'Basic implementation complete'
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
        TechnologyService,
        { provide: IndexedDBService, useValue: indexedDBServiceSpy }
      ]
    });

    service = TestBed.inject(TechnologyService);
    indexedDBService = TestBed.inject(IndexedDBService) as jasmine.SpyObj<IndexedDBService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTechnologies', () => {
    it('should return only Technology-type groups', async () => {
      indexedDBService.getProcessTechnologyGroups.and.returnValue(
        Promise.resolve([mockTechnology1, mockTechnology2, mockProcess])
      );

      const result = await service.getTechnologies();

      expect(result.length).toBe(2);
      expect(result[0].type).toBe('Technology');
      expect(result[1].type).toBe('Technology');
      expect(result.every(t => t.type === 'Technology')).toBe(true);
    });

    it('should filter by function capability ID', async () => {
      const mockTechnology3: ProcessTechnologyGroup = {
        ...mockTechnology1,
        id: 4,
        function_capability_id: 2
      };

      indexedDBService.getProcessTechnologyGroups.and.returnValue(
        Promise.resolve([mockTechnology1, mockTechnology2, mockTechnology3])
      );

      const result = await service.getTechnologies(1);

      expect(result.length).toBe(2);
      expect(result.every(t => t.function_capability_id === 1)).toBe(true);
    });

    it('should return technologies sorted by order_index', async () => {
      const unordered = [
        { ...mockTechnology1, order_index: 5 },
        { ...mockTechnology2, order_index: 1 }
      ];

      indexedDBService.getProcessTechnologyGroups.and.returnValue(
        Promise.resolve(unordered)
      );

      const result = await service.getTechnologies();

      expect(result[0].order_index).toBe(1);
      expect(result[1].order_index).toBe(5);
    });
  });

  describe('getTechnology', () => {
    it('should return a specific technology by ID', async () => {
      indexedDBService.getProcessTechnologyGroups.and.returnValue(
        Promise.resolve([mockTechnology1, mockTechnology2])
      );

      const result = await service.getTechnology(2);

      expect(result).toBeDefined();
      expect(result?.id).toBe(2);
      expect(result?.name).toBe('Single Sign-On');
    });

    it('should return undefined for non-existent technology', async () => {
      indexedDBService.getProcessTechnologyGroups.and.returnValue(
        Promise.resolve([mockTechnology1, mockTechnology2])
      );

      const result = await service.getTechnology(999);

      expect(result).toBeUndefined();
    });
  });

  describe('getTechnologyWithStages', () => {
    it('should return technology with its stages', async () => {
      indexedDBService.getProcessTechnologyGroups.and.returnValue(
        Promise.resolve([mockTechnology1])
      );
      indexedDBService.getMaturityStageImplementations.and.returnValue(
        Promise.resolve([mockStage1, mockStage2])
      );

      const result = await service.getTechnologyWithStages(1);

      expect(result).toBeDefined();
      expect(result?.technology.id).toBe(1);
      expect(result?.stages.length).toBe(2);
      expect(result?.stages[0].order_index).toBe(0);
      expect(result?.stages[1].order_index).toBe(1);
    });

    it('should return undefined for non-existent technology', async () => {
      indexedDBService.getProcessTechnologyGroups.and.returnValue(
        Promise.resolve([])
      );

      const result = await service.getTechnologyWithStages(999);

      expect(result).toBeUndefined();
    });
  });

  describe('getTechnologyAssessment', () => {
    it('should return assessment for a technology', async () => {
      indexedDBService.getAssessmentsV2.and.returnValue(
        Promise.resolve([mockAssessment])
      );

      const result = await service.getTechnologyAssessment(1);

      expect(result).toBeDefined();
      expect(result?.process_technology_group_id).toBe(1);
    });

    it('should return undefined if no assessment exists', async () => {
      indexedDBService.getAssessmentsV2.and.returnValue(
        Promise.resolve([])
      );

      const result = await service.getTechnologyAssessment(1);

      expect(result).toBeUndefined();
    });
  });

  describe('getTechnologyAssessmentWithDetails', () => {
    it('should return assessment with stage details', async () => {
      indexedDBService.getAssessmentsV2.and.returnValue(
        Promise.resolve([mockAssessment])
      );
      indexedDBService.getStageImplementationDetails.and.returnValue(
        Promise.resolve([mockDetail])
      );

      const result = await service.getTechnologyAssessmentWithDetails(1);

      expect(result).toBeDefined();
      expect(result?.assessment.id).toBe(1);
      expect(result?.details.length).toBe(1);
      expect(result?.details[0].assessment_id).toBe(1);
    });

    it('should return undefined if no assessment exists', async () => {
      indexedDBService.getAssessmentsV2.and.returnValue(
        Promise.resolve([])
      );

      const result = await service.getTechnologyAssessmentWithDetails(1);

      expect(result).toBeUndefined();
    });
  });

  describe('addTechnology', () => {
    it('should add a technology with type enforced', async () => {
      const newTechnology: Omit<ProcessTechnologyGroup, 'id'> = {
        name: 'New Technology',
        description: 'Test technology',
        type: 'Process', // Should be overridden
        function_capability_id: 1,
        order_index: 0
      };

      indexedDBService.addProcessTechnologyGroup.and.returnValue(Promise.resolve(10));

      const id = await service.addTechnology(newTechnology);

      expect(id).toBe(10);
      expect(indexedDBService.addProcessTechnologyGroup).toHaveBeenCalledWith(
        jasmine.objectContaining({ type: 'Technology' })
      );
    });
  });

  describe('updateTechnology', () => {
    it('should update a technology with type enforced', async () => {
      const updatedTechnology: ProcessTechnologyGroup = {
        ...mockTechnology1,
        type: 'Process', // Should be overridden
        name: 'Updated Technology'
      };

      indexedDBService.updateProcessTechnologyGroup.and.returnValue(Promise.resolve());

      await service.updateTechnology(updatedTechnology);

      expect(indexedDBService.updateProcessTechnologyGroup).toHaveBeenCalledWith(
        jasmine.objectContaining({ type: 'Technology', name: 'Updated Technology' })
      );
    });
  });

  describe('deleteTechnology', () => {
    it('should perform cascading delete of technology and related data', async () => {
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

      await service.deleteTechnology(1);

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

      await service.deleteTechnology(1);

      expect(indexedDBService.deleteAssessment).not.toHaveBeenCalled();
      expect(indexedDBService.deleteMaturityStageImplementation).toHaveBeenCalledWith(1);
      expect(indexedDBService.deleteProcessTechnologyGroup).toHaveBeenCalledWith(1);
    });
  });

  describe('stage management', () => {
    it('should add a technology stage', async () => {
      const newStage: Omit<MaturityStageImplementation, 'id'> = {
        process_technology_group_id: 1,
        maturity_stage_id: MaturityStageId.Optimal,
        description: 'Optimal stage',
        order_index: 2
      };

      indexedDBService.addMaturityStageImplementation.and.returnValue(Promise.resolve(5));

      const id = await service.addTechnologyStage(newStage);

      expect(id).toBe(5);
      expect(indexedDBService.addMaturityStageImplementation).toHaveBeenCalledWith(newStage);
    });

    it('should update a technology stage', async () => {
      indexedDBService.updateMaturityStageImplementation.and.returnValue(Promise.resolve());

      await service.updateTechnologyStage(mockStage1);

      expect(indexedDBService.updateMaturityStageImplementation).toHaveBeenCalledWith(mockStage1);
    });

    it('should delete a technology stage', async () => {
      indexedDBService.deleteMaturityStageImplementation.and.returnValue(Promise.resolve());

      await service.deleteTechnologyStage(1);

      expect(indexedDBService.deleteMaturityStageImplementation).toHaveBeenCalledWith(1);
    });
  });

  describe('saveTechnologyAssessment', () => {
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

      const id = await service.saveTechnologyAssessment(newAssessment);

      expect(id).toBe(10);
      expect(indexedDBService.addAssessment).toHaveBeenCalledWith(newAssessment);
    });

    it('should update an existing assessment', async () => {
      indexedDBService.updateAssessment.and.returnValue(Promise.resolve());

      const id = await service.saveTechnologyAssessment(mockAssessment);

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

  describe('getTechnologyCount', () => {
    it('should return total count of technologies', async () => {
      indexedDBService.getProcessTechnologyGroups.and.returnValue(
        Promise.resolve([mockTechnology1, mockTechnology2, mockProcess])
      );

      const count = await service.getTechnologyCount();

      expect(count).toBe(2);
    });

    it('should return count filtered by function capability', async () => {
      const mockTechnology3: ProcessTechnologyGroup = {
        ...mockTechnology1,
        id: 4,
        function_capability_id: 2
      };

      indexedDBService.getProcessTechnologyGroups.and.returnValue(
        Promise.resolve([mockTechnology1, mockTechnology2, mockTechnology3])
      );

      const count = await service.getTechnologyCount(1);

      expect(count).toBe(2);
    });
  });

  describe('reorderTechnologies', () => {
    it('should update order_index for technologies', async () => {
      indexedDBService.getProcessTechnologyGroups.and.returnValue(
        Promise.resolve([mockTechnology1, mockTechnology2])
      );
      indexedDBService.updateProcessTechnologyGroup.and.returnValue(Promise.resolve());

      await service.reorderTechnologies(1, [2, 1]);

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
