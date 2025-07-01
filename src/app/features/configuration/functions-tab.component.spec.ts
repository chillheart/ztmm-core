import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FunctionsTabComponent } from './functions-tab.component';
describe('FunctionsTabComponent', () => {
  let component: FunctionsTabComponent;
  let fixture: ComponentFixture<FunctionsTabComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FunctionsTabComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(FunctionsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should emit addFunctionCapability when form is valid and submitted', () => {
    spyOn(component.addFunctionCapability, 'emit');
    component.newFunctionCapability = 'Test Function';
    component.newFunctionCapabilityType = 'Function';
    component.selectedPillarId = 1;
    const form = { valid: true, resetForm: () => { /* no-op for test */ }, controls: {} } as any;
    component.onAddFunctionCapability(form);
    expect(component.addFunctionCapability.emit).toHaveBeenCalledWith({
      name: 'Test Function',
      type: 'Function',
      pillarId: 1
    });
  });
  it('should emit removeFunctionCapability when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(component.removeFunctionCapability, 'emit');
    component.onRemoveFunctionCapability(2);
    expect(component.removeFunctionCapability.emit).toHaveBeenCalledWith(2);
  });
  it('should not emit removeFunctionCapability when not confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    spyOn(component.removeFunctionCapability, 'emit');
    component.onRemoveFunctionCapability(2);
    expect(component.removeFunctionCapability.emit).not.toHaveBeenCalled();
  });
  it('should start and cancel editing function', () => {
    const fc = { id: 3, name: 'EditMe', type: 'Function', pillar_id: 1 } as any;
    component.startEditFunction(fc);
    expect(component.editingFunctionId).toBe(3);
    expect(component.editingFunction.name).toBe('EditMe');
    component.cancelEditFunction();
    expect(component.editingFunctionId).toBeNull();
    expect(component.editingFunction).toEqual({});
  });
  it('should emit editFunctionCapability and reset edit state on saveEditFunction', () => {
    spyOn(component.editFunctionCapability, 'emit');
    component.editingFunctionId = 4;
    component.editingFunction = { name: 'EditSave', type: 'Capability', pillar_id: 2 };
    component.saveEditFunction();
    expect(component.editFunctionCapability.emit).toHaveBeenCalledWith({
      id: 4, name: 'EditSave', type: 'Capability', pillarId: 2
    });
    expect(component.editingFunctionId).toBeNull();
  });
  it('should handle drag and drop reordering and emit saveFunctionOrder', () => {
    component.functionCapabilities = [
      { id: 1 } as any,
      { id: 2 } as any,
      { id: 3 } as any
    ];
    spyOn(component.saveFunctionOrder, 'emit');
    component.onFunctionDragStart(0);
    component.onFunctionDrop(2);
    expect(component.saveFunctionOrder.emit).toHaveBeenCalledWith([2, 3, 1]);
    component.onFunctionDragEnd();
    expect(component.dragFunctionIndex).toBeNull();
  });
  it('getPillarName should return correct name or Unknown', () => {
    component.pillars = [{ id: 1, name: 'Pillar1' } as any];
    expect(component.getPillarName(1)).toBe('Pillar1');
    expect(component.getPillarName(99)).toBe('Unknown');
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
});
