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
});
