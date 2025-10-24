import { TestBed } from '@angular/core/testing';
import { DataMigrationService } from './data-migration.service';
import { IndexedDBService } from './indexeddb.service';
import {
  TechnologyProcess,
  AssessmentResponse,
  MaturityStageId
} from '../models/ztmm.models';

describe('DataMigrationService', () => {
  let service: DataMigrationService;
  let indexedDBService: jasmine.SpyObj<IndexedDBService>;

  beforeEach(() => {
    const indexedDBServiceSpy = jasmine.createSpyObj('IndexedDBService', [
      'getTechnologiesProcesses',
      'getAssessmentResponses',
      'getFunctionCapabilities',
      'bulkImportV2Data',
      'getProcessTechnologyGroups',
      'deleteProcessTechnologyGroup'
    ]);

    TestBed.configureTestingModule({
      providers: [
        DataMigrationService,
        { provide: IndexedDBService, useValue: indexedDBServiceSpy }
      ]
    });

    service = TestBed.inject(DataMigrationService);
    indexedDBService = TestBed.inject(IndexedDBService) as jasmine.SpyObj<IndexedDBService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('validateV1Data', () => {
    it('should validate clean V1 data successfully', async () => {
      const mockTechProcesses: TechnologyProcess[] = [
        {
          id: 1,
          name: 'Multi-Factor Authentication',
          description: 'MFA for privileged accounts',
          type: 'Technology',
          function_capability_id: 1,
          maturity_stage_id: MaturityStageId.Initial
        },
        {
          id: 2,
          name: 'Multi-Factor Authentication - Advanced',
          description: 'MFA for all users',
          type: 'Technology',
          function_capability_id: 1,
          maturity_stage_id: MaturityStageId.Advanced
        }
      ];

      const mockAssessmentResponses: AssessmentResponse[] = [
        {
          id: 1,
          tech_process_id: 1,
          status: 'Fully Implemented',
          notes: 'MFA enabled for admins'
        }
      ];

      const mockFunctionCapabilities = [
        { id: 1, name: 'Authentication', type: 'Function' as const, pillar_id: 1 }
      ];

      indexedDBService.getTechnologiesProcesses.and.returnValue(Promise.resolve(mockTechProcesses));
      indexedDBService.getAssessmentResponses.and.returnValue(Promise.resolve(mockAssessmentResponses));
      indexedDBService.getFunctionCapabilities.and.returnValue(Promise.resolve(mockFunctionCapabilities));

      const result = await service.validateV1Data();

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
      // Note: Even though both processes have the same base name,
      // they're grouped separately since they have the same maturity stage IDs
      // and the grouping logic creates one group per function-name-type combo
      expect(result.groupsCreated).toBeGreaterThan(0);
    });

    it('should detect orphaned TechnologyProcess records', async () => {
      const mockTechProcesses: TechnologyProcess[] = [
        {
          id: 1,
          name: 'Orphaned Process',
          description: 'Has invalid function_capability_id',
          type: 'Process',
          function_capability_id: 999, // Non-existent
          maturity_stage_id: MaturityStageId.Initial
        }
      ];

      indexedDBService.getTechnologiesProcesses.and.returnValue(Promise.resolve(mockTechProcesses));
      indexedDBService.getAssessmentResponses.and.returnValue(Promise.resolve([]));
      indexedDBService.getFunctionCapabilities.and.returnValue(Promise.resolve([]));

      const result = await service.validateV1Data();

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('non-existent function_capability_id');
    });

    it('should detect orphaned AssessmentResponse records', async () => {
      const mockAssessmentResponses: AssessmentResponse[] = [
        {
          id: 1,
          tech_process_id: 999, // Non-existent
          status: 'Fully Implemented'
        }
      ];

      indexedDBService.getTechnologiesProcesses.and.returnValue(Promise.resolve([]));
      indexedDBService.getAssessmentResponses.and.returnValue(Promise.resolve(mockAssessmentResponses));
      indexedDBService.getFunctionCapabilities.and.returnValue(Promise.resolve([]));

      const result = await service.validateV1Data();

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('non-existent tech_process_id');
    });
  });

  describe('migrateV1ToV2', () => {
    it('should successfully migrate V1 data in dry run mode', async () => {
      const mockTechProcesses: TechnologyProcess[] = [
        {
          id: 1,
          name: 'User Creation Process',
          description: 'Manual user creation',
          type: 'Process',
          function_capability_id: 2,
          maturity_stage_id: MaturityStageId.Traditional
        },
        {
          id: 2,
          name: 'User Creation Process - Advanced',
          description: 'Automated user provisioning',
          type: 'Process',
          function_capability_id: 2,
          maturity_stage_id: MaturityStageId.Advanced
        }
      ];

      const mockAssessmentResponses: AssessmentResponse[] = [
        {
          id: 1,
          tech_process_id: 1,
          status: 'Fully Implemented',
          notes: 'Manual process in place'
        },
        {
          id: 2,
          tech_process_id: 2,
          status: 'Partially Implemented',
          notes: 'Automation in progress'
        }
      ];

      const mockFunctionCapabilities = [
        { id: 2, name: 'Identity Stores', type: 'Function' as const, pillar_id: 1 }
      ];

      indexedDBService.getTechnologiesProcesses.and.returnValue(Promise.resolve(mockTechProcesses));
      indexedDBService.getAssessmentResponses.and.returnValue(Promise.resolve(mockAssessmentResponses));
      indexedDBService.getFunctionCapabilities.and.returnValue(Promise.resolve(mockFunctionCapabilities));

      const result = await service.migrateV1ToV2({
        validateFirst: true,
        dryRun: true
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('Dry run completed');
      expect(result.migrationStats).toBeDefined();
      // Two separate processes with different stages = 2 groups
      expect(result.migrationStats!.processTechnologyGroupsCreated).toBe(2);
      expect(result.migrationStats!.maturityStageImplementationsCreated).toBe(2);
      expect(result.migrationStats!.assessmentsCreated).toBe(2);

      // Should not call bulkImportV2Data in dry run mode
      expect(indexedDBService.bulkImportV2Data).not.toHaveBeenCalled();
    });

    it('should successfully migrate and write V2 data when not in dry run mode', async () => {
      const mockTechProcesses: TechnologyProcess[] = [
        {
          id: 1,
          name: 'Firewall',
          description: 'Basic firewall',
          type: 'Technology',
          function_capability_id: 3,
          maturity_stage_id: MaturityStageId.Traditional
        }
      ];

      const mockAssessmentResponses: AssessmentResponse[] = [
        {
          id: 1,
          tech_process_id: 1,
          status: 'Fully Implemented'
        }
      ];

      const mockFunctionCapabilities = [
        { id: 3, name: 'Network Segmentation', type: 'Function' as const, pillar_id: 3 }
      ];

      indexedDBService.getTechnologiesProcesses.and.returnValue(Promise.resolve(mockTechProcesses));
      indexedDBService.getAssessmentResponses.and.returnValue(Promise.resolve(mockAssessmentResponses));
      indexedDBService.getFunctionCapabilities.and.returnValue(Promise.resolve(mockFunctionCapabilities));
      indexedDBService.bulkImportV2Data.and.returnValue(Promise.resolve());

      const result = await service.migrateV1ToV2({
        validateFirst: true,
        dryRun: false
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('Migration completed');
      expect(indexedDBService.bulkImportV2Data).toHaveBeenCalledTimes(1);

      const callArgs = indexedDBService.bulkImportV2Data.calls.mostRecent().args[0];
      expect(callArgs.processTechnologyGroups).toBeDefined();
      expect(callArgs.maturityStageImplementations).toBeDefined();
      expect(callArgs.assessments).toBeDefined();
      expect(callArgs.stageImplementationDetails).toBeDefined();
    });

    it('should abort migration if validation fails', async () => {
      const mockTechProcesses: TechnologyProcess[] = [
        {
          id: 1,
          name: 'Invalid Process',
          description: 'Has invalid FK',
          type: 'Process',
          function_capability_id: 999, // Invalid
          maturity_stage_id: MaturityStageId.Initial
        }
      ];

      indexedDBService.getTechnologiesProcesses.and.returnValue(Promise.resolve(mockTechProcesses));
      indexedDBService.getAssessmentResponses.and.returnValue(Promise.resolve([]));
      indexedDBService.getFunctionCapabilities.and.returnValue(Promise.resolve([]));

      const result = await service.migrateV1ToV2({
        validateFirst: true,
        dryRun: false
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Validation failed');
      expect(indexedDBService.bulkImportV2Data).not.toHaveBeenCalled();
    });

    it('should skip validation when validateFirst is false', async () => {
      indexedDBService.getTechnologiesProcesses.and.returnValue(Promise.resolve([]));
      indexedDBService.getAssessmentResponses.and.returnValue(Promise.resolve([]));
      indexedDBService.bulkImportV2Data.and.returnValue(Promise.resolve());

      const result = await service.migrateV1ToV2({
        validateFirst: false,
        dryRun: false
      });

      expect(result.success).toBe(true);
      expect(indexedDBService.getFunctionCapabilities).not.toHaveBeenCalled();
    });
  });

  describe('hasV2Data', () => {
    it('should return true when V2 data exists', async () => {
      indexedDBService.getProcessTechnologyGroups.and.returnValue(Promise.resolve([
        {
          id: 1,
          name: 'Test Group',
          description: 'Test',
          type: 'Technology',
          function_capability_id: 1,
          order_index: 1
        }
      ]));

      const hasData = await service.hasV2Data();

      expect(hasData).toBe(true);
    });

    it('should return false when no V2 data exists', async () => {
      indexedDBService.getProcessTechnologyGroups.and.returnValue(Promise.resolve([]));

      const hasData = await service.hasV2Data();

      expect(hasData).toBe(false);
    });
  });

  describe('rollbackV2Data', () => {
    it('should successfully rollback V2 data', async () => {
      const mockGroups = [
        {
          id: 1,
          name: 'Group 1',
          description: 'Test',
          type: 'Technology' as const,
          function_capability_id: 1,
          order_index: 1
        },
        {
          id: 2,
          name: 'Group 2',
          description: 'Test',
          type: 'Process' as const,
          function_capability_id: 2,
          order_index: 2
        }
      ];

      indexedDBService.getProcessTechnologyGroups.and.returnValue(Promise.resolve(mockGroups));
      indexedDBService.deleteProcessTechnologyGroup.and.returnValue(Promise.resolve());

      const result = await service.rollbackV2Data();

      expect(result.success).toBe(true);
      expect(result.message).toContain('rolled back successfully');
      expect(indexedDBService.deleteProcessTechnologyGroup).toHaveBeenCalledTimes(2);
    });

    it('should handle rollback errors gracefully', async () => {
      indexedDBService.getProcessTechnologyGroups.and.returnValue(
        Promise.reject(new Error('Database error'))
      );

      const result = await service.rollbackV2Data();

      expect(result.success).toBe(false);
      expect(result.message).toContain('Rollback failed');
    });
  });
});
