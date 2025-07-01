import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PillarsTabComponent } from './pillars-tab.component';
import { By } from '@angular/platform-browser';
import { Pillar } from '../../models/ztmm.models';
import { FormsModule } from '@angular/forms';
describe('PillarsTabComponent', () => {
  let component: PillarsTabComponent;
  let fixture: ComponentFixture<PillarsTabComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PillarsTabComponent, FormsModule]
    }).compileComponents();
    fixture = TestBed.createComponent(PillarsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should show empty state when no pillars', () => {
    component.pillars = [];
    fixture.detectChanges();
    const emptyState = fixture.debugElement.query(By.css('.text-center.py-5'));
    expect(emptyState).toBeTruthy();
    expect(emptyState.nativeElement.textContent).toContain('No pillars defined yet');
  });
  it('should render a list of pillars', () => {
    const testPillars: Pillar[] = [
      { id: 1, name: 'Identity' },
      { id: 2, name: 'Device' }
    ];
    component.pillars = testPillars;
    fixture.detectChanges();
    const items = fixture.debugElement.queryAll(By.css('.list-group-item'));
    expect(items.length).toBe(2);
    expect(items[0].nativeElement.textContent).toContain('Identity');
    expect(items[1].nativeElement.textContent).toContain('Device');
  });
  it('should show edit and delete buttons for each pillar', () => {
    component.pillars = [
      { id: 1, name: 'Identity' }
    ];
    fixture.detectChanges();
    const editBtn = fixture.debugElement.query(By.css('button[title="Edit pillar"]'));
    const deleteBtn = fixture.debugElement.query(By.css('button[title="Delete pillar"]'));
    expect(editBtn).toBeTruthy();
    expect(deleteBtn).toBeTruthy();
  });
  it('should set draggable attribute on pillar items', () => {
    component.pillars = [
      { id: 1, name: 'Identity' }
    ];
    fixture.detectChanges();
    const item = fixture.debugElement.query(By.css('.list-group-item'));
    expect(item.attributes['draggable']).toBe('true');
  });
  it('should emit addPillar when form is valid and submitted', () => {
    spyOn(component.addPillar, 'emit');
    component.newPillar = 'Network';
    const form = { valid: true, resetForm: () => { /* no-op for test */ }, controls: { pillar: { invalid: false, dirty: true } } } as any;
    component.onAddPillar(form);
    expect(component.addPillar.emit).toHaveBeenCalledWith('Network');
  });
  it('should not emit addPillar if form is invalid or name is empty', () => {
    spyOn(component.addPillar, 'emit');
    const form = { valid: false, resetForm: () => { /* no-op for test */ }, controls: { pillar: { invalid: true, dirty: true } } } as any;
    component.newPillar = '';
    component.onAddPillar(form);
    expect(component.addPillar.emit).not.toHaveBeenCalled();
  });
  it('should emit removePillar when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(component.removePillar, 'emit');
    component.onRemovePillar(2);
    expect(component.removePillar.emit).toHaveBeenCalledWith(2);
  });
  it('should not emit removePillar if not confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    spyOn(component.removePillar, 'emit');
    component.onRemovePillar(2);
    expect(component.removePillar.emit).not.toHaveBeenCalled();
  });
  it('should enter edit mode and save/cancel edits', () => {
    component.pillars = [{ id: 1, name: 'Device' }];
    component.startEditPillar(component.pillars[0]);
    expect(component.editingPillarId).toBe(1);
    expect(component.editingPillarName).toBe('Device');
    spyOn(component.editPillar, 'emit');
    component.editingPillarName = 'Device Updated';
    component.saveEditPillar();
    expect(component.editPillar.emit).toHaveBeenCalledWith({ id: 1, name: 'Device Updated' });
    component.startEditPillar(component.pillars[0]);
    component.cancelEditPillar();
    expect(component.editingPillarId).toBeNull();
    expect(component.editingPillarName).toBe('');
  });
  it('should emit savePillarOrder on drag and drop', () => {
    component.pillars = [
      { id: 1, name: 'Identity' },
      { id: 2, name: 'Device' },
      { id: 3, name: 'Network' }
    ];
    spyOn(component.savePillarOrder, 'emit');
    component.onPillarDragStart(0);
    component.onPillarDrop(2);
    expect(component.savePillarOrder.emit).toHaveBeenCalledWith([2, 1, 3]);
    component.onPillarDragEnd();
    expect(component.dragPillarIndex).toBeNull();
  });
  it('should validate pillar name input', () => {
    const form = { controls: { pillar: { invalid: true, dirty: true } } } as any;
    expect(component.isInvalid(form, 'pillar', true)).toBeTrue();
  });
});
