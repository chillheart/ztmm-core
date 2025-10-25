import { ComponentFixture, TestBed } from '@angular/core/testing';
import { V2ProgressVisualizerComponent } from './v2-progress-visualizer.component';
import { MaturityStage, MaturityStageImplementation } from '../../models/ztmm.models';

describe('V2ProgressVisualizerComponent', () => {
  let component: V2ProgressVisualizerComponent;
  let fixture: ComponentFixture<V2ProgressVisualizerComponent>;

  const mockMaturityStages: MaturityStage[] = [
    { id: 1, name: 'Traditional' },
    { id: 2, name: 'Initial' },
    { id: 3, name: 'Advanced' },
    { id: 4, name: 'Optimal' }
  ];

  const mockStageImplementations: MaturityStageImplementation[] = [
    {
      id: 1,
      process_technology_group_id: 1,
      maturity_stage_id: 2,
      description: 'Initial stage implementation',
      order_index: 1
    },
    {
      id: 2,
      process_technology_group_id: 1,
      maturity_stage_id: 3,
      description: 'Advanced stage implementation',
      order_index: 2
    },
    {
      id: 3,
      process_technology_group_id: 1,
      maturity_stage_id: 4,
      description: 'Optimal stage implementation',
      order_index: 3
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [V2ProgressVisualizerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(V2ProgressVisualizerComponent);
    component = fixture.componentInstance;
    component.availableStages = mockMaturityStages.slice(1); // Exclude Traditional
    component.stageImplementations = mockStageImplementations;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should sort available stages by ID on init', () => {
    component.availableStages = [mockMaturityStages[3], mockMaturityStages[1], mockMaturityStages[2]];
    component.ngOnInit();
    expect(component.availableStages.map(s => s.id)).toEqual([2, 3, 4]);
  });

  it('should determine stage status correctly', () => {
    component.achievedStageId = 2;
    component.targetStageId = 3;
    fixture.detectChanges();

    expect(component.getStageStatus(2)).toBe('completed');
    expect(component.getStageStatus(3)).toBe('in-progress');
    expect(component.getStageStatus(4)).toBe('future');
    expect(component.getStageStatus(1)).toBe('not-available');
  });

  it('should check if stage has implementation', () => {
    fixture.detectChanges();
    expect(component.hasImplementation(2)).toBe(true);
    expect(component.hasImplementation(3)).toBe(true);
    expect(component.hasImplementation(1)).toBe(false);
  });

  it('should get correct stage class based on status', () => {
    component.achievedStageId = 2;
    component.targetStageId = 3;
    fixture.detectChanges();

    expect(component.getStageClass(2)).toBe('stage-completed');
    expect(component.getStageClass(3)).toBe('stage-in-progress');
    expect(component.getStageClass(4)).toBe('stage-future');
    expect(component.getStageClass(1)).toBe('stage-not-available');
  });

  it('should get correct stage icon based on status', () => {
    component.achievedStageId = 2;
    component.targetStageId = 3;
    fixture.detectChanges();

    expect(component.getStageIcon(2)).toBe('bi-check-circle-fill');
    expect(component.getStageIcon(3)).toBe('bi-arrow-right-circle-fill');
    expect(component.getStageIcon(4)).toBe('bi-circle');
    expect(component.getStageIcon(1)).toBe('bi-dash-circle');
  });

  it('should calculate progress percentage correctly', () => {
    component.availableStages = mockMaturityStages.slice(1); // [2, 3, 4]
    component.achievedStageId = 0;
    expect(component.getProgressPercentage()).toBe(0);

    component.achievedStageId = 2;
    expect(component.getProgressPercentage()).toBe(0);

    component.achievedStageId = 3;
    expect(component.getProgressPercentage()).toBe(50);

    component.achievedStageId = 4;
    expect(component.getProgressPercentage()).toBe(100);
  });

  it('should get stage implementation', () => {
    fixture.detectChanges();
    const impl = component.getStageImplementation(2);
    expect(impl).toBeDefined();
    expect(impl?.description).toBe('Initial stage implementation');
  });

  it('should get stage name', () => {
    component.availableStages = mockMaturityStages;
    fixture.detectChanges();
    expect(component.getStageName(2)).toBe('Initial');
    expect(component.getStageName(999)).toBe('Unknown');
  });

  it('should handle empty available stages', () => {
    component.availableStages = [];
    fixture.detectChanges();
    expect(component.getProgressPercentage()).toBe(0);
  });

  it('should handle single stage scenario', () => {
    component.availableStages = [mockMaturityStages[1]];
    component.achievedStageId = 0;
    expect(component.getProgressPercentage()).toBe(0);

    component.achievedStageId = 2;
    expect(component.getProgressPercentage()).toBe(100);
  });
});
