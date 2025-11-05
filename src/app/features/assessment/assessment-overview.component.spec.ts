import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssessmentOverviewComponent } from './assessment-overview.component';
import { AssessmentItemComponent } from './assessment-item.component';
import { ProcessTechnologyGroup, MaturityStageImplementation, Assessment, FunctionCapability, AssessmentStatus } from '../../models/ztmm.models';

export interface AssessmentUpdate {
  achieved_maturity_stage_id: number;
  target_maturity_stage_id: number | null;
  implementation_status: AssessmentStatus;
  notes: string;
}

describe('V2AssessmentOverviewComponent', () => {
  let component: AssessmentOverviewComponent;
  let fixture: ComponentFixture<AssessmentOverviewComponent>;

  const mockFunctionCapabilities: FunctionCapability[] = [
    { id: 1, name: 'Authentication', type: 'Function', pillar_id: 1 }
  ];

  const mockProcessTechnologyGroups: ProcessTechnologyGroup[] = [
    {
      id: 1,
      function_capability_id: 1,
      name: 'Azure AD',
      type: 'Technology',
      description: 'Identity and access management',
      order_index: 1
    },
    {
      id: 2,
      function_capability_id: 1,
      name: 'Identity Lifecycle',
      type: 'Process',
      description: 'User lifecycle management',
      order_index: 2
    },
    {
      id: 3,
      function_capability_id: 1,
      name: 'MFA Implementation',
      type: 'Technology',
      description: 'Multi-factor authentication',
      order_index: 3
    }
  ];

  const mockStageImplementations: MaturityStageImplementation[] = [
    {
      id: 1,
      process_technology_group_id: 1,
      maturity_stage_id: 1,
      order_index: 1,
      description: 'Basic setup'
    },
    {
      id: 2,
      process_technology_group_id: 1,
      maturity_stage_id: 2,
      order_index: 2,
      description: 'Advanced features'
    },
    {
      id: 3,
      process_technology_group_id: 2,
      maturity_stage_id: 1,
      order_index: 1,
      description: 'Manual processes'
    }
  ];

  const mockAssessments: Assessment[] = [
    {
      id: 1,
      process_technology_group_id: 1,
      achieved_maturity_stage_id: 2,
      target_maturity_stage_id: 3,
      implementation_status: 'Partially Implemented',
      notes: 'Implementing advanced features',
      last_updated: new Date().toISOString()
    },
    {
      id: 2,
      process_technology_group_id: 2,
      achieved_maturity_stage_id: 0,
      target_maturity_stage_id: 2,
      implementation_status: 'Not Implemented',
      notes: '',
      last_updated: new Date().toISOString()
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentOverviewComponent, AssessmentItemComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AssessmentOverviewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should have default empty arrays', () => {
      expect(component.processTechnologyGroups).toEqual([]);
      expect(component.stageImplementations).toEqual([]);
      expect(component.assessments).toEqual([]);
      expect(component.functionCapabilities).toEqual([]);
    });

    it('should have default false flags', () => {
      expect(component.isAutoSaving).toBe(false);
      expect(component.showSuccess).toBe(false);
    });

    it('should have default empty strings', () => {
      expect(component.selectedFunctionCapabilityName).toBe('');
      expect(component.selectedFunctionCapabilityType).toBe('');
    });
  });

  xdescribe('getCurrentProgress()', () => {
    // TODO: Update tests for V2 data model - tests written for old V1 API
    it('should return 0 when no assessments exist', () => {
      component.processTechnologyGroups = [];
      component.assessments = [];

      expect(component.getCurrentProgress()).toBe(0);
    });

    it('should return 0 when no assessments exist', () => {
      component.processTechnologyGroups = mockProcessTechnologyGroups;
      component.assessments = [];

      expect(component.getCurrentProgress()).toBe(0);
    });

    it('should calculate correct percentage with some completed', () => {
      component.processTechnologyGroups = mockProcessTechnologyGroups; // 3 groups
      component.assessments = [
        { ...mockAssessments[0], achieved_maturity_stage_id: 2 } // 1 completed
      ];

      const expected = Math.round((1 / 3) * 100); // 33%
      expect(component.getCurrentProgress()).toBe(expected);
    });

    it('should return 100 when all groups are assessed', () => {
      component.processTechnologyGroups = mockProcessTechnologyGroups;
      component.assessments = [
        { ...mockAssessments[0], achieved_maturity_stage_id: 2 },
        { ...mockAssessments[1], achieved_maturity_stage_id: 1 },
        { id: 3, process_technology_group_id: 3, achieved_maturity_stage_id: 1 } as Assessment
      ];

      expect(component.getCurrentProgress()).toBe(100);
    });

    it('should not count assessments with achieved_maturity_stage_id of 0', () => {
      component.processTechnologyGroups = mockProcessTechnologyGroups;
      component.assessments = [
        { ...mockAssessments[0], achieved_maturity_stage_id: 2 }, // Counts
        { ...mockAssessments[1], achieved_maturity_stage_id: 0 }  // Doesn't count
      ];

      const expected = Math.round((1 / 3) * 100); // 33%
      expect(component.getCurrentProgress()).toBe(expected);
    });

    it('should not count assessments with null achieved_maturity_stage_id', () => {
      component.processTechnologyGroups = mockProcessTechnologyGroups;
      component.assessments = [
        { ...mockAssessments[0], achieved_maturity_stage_id: 2 }, // Counts
        { ...mockAssessments[1], achieved_maturity_stage_id: null as any }  // Doesn't count
      ];

      const expected = Math.round((1 / 3) * 100); // 33%
      expect(component.getCurrentProgress()).toBe(expected);
    });
  });

  xdescribe('getAssessedCount()', () => {
    // TODO: Update tests for V2 data model - tests written for old V1 API
    it('should return 0 when no assessments exist', () => {
      component.assessments = [];

      expect(component.getAssessedCount()).toBe(0);
    });

    it('should count only assessments with achieved_maturity_stage_id > 0', () => {
      component.assessments = [
        { ...mockAssessments[0], achieved_maturity_stage_id: 2 },
        { ...mockAssessments[1], achieved_maturity_stage_id: 0 }
      ];

      expect(component.getAssessedCount()).toBe(1);
    });

    it('should count all assessed items correctly', () => {
      component.assessments = [
        { ...mockAssessments[0], achieved_maturity_stage_id: 1 },
        { ...mockAssessments[1], achieved_maturity_stage_id: 2 },
        { id: 3, process_technology_group_id: 3, achieved_maturity_stage_id: 3 } as Assessment
      ];

      expect(component.getAssessedCount()).toBe(3);
    });

    it('should handle null and undefined achieved_maturity_stage_id', () => {
      component.processTechnologyGroups = mockProcessTechnologyGroups;
      component.assessments = [
        { ...mockAssessments[0], achieved_maturity_stage_id: 1 },
        { ...mockAssessments[1], achieved_maturity_stage_id: 0 },
        {
          id: 3,
          process_technology_group_id: 1,
          achieved_maturity_stage_id: 0,
          target_maturity_stage_id: null,
          implementation_status: 'Not Implemented',
          notes: '',
          last_updated: new Date().toISOString()
        }
      ];

      expect(component.getAssessedCount()).toBe(1);
    });
  });

  xdescribe('getInProgressCount()', () => {
    // TODO: Update tests for V2 data model - tests written for old V1 API
    it('should return 0 when no assessments exist', () => {
      component.assessments = [];

      expect(component.getInProgressCount()).toBe(0);
    });

    it('should count assessments where target > achieved', () => {
      component.assessments = [
        {
          ...mockAssessments[0],
          achieved_maturity_stage_id: 1,
          target_maturity_stage_id: 3
        }
      ];

      expect(component.getInProgressCount()).toBe(1);
    });

    it('should not count assessments where target <= achieved', () => {
      component.assessments = [
        {
          ...mockAssessments[0],
          achieved_maturity_stage_id: 3,
          target_maturity_stage_id: 3
        },
        {
          ...mockAssessments[1],
          achieved_maturity_stage_id: 3,
          target_maturity_stage_id: 2
        }
      ];

      expect(component.getInProgressCount()).toBe(0);
    });

    it('should not count assessments with no target', () => {
      component.assessments = [
        {
          ...mockAssessments[0],
          achieved_maturity_stage_id: 1,
          target_maturity_stage_id: null as any
        }
      ];

      expect(component.getInProgressCount()).toBe(0);
    });

    it('should handle achieved_maturity_stage_id of 0 or null', () => {
      component.assessments = [
        {
          ...mockAssessments[0],
          achieved_maturity_stage_id: 0,
          target_maturity_stage_id: 3
        },
        {
          ...mockAssessments[1],
          achieved_maturity_stage_id: null as any,
          target_maturity_stage_id: 3
        }
      ];

      // Should count both as target > achieved (treating null/0 as 0)
      expect(component.getInProgressCount()).toBe(2);
    });
  });

  xdescribe('getNotStartedCount()', () => {
    // TODO: Update tests for V2 data model - tests written for old V1 API
    it('should return 0 when no groups exist', () => {
      component.processTechnologyGroups = mockProcessTechnologyGroups;
      component.assessments = [];

      expect(component.getNotStartedCount()).toBe(3);
    });

    it('should subtract assessed items from total', () => {
      component.processTechnologyGroups = mockProcessTechnologyGroups;
      component.assessments = [
        { ...mockAssessments[0], achieved_maturity_stage_id: 2 }
      ];

      expect(component.getNotStartedCount()).toBe(2); // 3 - 1
    });

    it('should return 0 when all groups are assessed', () => {
      component.processTechnologyGroups = mockProcessTechnologyGroups;
      component.assessments = [
        { ...mockAssessments[0], achieved_maturity_stage_id: 2 },
        { ...mockAssessments[1], achieved_maturity_stage_id: 1 },
        { id: 3, process_technology_group_id: 3, achieved_maturity_stage_id: 1 } as Assessment
      ];

      expect(component.getNotStartedCount()).toBe(0);
    });
  });

  describe('getStagesForGroup()', () => {
    beforeEach(() => {
      component.stageImplementations = mockStageImplementations;
    });

    it('should return stages for the specified group', () => {
      const stages = component.getStagesForGroup(1);

      expect(stages.length).toBe(2);
      expect(stages[0].id).toBe(1);
      expect(stages[1].id).toBe(2);
    });

    it('should return empty array when no stages exist for group', () => {
      const stages = component.getStagesForGroup(999);

      expect(stages).toEqual([]);
    });

    it('should filter correctly by process_technology_group_id', () => {
      const stagesGroup1 = component.getStagesForGroup(1);
      const stagesGroup2 = component.getStagesForGroup(2);

      expect(stagesGroup1.length).toBe(2);
      expect(stagesGroup2.length).toBe(1);
      expect(stagesGroup2[0].id).toBe(3);
    });
  });

  describe('getAssessmentForGroup()', () => {
    beforeEach(() => {
      component.assessments = mockAssessments;
    });

    it('should return assessment for the specified group', () => {
      const assessment = component.getAssessmentForGroup(1);

      expect(assessment).toBeDefined();
      expect(assessment?.id).toBe(1);
      expect(assessment?.process_technology_group_id).toBe(1);
    });

    it('should return undefined when no assessment exists for group', () => {
      const assessment = component.getAssessmentForGroup(999);

      expect(assessment).toBeUndefined();
    });

    it('should return correct assessment for each group', () => {
      const assessment1 = component.getAssessmentForGroup(1);
      const assessment2 = component.getAssessmentForGroup(2);

      expect(assessment1?.id).toBe(1);
      expect(assessment2?.id).toBe(2);
    });
  });

  describe('Event Emission', () => {
    xit('should emit assessment update event when assessment is updated', () => {
      // TODO: Update test to match new AssessmentUpdate interface
      // spyOn(component.assessmentUpdate, 'emit');
      // const mockUpdate: AssessmentUpdate = {...};
      // component.onAssessmentUpdate(1, mockUpdate);
      // expect(component.assessmentUpdate.emit).toHaveBeenCalledWith({...});
    });

    xit('should emit saveAll event when onSaveAll is called', () => {
      // TODO: Update test - onSaveAll method no longer exists
      // spyOn(component.saveAll, 'emit');
      // component.onSaveAll();
      // expect(component.saveAll.emit).toHaveBeenCalled();
    });
  });

  xdescribe('Template Integration', () => {
    // TODO: Update tests for V2 data model - tests written for old V1 API
    beforeEach(() => {
      component.processTechnologyGroups = mockProcessTechnologyGroups;
      component.stageImplementations = mockStageImplementations;
      component.assessments = mockAssessments;
      component.functionCapabilities = mockFunctionCapabilities;
      component.selectedFunctionCapabilityName = 'Authentication';
      component.selectedFunctionCapabilityType = 'Function';
      fixture.detectChanges();
    });

    it('should render the component', () => {
      const compiled = fixture.nativeElement;
      expect(compiled).toBeTruthy();
    });

    it('should display the correct function name and type', () => {
      component.selectedFunctionCapabilityName = 'Authentication';
      component.selectedFunctionCapabilityType = 'Function';
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const header = compiled.querySelector('h5');

      expect(header.textContent).toContain('Authentication');
      expect(header.textContent).toContain('Function');
    });

    it('should display correct progress percentage', () => {
      component.processTechnologyGroups = mockProcessTechnologyGroups;
      component.assessments = mockAssessments;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const progressBadge = compiled.querySelector('.badge.bg-light');

      const expectedProgress = component.getCurrentProgress();
      expect(progressBadge.textContent).toContain(`${expectedProgress}%`);
    });

    it('should display correct total items count', () => {
      const compiled = fixture.nativeElement;
      const totalCount = compiled.querySelectorAll('.fw-bold')[0];

      expect(totalCount.textContent.trim()).toBe('3');
    });

    it('should display correct assessed count', () => {
      const compiled = fixture.nativeElement;
      const assessedCount = compiled.querySelectorAll('.fw-bold')[1];

      expect(assessedCount.textContent.trim()).toBe(component.getAssessedCount().toString());
    });

    it('should show auto-saving indicator when isAutoSaving is true', () => {
      component.isAutoSaving = true;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const autoSaveIndicator = compiled.querySelector('.text-white-50 i.bi-cloud-upload');

      expect(autoSaveIndicator).toBeTruthy();
    });

    it('should show success indicator when showSuccess is true', () => {
      component.showSuccess = true;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const successIndicator = compiled.querySelector('.text-success');

      expect(successIndicator).toBeTruthy();
    });

    it('should render correct number of assessment items', () => {
      const compiled = fixture.nativeElement;
      const assessmentItems = compiled.querySelectorAll('app-v2-assessment-item');

      expect(assessmentItems.length).toBe(3);
    });

    it('should disable save button when auto-saving', () => {
      component.isAutoSaving = true;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const saveButton = compiled.querySelector('button.btn-primary');

      expect(saveButton.disabled).toBe(true);
    });
  });

  xdescribe('Edge Cases', () => {
    // TODO: Update tests for V2 data model - tests written for old V1 API
    it('should handle empty processTechnologyGroups array', () => {
      component.processTechnologyGroups = [];
      component.assessments = [];

      expect(component.getCurrentProgress()).toBe(0);
      expect(component.getNotStartedCount()).toBe(0);
    });

    it('should handle assessments with missing properties', () => {
      component.assessments = [
        { id: 1, process_technology_group_id: 1 } as Assessment
      ];

      expect(() => component.getAssessedCount()).not.toThrow();
      expect(() => component.getInProgressCount()).not.toThrow();
    });

    it('should handle stageImplementations with missing data', () => {
      component.stageImplementations = [];

      expect(component.getStagesForGroup(1)).toEqual([]);
    });

    it('should handle large numbers of groups and assessments', () => {
      const largeGroups: ProcessTechnologyGroup[] = [];
      const largeAssessments: Assessment[] = [];

      for (let i = 0; i < 100; i++) {
        largeGroups.push({
          id: i,
          function_capability_id: 1,
          name: `Group ${i}`,
          type: 'Technology',
          description: `Description ${i}`,
          order_index: i
        });

        if (i % 2 === 0) {
          largeAssessments.push({
            id: i,
            process_technology_group_id: i,
            achieved_maturity_stage_id: 1,
            target_maturity_stage_id: 2,
            implementation_status: 'Partially Implemented',
            notes: '',
            last_updated: new Date().toISOString()
          });
        }
      }

      component.processTechnologyGroups = largeGroups;
      component.assessments = largeAssessments;

      expect(component.getCurrentProgress()).toBe(50);
      expect(component.getAssessedCount()).toBe(50);
      expect(component.getNotStartedCount()).toBe(50);
    });
  });
});
