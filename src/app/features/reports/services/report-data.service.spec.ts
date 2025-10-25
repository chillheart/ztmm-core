import { TestBed } from '@angular/core/testing';
import { ReportDataService } from './report-data.service';
describe('ReportDataService', () => {
  let service: ReportDataService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportDataService);
  });
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should build pillar summaries with minimal valid input', () => {
    const pillars = [{ id: 1, name: 'Identity' }];
    const functionCapabilities = [{ id: 1, name: 'Auth', type: 'Function', pillar_id: 1 }];
    const maturityStages = [
      { id: 1, name: 'Traditional' },
      { id: 2, name: 'Initial' }
    ];
    const technologiesProcesses = [
      { id: 1, name: 'Password', description: '', type: 'Technology', function_capability_id: 1, maturity_stage_id: 1 }
    ];
    const assessmentResponses = [
      { id: 1, tech_process_id: 1, status: 'Fully Implemented' }
    ];
    const result = service.buildPillarSummaries(
      pillars as any,
      functionCapabilities as any,
      maturityStages as any,
      technologiesProcesses as any,
      assessmentResponses as any
    );
    expect(result.length).toBe(1);
    expect(result[0].pillar.name).toBe('Identity');
    expect(result[0].functions.length).toBe(1);
    expect(result[0].functions[0].functionCapability.name).toBe('Auth');
    expect(result[0].functions[0].assessedItems).toBe(1);
  });
  it('should return empty array for buildPillarSummaries with empty input', () => {
    const result = service.buildPillarSummaries([], [], [], [], []);
    expect(result).toEqual([]);
  });
  it('should build function details for a function with assessment', () => {
    const functionSummary = {
      functionCapability: { id: 1, name: 'Auth', type: 'Function', pillar_id: 1 },
      assessedItems: 1,
      totalItems: 1,
      assessmentPercentage: 100,
      overallMaturityStage: 'Traditional',
      actualMaturityStage: 'Traditional',
      maturityStageBreakdown: [],
      hasSequentialMaturityGap: false
    } as any;
    const pillars = [{ id: 1, name: 'Identity' }];
    const maturityStages = [{ id: 1, name: 'Traditional' }];
    const technologiesProcesses = [
      { id: 1, name: 'Password', description: 'desc', type: 'Technology', function_capability_id: 1, maturity_stage_id: 1 }
    ];
    const assessmentResponses = [
      { id: 1, tech_process_id: 1, status: 'Fully Implemented', notes: 'done' }
    ];
    const details = service.buildFunctionDetails(
      functionSummary,
      pillars as any,
      maturityStages as any,
      technologiesProcesses as any,
      assessmentResponses as any
    );
    expect(details.length).toBe(1);
    expect(details[0].pillarName).toBe('Identity');
    expect(details[0].status).toBe('Fully Implemented');
    expect(details[0].notes).toBe('done');
  });
  it('should return empty array for buildFunctionDetails with no tech/processes', () => {
    const functionSummary = {
      functionCapability: { id: 1, name: 'Auth', type: 'Function', pillar_id: 1 },
      assessedItems: 0,
      totalItems: 0,
      assessmentPercentage: 0,
      overallMaturityStage: 'Traditional',
      actualMaturityStage: 'Traditional',
      maturityStageBreakdown: [],
      hasSequentialMaturityGap: false
    } as any;
    const details = service.buildFunctionDetails(
      functionSummary,
      [{ id: 1, name: 'Identity' }] as any,
      [{ id: 1, name: 'Traditional' }] as any,
      [],
      []
    );
    expect(details).toEqual([]);
  });
  it('should handle missing assessment gracefully', () => {
    const functionSummary = {
      functionCapability: { id: 1, name: 'Auth', type: 'Function', pillar_id: 1 },
      assessedItems: 1,
      totalItems: 1,
      assessmentPercentage: 100,
      overallMaturityStage: 'Traditional',
      actualMaturityStage: 'Traditional',
      maturityStageBreakdown: [],
      hasSequentialMaturityGap: false
    } as any;
    const pillars = [{ id: 1, name: 'Identity' }];
    const maturityStages = [{ id: 1, name: 'Traditional' }];
    const technologiesProcesses = [
      { id: 1, name: 'Password', description: 'desc', type: 'Technology', function_capability_id: 1, maturity_stage_id: 1 }
    ];
    const assessmentResponses: any[] = [];
    const details = service.buildFunctionDetails(
      functionSummary,
      pillars as any,
      maturityStages as any,
      technologiesProcesses as any,
      assessmentResponses as any
    );
    expect(details.length).toBe(1);
    expect(details[0].status).toBe('Not Assessed');
  });

  // V2 Model Tests
  describe('V2 Model Support', () => {
    it('should build V2 pillar summaries with minimal valid input', () => {
      const pillars = [{ id: 1, name: 'Identity' }];
      const functionCapabilities = [{ id: 1, name: 'Auth', type: 'Function', pillar_id: 1 }];
      const maturityStages = [
        { id: 1, name: 'Traditional' },
        { id: 2, name: 'Initial' }
      ];
      const processTechnologyGroups = [
        {
          id: 1,
          name: 'Password Auth',
          description: 'Password-based authentication',
          type: 'Technology',
          function_capability_id: 1,
          maturity_stage_ids: [1]
        }
      ];
      const maturityStageImplementations = [
        {
          id: 1,
          process_technology_group_id: 1,
          maturity_stage_id: 1,
          implementation_description: 'Basic password implementation'
        }
      ];
      const assessments = [
        {
          id: 1,
          process_technology_group_id: 1,
          maturity_stage_id: 1,
          achieved_maturity_stage_id: 1,
          target_maturity_stage_id: 1,
          status: 'Fully Implemented'
        }
      ];

      const result = service.buildV2PillarSummaries(
        pillars as any,
        functionCapabilities as any,
        maturityStages as any,
        processTechnologyGroups as any,
        maturityStageImplementations as any,
        assessments as any
      );

      expect(result.length).toBe(1);
      expect(result[0].pillar.name).toBe('Identity');
      expect(result[0].functions.length).toBe(1);
      expect(result[0].functions[0].functionCapability.name).toBe('Auth');
    });

    it('should return empty array for buildV2PillarSummaries with empty input', () => {
      const result = service.buildV2PillarSummaries([], [], [], [], [], []);
      expect(result).toEqual([]);
    });

    it('should build V2 function details showing achieved stages', () => {
      const functionSummary = {
        functionCapability: { id: 1, name: 'Auth', type: 'Function', pillar_id: 1 },
        assessedItems: 1,
        totalItems: 1,
        assessmentPercentage: 100,
        overallMaturityStage: 'Initial',
        actualMaturityStage: 'Initial',
        maturityStageBreakdown: [],
        hasSequentialMaturityGap: false
      } as any;

      const pillars = [{ id: 1, name: 'Identity' }];
      const maturityStages = [
        { id: 1, name: 'Traditional' },
        { id: 2, name: 'Initial' }
      ];
      const processTechnologyGroups = [
        {
          id: 1,
          name: 'MFA',
          description: 'Multi-factor authentication',
          type: 'Technology',
          function_capability_id: 1,
          maturity_stage_ids: [1, 2]
        }
      ];
      const maturityStageImplementations = [
        {
          id: 1,
          process_technology_group_id: 1,
          maturity_stage_id: 1,
          implementation_description: 'Basic MFA'
        },
        {
          id: 2,
          process_technology_group_id: 1,
          maturity_stage_id: 2,
          implementation_description: 'Advanced MFA'
        }
      ];
      const assessments = [
        {
          id: 1,
          process_technology_group_id: 1,
          maturity_stage_id: 2,
          achieved_maturity_stage_id: 2,
          target_maturity_stage_id: 2,
          status: 'Fully Implemented',
          notes: 'Deployed to all users'
        }
      ];

      const details = service.buildV2FunctionDetails(
        functionSummary,
        pillars as any,
        maturityStages as any,
        processTechnologyGroups as any,
        maturityStageImplementations as any,
        assessments as any
      );

      expect(details.length).toBeGreaterThan(0);
      const detail = details.find(d => d.name.includes('MFA'));
      expect(detail).toBeTruthy();
      expect(detail?.status).toBe('Fully Implemented');
      expect(detail?.notes).toBe('Deployed to all users');
    });

    it('should handle V2 groups with multiple stages correctly', () => {
      const pillars = [{ id: 1, name: 'Identity' }];
      const functionCapabilities = [{ id: 1, name: 'Auth', type: 'Function', pillar_id: 1 }];
      const maturityStages = [
        { id: 1, name: 'Traditional' },
        { id: 2, name: 'Initial' },
        { id: 3, name: 'Advanced' }
      ];
      const processTechnologyGroups = [
        {
          id: 1,
          name: 'SSO',
          description: 'Single Sign-On',
          type: 'Technology',
          function_capability_id: 1,
          maturity_stage_ids: [1, 2, 3]
        }
      ];
      const maturityStageImplementations = [
        {
          id: 1,
          process_technology_group_id: 1,
          maturity_stage_id: 1,
          implementation_description: 'Basic SSO'
        },
        {
          id: 2,
          process_technology_group_id: 1,
          maturity_stage_id: 2,
          implementation_description: 'Federated SSO'
        },
        {
          id: 3,
          process_technology_group_id: 1,
          maturity_stage_id: 3,
          implementation_description: 'Advanced SSO with adaptive auth'
        }
      ];
      const assessments = [
        {
          id: 1,
          process_technology_group_id: 1,
          maturity_stage_id: 2,
          achieved_maturity_stage_id: 1,
          target_maturity_stage_id: 2,
          status: 'Partially Implemented'
        }
      ];

      const result = service.buildV2PillarSummaries(
        pillars as any,
        functionCapabilities as any,
        maturityStages as any,
        processTechnologyGroups as any,
        maturityStageImplementations as any,
        assessments as any
      );

      expect(result.length).toBe(1);
      expect(result[0].functions[0].assessedItems).toBeGreaterThan(0);
    });

    it('should count V2 assessed items correctly', () => {
      const processTechnologyGroups = [
        {
          id: 1,
          name: 'Group1',
          maturity_stage_ids: [1, 2]
        },
        {
          id: 2,
          name: 'Group2',
          maturity_stage_ids: [1]
        }
      ];
      const assessments = [
        { id: 1, process_technology_group_id: 1, maturity_stage_id: 1 },
        { id: 2, process_technology_group_id: 1, maturity_stage_id: 2 }
      ];

      const count = service['countV2AssessedItems'](processTechnologyGroups as any, assessments as any);
      expect(count).toBe(1); // Only group1 has assessments
    });

    it('should handle V2 groups with no assessments', () => {
      const pillars = [{ id: 1, name: 'Identity' }];
      const functionCapabilities = [{ id: 1, name: 'Auth', type: 'Function', pillar_id: 1 }];
      const maturityStages = [{ id: 1, name: 'Traditional' }];
      const processTechnologyGroups = [
        {
          id: 1,
          name: 'Unassessed Tech',
          type: 'Technology',
          function_capability_id: 1,
          maturity_stage_ids: [1]
        }
      ];
      const maturityStageImplementations = [
        {
          id: 1,
          process_technology_group_id: 1,
          maturity_stage_id: 1,
          implementation_description: 'Description'
        }
      ];
      const assessments: any[] = [];

      const result = service.buildV2PillarSummaries(
        pillars as any,
        functionCapabilities as any,
        maturityStages as any,
        processTechnologyGroups as any,
        maturityStageImplementations as any,
        assessments as any
      );

      expect(result.length).toBe(1);
      expect(result[0].functions[0].assessedItems).toBe(0);
    });
  });
});
