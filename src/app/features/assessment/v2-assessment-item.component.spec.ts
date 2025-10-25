import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { V2AssessmentItemComponent } from './v2-assessment-item.component';
import {
  ProcessTechnologyGroup,
  MaturityStageImplementation,
  Assessment,
  AssessmentStatus,
  FunctionCapability,
  MaturityStage
} from '../../models/ztmm.models';

describe('V2AssessmentItemComponent', () => {
  let component: V2AssessmentItemComponent;
  let fixture: ComponentFixture<V2AssessmentItemComponent>;

  const mockMaturityStages: MaturityStage[] = [
    { id: 1, name: 'Traditional' },
    { id: 2, name: 'Initial' },
    { id: 3, name: 'Advanced' },
    { id: 4, name: 'Optimal' }
  ];

  const mockFunctionCapabilities: FunctionCapability[] = [
    { id: 1, name: 'Authentication', type: 'Function', pillar_id: 1 }
  ];

  const mockGroup: ProcessTechnologyGroup = {
    id: 1,
    name: 'Multi-Factor Authentication',
    description: 'MFA implementation',
    type: 'Technology',
    function_capability_id: 1,
    order_index: 1
  };

  const mockStageImplementations: MaturityStageImplementation[] = [
    {
      id: 1,
      process_technology_group_id: 1,
      maturity_stage_id: 2,
      description: 'Basic MFA with SMS',
      order_index: 1
    },
    {
      id: 2,
      process_technology_group_id: 1,
      maturity_stage_id: 3,
      description: 'Authenticator apps for all users',
      order_index: 2
    },
    {
      id: 3,
      process_technology_group_id: 1,
      maturity_stage_id: 4,
      description: 'Hardware tokens with biometrics',
      order_index: 3
    }
  ];

  const mockStatusOptions: AssessmentStatus[] = [
    'Not Implemented',
    'Partially Implemented',
    'Fully Implemented',
    'Superseded'
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, V2AssessmentItemComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(V2AssessmentItemComponent);
    component = fixture.componentInstance;
    component.group = mockGroup;
    component.itemNumber = 1;
    component.stageImplementations = mockStageImplementations;
    component.maturityStages = mockMaturityStages;
    component.functionCapabilities = mockFunctionCapabilities;
    component.statusOptions = mockStatusOptions;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values when no assessment provided', () => {
    fixture.detectChanges();
    expect(component.achievedStageId).toBe(0);
    expect(component.targetStageId).toBeNull();
    expect(component.implementationStatus).toBe('Not Implemented');
    expect(component.notes).toBe('');
  });

  it('should initialize with assessment values when provided', () => {
    const mockAssessment: Assessment = {
      id: 1,
      process_technology_group_id: 1,
      achieved_maturity_stage_id: 2,
      target_maturity_stage_id: 3,
      implementation_status: 'Partially Implemented',
      notes: 'Test notes',
      last_updated: '2024-01-01T00:00:00Z'
    };
    component.assessment = mockAssessment;
    fixture.detectChanges();

    expect(component.achievedStageId).toBe(2);
    expect(component.targetStageId).toBe(3);
    expect(component.implementationStatus).toBe('Partially Implemented');
    expect(component.notes).toBe('Test notes');
  });

  it('should get available stages based on stage implementations', () => {
    fixture.detectChanges();
    const availableStages = component.getAvailableStages();
    expect(availableStages.length).toBe(3);
    expect(availableStages.map(s => s.id)).toEqual([2, 3, 4]);
  });

  it('should get available target stages based on achieved stage', () => {
    component.achievedStageId = 2;
    fixture.detectChanges();
    const targetStages = component.getAvailableTargetStages();
    expect(targetStages.length).toBe(2);
    expect(targetStages.map(s => s.id)).toEqual([3, 4]);
  });

  it('should clear target stage when achieved stage is increased beyond it', () => {
    component.achievedStageId = 2;
    component.targetStageId = 3;
    fixture.detectChanges();

    component.onAchievedStageChange(3);
    expect(component.targetStageId).toBeNull();
  });

  it('should emit assessment change when achieved stage changes', () => {
    spyOn(component.assessmentChange, 'emit');
    fixture.detectChanges();

    component.onAchievedStageChange(2);
    expect(component.assessmentChange.emit).toHaveBeenCalledWith({
      achieved_maturity_stage_id: 2,
      target_maturity_stage_id: null,
      implementation_status: 'Not Implemented',
      notes: ''
    });
  });

  it('should get correct stage badge class based on stage status', () => {
    component.achievedStageId = 2;
    component.targetStageId = 3;
    fixture.detectChanges();

    expect(component.getStageBadgeClass(1)).toBe('bg-light text-dark'); // Not available
    expect(component.getStageBadgeClass(2)).toBe('bg-success'); // Achieved
    expect(component.getStageBadgeClass(3)).toBe('bg-warning text-dark'); // Target
    expect(component.getStageBadgeClass(4)).toBe('bg-light text-dark'); // Future
  });

  it('should get correct stage icon based on stage status', () => {
    component.achievedStageId = 2;
    component.targetStageId = 3;
    fixture.detectChanges();

    expect(component.getStageIcon(2)).toBe('bi-check-circle-fill'); // Achieved
    expect(component.getStageIcon(3)).toBe('bi-arrow-right-circle'); // Target
    expect(component.getStageIcon(4)).toBe('bi-circle'); // Future
  });

  it('should toggle details visibility', () => {
    expect(component.showDetails).toBe(false);
    component.toggleDetails();
    expect(component.showDetails).toBe(true);
    component.toggleDetails();
    expect(component.showDetails).toBe(false);
  });

  it('should get function capability name', () => {
    fixture.detectChanges();
    expect(component.getFunctionCapabilityName(1)).toBe('Authentication');
    expect(component.getFunctionCapabilityName(999)).toBe('Unknown');
  });

  it('should get maturity stage name', () => {
    fixture.detectChanges();
    expect(component.getMaturityStageName(2)).toBe('Initial');
    expect(component.getMaturityStageName(999)).toBe('Unknown');
  });

  it('should get stage implementation', () => {
    fixture.detectChanges();
    const impl = component.getStageImplementation(2);
    expect(impl).toBeDefined();
    expect(impl?.description).toBe('Basic MFA with SMS');
  });
});
