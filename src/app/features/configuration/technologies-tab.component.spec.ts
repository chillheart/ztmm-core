import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TechnologiesTabComponent } from './technologies-tab.component';
describe('TechnologiesTabComponent', () => {
  let component: TechnologiesTabComponent;
  let fixture: ComponentFixture<TechnologiesTabComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnologiesTabComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(TechnologiesTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit addTechnologyProcess when form is valid and submitted', () => {
    spyOn(component.addTechnologyProcess, 'emit');
    component.newTechnologyProcessName = 'Tech1';
    component.newTechnologyProcessDescription = 'Desc1';
    component.newTechnologyProcessType = 'Technology';
    component.selectedFunctionCapabilityId = 1;
    component.selectedMaturityStageId = 2;
    const form = { valid: true, resetForm: () => { /* no-op for test */ }, controls: {} } as any;
    component.onAddTechnologyProcess(form);
    expect(component.addTechnologyProcess.emit).toHaveBeenCalledWith({
      name: 'Tech1',
      description: 'Desc1',
      type: 'Technology',
      functionCapabilityId: 1,
      maturityStageId: 2
    });
  });

  it('should emit removeTechnologyProcess when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(component.removeTechnologyProcess, 'emit');
    component.onRemoveTechnologyProcess(2);
    expect(component.removeTechnologyProcess.emit).toHaveBeenCalledWith(2);
  });

  it('should not emit removeTechnologyProcess when not confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    spyOn(component.removeTechnologyProcess, 'emit');
    component.onRemoveTechnologyProcess(2);
    expect(component.removeTechnologyProcess.emit).not.toHaveBeenCalled();
  });

  it('should start and cancel editing technology/process', () => {
    const tp = { id: 3, name: 'EditMe', description: 'desc', type: 'Technology', function_capability_id: 1, maturity_stage_id: 2 } as any;
    component.startEditTechProcess(tp);
    expect(component.editingTechProcessId).toBe(3);
    expect(component.editingTechProcess.name).toBe('EditMe');
    component.cancelEditTechProcess();
    expect(component.editingTechProcessId).toBeNull();
    expect(component.editingTechProcess).toEqual({});
  });

  it('should emit editTechnologyProcess and reset edit state on saveEditTechProcess', () => {
    spyOn(component.editTechnologyProcess, 'emit');
    component.editingTechProcessId = 4;
    component.editingTechProcess = { name: 'EditSave', description: 'desc', type: 'Process', function_capability_id: 2, maturity_stage_id: 3 };
    component.saveEditTechProcess();
    expect(component.editTechnologyProcess.emit).toHaveBeenCalledWith({
      id: 4, name: 'EditSave', description: 'desc', type: 'Process', functionCapabilityId: 2, maturityStageId: 3
    });
    expect(component.editingTechProcessId).toBeNull();
  });

  it('should filter function capabilities by selectedTechPillarId', () => {
    component.functionCapabilities = [
      { id: 1, pillar_id: 1 } as any,
      { id: 2, pillar_id: 2 } as any
    ];
    component.selectedTechPillarId = 1;
    expect(component.filteredFunctionCapabilities.length).toBe(1);
    expect(component.filteredFunctionCapabilities[0].id).toBe(1);
  });

  it('should filter technologies/processes by selectedTechPillarId', () => {
    component.functionCapabilities = [
      { id: 1, pillar_id: 1 } as any,
      { id: 2, pillar_id: 2 } as any
    ];
    component.technologiesProcesses = [
      { id: 10, function_capability_id: 1 } as any,
      { id: 11, function_capability_id: 2 } as any
    ];
    component.selectedTechPillarId = 2;
    expect(component.filteredTechnologiesProcesses.length).toBe(1);
    expect(component.filteredTechnologiesProcesses[0].id).toBe(11);
  });

  it('getPillarName should return correct name or Unknown', () => {
    component.pillars = [{ id: 1, name: 'Pillar1' } as any];
    expect(component.getPillarName(1)).toBe('Pillar1');
    expect(component.getPillarName(99)).toBe('Unknown');
  });

  it('getPillarIdForTech should return correct pillar id', () => {
    component.functionCapabilities = [{ id: 1, pillar_id: 5 } as any];
    expect(component.getPillarIdForTech(1)).toBe(5);
    expect(component.getPillarIdForTech(99)).toBe(0);
  });

  it('getFunctionCapabilityName should return correct name or Unknown', () => {
    component.functionCapabilities = [{ id: 1, name: 'FC1' } as any];
    expect(component.getFunctionCapabilityName(1)).toBe('FC1');
    expect(component.getFunctionCapabilityName(99)).toBe('Unknown');
  });

  it('getMaturityStageName should return correct name or Unknown', () => {
    component.maturityStages = [{ id: 1, name: 'Stage1' } as any];
    expect(component.getMaturityStageName(1)).toBe('Stage1');
    expect(component.getMaturityStageName(99)).toBe('Unknown');
  });

  it('isInvalid should return true for invalid and dirty/touched/submitted', () => {
    const form = { controls: { test: { invalid: true, dirty: true } } } as any;
    expect(component.isInvalid(form, 'test')).toBeTrue();
    const form2 = { controls: { test: { invalid: true, touched: true } } } as any;
    expect(component.isInvalid(form2, 'test')).toBeTrue();
    const form3 = { controls: { test: { invalid: true } } } as any;
    expect(component.isInvalid(form3, 'test', true)).toBeTrue();
    const form4 = { controls: { test: { invalid: false } } } as any;
    expect(component.isInvalid(form4, 'test')).toBeFalse();
  });

  it('should reset function capability if pillar filter changes and no match', () => {
    component.functionCapabilities = [
      { id: 1, pillar_id: 1 } as any,
      { id: 2, pillar_id: 2 } as any
    ];
    component.selectedFunctionCapabilityId = 1;
    component.selectedTechPillarId = 2;
    spyOn(component.loadTechnologiesProcesses, 'emit');
    component.onTechPillarChange();
    expect(component.selectedFunctionCapabilityId).toBeNull();
    expect(component.loadTechnologiesProcesses.emit).toHaveBeenCalled();
  });
});
