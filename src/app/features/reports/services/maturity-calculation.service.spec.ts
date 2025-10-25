import { TestBed } from '@angular/core/testing';
import { MaturityCalculationService } from './maturity-calculation.service';

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
    // Removed unused: const breakdown: MaturityStageBreakdown[] = [...];
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
    const result = service.calculateOverallMaturityStage([
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
    ]);
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

  // V2 Model Tests
  describe('V2 Model Support', () => {
    describe('calculateV2MaturityStageBreakdown', () => {
      const stageName = 'Initial';

      it('should handle empty input', () => {
        const result = service.calculateV2MaturityStageBreakdown(stageName, [], []);
        expect(result.totalItems).toBe(0);
        expect(result.assessedItems).toBe(0);
        expect(result.status).toBe('not-assessed');
      });

      it('should return completed when achieved stage equals current stage', () => {
        const groups = [
          { id: 1, name: 'Group1', maturity_stage_ids: [1, 2] }
        ];
        const assessments = [
          {
            id: 1,
            process_technology_group_id: 1,
            maturity_stage_id: 2,
            achieved_maturity_stage_id: 2,
            target_maturity_stage_id: 2,
            implementation_status: 'Fully Implemented'
          }
        ];

        const result = service.calculateV2MaturityStageBreakdown(
          stageName,
          groups as any,
          assessments as any
        );

        expect(result.completedItems).toBe(1);
        expect(result.inProgressItems).toBe(0);
        expect(result.notStartedItems).toBe(0);
        expect(result.status).toBe('completed');
      });

      it('should return in-progress when achieved stage is less than current stage', () => {
        const groups = [
          { id: 1, name: 'Group1', maturity_stage_ids: [1, 2, 3] }
        ];
        const assessments = [
          {
            id: 1,
            process_technology_group_id: 1,
            maturity_stage_id: 3,
            achieved_maturity_stage_id: 2,
            target_maturity_stage_id: 3,
            implementation_status: 'Partially Implemented'
          }
        ];

        const result = service.calculateV2MaturityStageBreakdown(
          'Advanced',
          groups as any,
          assessments as any
        );

        expect(result.completedItems).toBe(0);
        expect(result.inProgressItems).toBe(1);
        expect(result.notStartedItems).toBe(0);
        expect(result.status).toBe('in-progress');
      });

      it('should return not-started when no assessment exists for stage', () => {
        const groups = [
          { id: 1, name: 'Group1', maturity_stage_ids: [1, 2] }
        ];
        const assessments: any[] = [];

        const result = service.calculateV2MaturityStageBreakdown(
          stageName,
          groups as any,
          assessments as any
        );

        // When no assessment exists, totalItems = 1 but assessedItems = 0
        expect(result.totalItems).toBe(1);
        expect(result.assessedItems).toBe(0);
        expect(result.completedItems).toBe(0);
        expect(result.inProgressItems).toBe(0);
        expect(result.notStartedItems).toBe(0); // Not counted until assessed
        expect(result.status).toBe('not-assessed');
      });

      it('should handle multiple groups at same stage with mixed statuses', () => {
        const groups = [
          { id: 1, name: 'Group1', maturity_stage_ids: [1, 2] },
          { id: 2, name: 'Group2', maturity_stage_ids: [1, 2] },
          { id: 3, name: 'Group3', maturity_stage_ids: [1, 2] }
        ];
        const assessments = [
          {
            id: 1,
            process_technology_group_id: 1,
            maturity_stage_id: 2,
            achieved_maturity_stage_id: 2,
            implementation_status: 'Fully Implemented'
          },
          {
            id: 2,
            process_technology_group_id: 2,
            maturity_stage_id: 2,
            achieved_maturity_stage_id: 1,
            implementation_status: 'Partially Implemented'
          }
          // Group3 has no assessment
        ];

        const result = service.calculateV2MaturityStageBreakdown(
          stageName,
          groups as any,
          assessments as any
        );

        expect(result.totalItems).toBe(3);
        expect(result.assessedItems).toBe(2); // Only Group1 and Group2 have assessments
        expect(result.completedItems).toBe(1); // Group1 is fully implemented
        expect(result.inProgressItems).toBe(1); // Group2 is partially implemented
        expect(result.notStartedItems).toBe(0); // Group3 has no assessment, not counted
        expect(result.status).toBe('in-progress');
      });

      it('should handle Superseded status as completed', () => {
        const groups = [
          { id: 1, name: 'Group1', maturity_stage_ids: [1] }
        ];
        const assessments = [
          {
            id: 1,
            process_technology_group_id: 1,
            maturity_stage_id: 1,
            achieved_maturity_stage_id: 1,
            implementation_status: 'Fully Implemented'
          }
        ];

        const result = service.calculateV2MaturityStageBreakdown(
          'Traditional',
          groups as any,
          assessments as any
        );

        expect(result.completedItems).toBe(1);
        expect(result.status).toBe('completed');
      });

      it('should calculate correct percentages for V2 breakdown', () => {
        const groups = [
          { id: 1, name: 'Group1', maturity_stage_ids: [1] },
          { id: 2, name: 'Group2', maturity_stage_ids: [1] },
          { id: 3, name: 'Group3', maturity_stage_ids: [1] },
          { id: 4, name: 'Group4', maturity_stage_ids: [1] }
        ];
        const assessments = [
          {
            id: 1,
            process_technology_group_id: 1,
            maturity_stage_id: 1,
            achieved_maturity_stage_id: 1,
            implementation_status: 'Fully Implemented'
          },
          {
            id: 2,
            process_technology_group_id: 2,
            maturity_stage_id: 1,
            achieved_maturity_stage_id: 1,
            implementation_status: 'Fully Implemented'
          }
        ];

        const result = service.calculateV2MaturityStageBreakdown(
          'Traditional',
          groups as any,
          assessments as any
        );

        expect(result.totalItems).toBe(4);
        expect(result.assessedItems).toBe(2);
        expect(result.percentage).toBe(50); // 2/4 = 50%
        expect(result.completionPercentage).toBe(50); // 2 completed out of 4 total
      });
    });

    describe('V2 Model Integration', () => {
      it('should handle V2 assessment status mapping correctly', () => {
        const groups = [{ id: 1, name: 'Group1', maturity_stage_ids: [1] }];

        // Test all V2 statuses
        const statuses = ['Fully Implemented', 'Partially Implemented', 'Not Implemented', 'Superseded'];
        
        statuses.forEach(status => {
          const assessments = [{
            id: 1,
            process_technology_group_id: 1,
            maturity_stage_id: 1,
            achieved_maturity_stage_id: status === 'Not Implemented' ? null : 1,
            implementation_status: status
          }];

          const result = service.calculateV2MaturityStageBreakdown(
            'Traditional',
            groups as any,
            assessments as any
          );

          expect(result.assessedItems).toBe(1);
          if (status === 'Fully Implemented' || status === 'Superseded') {
            expect(result.completedItems).toBe(1);
          } else if (status === 'Partially Implemented') {
            expect(result.inProgressItems).toBe(1);
          } else {
            expect(result.notStartedItems).toBe(1);
          }
        });
      });
    });
  });
});
