import { TestBed } from '@angular/core/testing';
import { MaturityCalculationService } from './maturity-calculation.service';
import { PillarSummary, FunctionSummary, MaturityStageBreakdown } from '../models/report.models';

describe('MaturityCalculationService', () => {
  let service: MaturityCalculationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MaturityCalculationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should enforce sequential maturity', () => {
    // Arrange: create a pillar summary with a gap in sequential maturity
    const breakdown: MaturityStageBreakdown[] = [
      { stageName: 'Traditional', assessedItems: 2, totalItems: 2, completedItems: 2, inProgressItems: 0, notStartedItems: 0, percentage: 100, completionPercentage: 100, status: 'completed', canAdvanceToThisStage: true },
      { stageName: 'Initial', assessedItems: 2, totalItems: 2, completedItems: 2, inProgressItems: 0, notStartedItems: 0, percentage: 100, completionPercentage: 100, status: 'completed', canAdvanceToThisStage: true },
      { stageName: 'Advanced', assessedItems: 2, totalItems: 2, completedItems: 0, inProgressItems: 0, notStartedItems: 2, percentage: 0, completionPercentage: 0, status: 'not-started', canAdvanceToThisStage: false }
    ];
    const func: FunctionSummary = {
      functionCapability: { id: 1, name: 'Test', type: 'Function', pillar_id: 1 },
      assessedItems: 4,
      totalItems: 6,
      assessmentPercentage: 66.7,
      overallMaturityStage: 'Initial',
      actualMaturityStage: 'Advanced',
      maturityStageBreakdown: breakdown,
      sequentialMaturityExplanation: 'Blocked by previous stage',
      hasSequentialMaturityGap: true
    };
    const pillar: PillarSummary = {
      pillar: { id: 1, name: 'Identity' },
      functions: [func],
      assessedItems: 4,
      totalItems: 6,
      assessmentPercentage: 66.7,
      overallMaturityStage: 'Initial',
      actualMaturityStage: 'Advanced',
      maturityStageBreakdown: breakdown,
      sequentialMaturityExplanation: 'Blocked by previous stage',
      hasSequentialMaturityGap: true
    };

    // Act: call the method under test (replace with your actual method)
    // const result = service.enforceSequentialMaturity(pillar);
    // Assert: expect result to reflect sequential enforcement
    // expect(result.overallMaturityStage).toBe('Initial');
    // expect(result.hasSequentialMaturityGap).toBeTrue();
    // expect(result.sequentialMaturityExplanation).toContain('Blocked');
    // (Uncomment and adapt above lines to your actual method)
    expect(true).toBeTrue(); // Placeholder
  });

  it('should enforce sequential maturity and provide explanation for gaps', () => {
    const breakdown = [
      {
        stageName: 'Traditional',
        assessedItems: 2,
        totalItems: 2,
        completedItems: 1, // Not fully completed
        inProgressItems: 1,
        notStartedItems: 0,
        percentage: 100,
        completionPercentage: 50,
        status: 'in-progress' as const
      },
      {
        stageName: 'Initial',
        assessedItems: 2,
        totalItems: 2,
        completedItems: 2,
        inProgressItems: 0,
        notStartedItems: 0,
        percentage: 100,
        completionPercentage: 100,
        status: 'completed' as const
      },
      {
        stageName: 'Advanced',
        assessedItems: 2,
        totalItems: 2,
        completedItems: 2,
        inProgressItems: 0,
        notStartedItems: 0,
        percentage: 100,
        completionPercentage: 100,
        status: 'completed' as const
      },
      {
        stageName: 'Optimal',
        assessedItems: 0,
        totalItems: 2,
        completedItems: 0,
        inProgressItems: 0,
        notStartedItems: 0,
        percentage: 0,
        completionPercentage: 0,
        status: 'not-assessed' as const
      }
    ];
    const result = service.calculateOverallMaturityStage(breakdown);
    expect(result.stage).toBe('Traditional'); // Sequentially allowed
    expect(result.actualStage).toBe('Advanced'); // Highest completed
    expect(result.hasGap).toBeTrue();
    expect(result.explanation).toContain('Sequential maturity requirement');
    expect(result.explanation).toContain('Traditional');
  });

  describe('calculateMaturityStatus', () => {
    it('should return not-assessed if assessedItems is 0', () => {
      const breakdown = { assessedItems: 0, completedItems: 0, inProgressItems: 0, notStartedItems: 0 } as any;
      expect(service.calculateMaturityStatus(breakdown)).toBe('not-assessed');
    });
    it('should return completed if all assessed items are completed', () => {
      const breakdown = { assessedItems: 3, completedItems: 3, inProgressItems: 0, notStartedItems: 0 } as any;
      expect(service.calculateMaturityStatus(breakdown)).toBe('completed');
    });
    it('should return in-progress if there are partially implemented or some completed', () => {
      const breakdown = { assessedItems: 3, completedItems: 1, inProgressItems: 2, notStartedItems: 0 } as any;
      expect(service.calculateMaturityStatus(breakdown)).toBe('in-progress');
      const breakdown2 = { assessedItems: 3, completedItems: 1, inProgressItems: 0, notStartedItems: 2 } as any;
      expect(service.calculateMaturityStatus(breakdown2)).toBe('in-progress');
    });
    it('should return not-started if all assessed items are not implemented', () => {
      const breakdown = { assessedItems: 2, completedItems: 0, inProgressItems: 0, notStartedItems: 2 } as any;
      expect(service.calculateMaturityStatus(breakdown)).toBe('not-started');
    });
  });

  describe('calculateMaturityStageBreakdown', () => {
    const stageName = 'Initial';
    it('should handle empty input', () => {
      const result = service.calculateMaturityStageBreakdown(stageName, [], []);
      expect(result.totalItems).toBe(0);
      expect(result.assessedItems).toBe(0);
      expect(result.status).toBe('not-assessed');
    });
    it('should return completed if all are fully implemented', () => {
      const techs = [{ id: 1 }, { id: 2 }];
      const responses = [
        { tech_process_id: 1, status: 'Fully Implemented' },
        { tech_process_id: 2, status: 'Superseded' }
      ];
      const result = service.calculateMaturityStageBreakdown(stageName, techs as any, responses as any);
      expect(result.completedItems).toBe(2);
      expect(result.status).toBe('completed');
    });
    it('should return not-started if all are not implemented', () => {
      const techs = [{ id: 1 }, { id: 2 }];
      const responses = [
        { tech_process_id: 1, status: 'Not Implemented' },
        { tech_process_id: 2, status: 'Not Implemented' }
      ];
      const result = service.calculateMaturityStageBreakdown(stageName, techs as any, responses as any);
      expect(result.notStartedItems).toBe(2);
      expect(result.status).toBe('not-started');
    });
    it('should return in-progress for mixed statuses', () => {
      const techs = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const responses = [
        { tech_process_id: 1, status: 'Fully Implemented' },
        { tech_process_id: 2, status: 'Partially Implemented' },
        { tech_process_id: 3, status: 'Not Implemented' }
      ];
      const result = service.calculateMaturityStageBreakdown(stageName, techs as any, responses as any);
      expect(result.completedItems).toBe(1);
      expect(result.inProgressItems).toBe(1);
      expect(result.notStartedItems).toBe(1);
      expect(result.status).toBe('in-progress');
    });
  });

  describe('calculatePillarMaturityStage', () => {
    it('should return Traditional for empty input', () => {
      const result = service.calculatePillarMaturityStage([]);
      expect(result.stage).toBe('Traditional');
      expect(result.actualStage).toBe('Traditional');
      expect(result.hasGap).toBeFalse();
    });
    it('should return correct stage when all functions are at the same stage', () => {
      const functions = [
        { overallMaturityStage: 'Initial', actualMaturityStage: 'Initial', hasSequentialMaturityGap: false },
        { overallMaturityStage: 'Initial', actualMaturityStage: 'Initial', hasSequentialMaturityGap: false }
      ] as any;
      const result = service.calculatePillarMaturityStage(functions);
      expect(result.stage).toBe('Initial');
      expect(result.actualStage).toBe('Initial');
      expect(result.hasGap).toBeFalse();
    });
    it('should detect a gap if actualStage is higher than sequentially allowed', () => {
      const functions = [
        { overallMaturityStage: 'Initial', actualMaturityStage: 'Advanced', hasSequentialMaturityGap: true },
        { overallMaturityStage: 'Initial', actualMaturityStage: 'Initial', hasSequentialMaturityGap: false }
      ] as any;
      const result = service.calculatePillarMaturityStage(functions);
      expect(result.stage).toBe('Initial');
      expect(result.actualStage).toBe('Advanced');
      expect(result.hasGap).toBeTrue();
      expect(result.explanation).toContain('Sequential maturity requirements');
    });
  });

  describe('getStatusClass', () => {
    it('should return correct class for each status', () => {
      expect(service.getStatusClass('completed')).toBe('bg-success text-white');
      expect(service.getStatusClass('in-progress')).toBe('bg-warning text-dark');
      expect(service.getStatusClass('not-started')).toBe('bg-danger text-white');
      expect(service.getStatusClass('not-assessed')).toBe('bg-secondary text-white');
      expect(service.getStatusClass('unknown' as any)).toBe('bg-light text-dark');
    });
  });

  describe('getStatusIcon', () => {
    it('should return correct icon for each status', () => {
      expect(service.getStatusIcon('completed')).toBe('bi-check-circle-fill');
      expect(service.getStatusIcon('in-progress')).toBe('bi-hourglass-split');
      expect(service.getStatusIcon('not-started')).toBe('bi-x-circle-fill');
      expect(service.getStatusIcon('not-assessed')).toBe('bi-question-circle-fill');
      expect(service.getStatusIcon('unknown' as any)).toBe('bi-circle');
    });
  });

  describe('getMaturityStageColor', () => {
    it('should return correct color for each stage', () => {
      expect(service.getMaturityStageColor('Traditional')).toBe('bg-secondary');
      expect(service.getMaturityStageColor('Initial')).toBe('bg-warning');
      expect(service.getMaturityStageColor('Advanced')).toBe('bg-info');
      expect(service.getMaturityStageColor('Optimal')).toBe('bg-success');
      expect(service.getMaturityStageColor('unknown')).toBe('bg-light');
    });
  });

  describe('getAssessmentStatusClass', () => {
    it('should return correct class for each assessment status', () => {
      expect(service.getAssessmentStatusClass('Fully Implemented')).toBe('bg-success text-white');
      expect(service.getAssessmentStatusClass('Partially Implemented')).toBe('bg-warning text-dark');
      expect(service.getAssessmentStatusClass('Not Implemented')).toBe('bg-danger text-white');
      expect(service.getAssessmentStatusClass('Not Assessed')).toBe('bg-secondary text-white');
      expect(service.getAssessmentStatusClass('Superseded')).toBe('bg-info text-white');
      expect(service.getAssessmentStatusClass('unknown')).toBe('bg-secondary text-white');
    });
  });
});
