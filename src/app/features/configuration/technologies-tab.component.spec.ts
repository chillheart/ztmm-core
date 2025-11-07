import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TechnologiesTabComponent } from './technologies-tab.component';
import { Pillar, FunctionCapability, MaturityStage, ProcessTechnologyGroup } from '../../models/ztmm.models';

describe('TechnologiesTabComponent', () => {
  let component: TechnologiesTabComponent;
  let fixture: ComponentFixture<TechnologiesTabComponent>;

  const mockPillars: Pillar[] = [
    { id: 1, name: 'Identity' },
    { id: 2, name: 'Network' }
  ];

  const mockFunctionCapabilities: FunctionCapability[] = [
    { id: 1, name: 'Authentication', type: 'Function', pillar_id: 1 },
    { id: 2, name: 'Authorization', type: 'Function', pillar_id: 1 },
    { id: 3, name: 'Segmentation', type: 'Function', pillar_id: 2 }
  ];

  const mockMaturityStages: MaturityStage[] = [
    { id: 1, name: 'Initial' },
    { id: 2, name: 'Traditional' },
    { id: 3, name: 'Advanced' },
    { id: 4, name: 'Optimal' }
  ];

  const mockProcessTechnologyGroups: ProcessTechnologyGroup[] = [
    { id: 1, name: 'SSO System', description: 'Single Sign-On', type: 'Technology', function_capability_id: 1, order_index: 1 },
    { id: 2, name: 'MFA Solution', description: 'Multi-Factor Authentication', type: 'Technology', function_capability_id: 1, order_index: 2 },
    { id: 3, name: 'Firewall', description: 'Network Firewall', type: 'Technology', function_capability_id: 3, order_index: 3 }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, TechnologiesTabComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TechnologiesTabComponent);
    component = fixture.componentInstance;

    component.pillars = mockPillars;
    component.functionCapabilities = mockFunctionCapabilities;
    component.maturityStages = mockMaturityStages;
    component.processTechnologyGroups = mockProcessTechnologyGroups;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Filtering', () => {
    it('should filter by pillar', () => {
      component.selectedTechPillarId = 1;
      const filtered = component.filteredProcessTechnologyGroups;
      expect(filtered.length).toBe(2);
      expect(filtered.every(ptg => {
        const fc = mockFunctionCapabilities.find(f => f.id === ptg.function_capability_id);
        return fc?.pillar_id === 1;
      })).toBe(true);
    });

    it('should filter by search text (name)', () => {
      component.searchText = 'SSO';
      const filtered = component.filteredProcessTechnologyGroups;
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('SSO System');
    });

    it('should filter by search text (description)', () => {
      component.searchText = 'Single Sign-On';
      const filtered = component.filteredProcessTechnologyGroups;
      expect(filtered.length).toBe(1);
      expect(filtered[0].description).toBe('Single Sign-On');
    });

    it('should filter by search text (function capability name)', () => {
      component.searchText = 'Segmentation';
      const filtered = component.filteredProcessTechnologyGroups;
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Firewall');
    });

    it('should filter by search text (pillar name)', () => {
      component.searchText = 'Network';
      const filtered = component.filteredProcessTechnologyGroups;
      expect(filtered.length).toBe(1);
      expect(filtered[0].function_capability_id).toBe(3);
    });

    it('should be case-insensitive when searching', () => {
      component.searchText = 'sso';
      const filtered = component.filteredProcessTechnologyGroups;
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('SSO System');
    });

    it('should trim search text', () => {
      component.searchText = '  SSO  ';
      const filtered = component.filteredProcessTechnologyGroups;
      expect(filtered.length).toBe(1);
    });

    it('should return all groups when search text is empty', () => {
      component.searchText = '';
      const filtered = component.filteredProcessTechnologyGroups;
      expect(filtered.length).toBe(3);
    });

    it('should combine pillar and search filters', () => {
      component.selectedTechPillarId = 1;
      component.searchText = 'SSO';
      const filtered = component.filteredProcessTechnologyGroups;
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('SSO System');
    });

    it('should return empty array when no matches found', () => {
      component.searchText = 'NonExistent';
      const filtered = component.filteredProcessTechnologyGroups;
      expect(filtered.length).toBe(0);
    });
  });

  describe('Function Capability Filtering', () => {
    it('should filter function capabilities by selected pillar', () => {
      component.selectedTechPillarId = 1;
      const filtered = component.filteredFunctionCapabilities;
      expect(filtered.length).toBe(2);
      expect(filtered.every(fc => fc.pillar_id === 1)).toBe(true);
    });

    it('should return all function capabilities when no pillar is selected', () => {
      component.selectedTechPillarId = null;
      const filtered = component.filteredFunctionCapabilities;
      expect(filtered.length).toBe(3);
    });
  });

  describe('Stage Selection', () => {
    it('should toggle stage selection', () => {
      component.toggleStageSelection(1);
      expect(component.selectedMaturityStageIds).toContain(1);

      component.toggleStageSelection(1);
      expect(component.selectedMaturityStageIds).not.toContain(1);
    });

    it('should check if stage is selected', () => {
      component.selectedMaturityStageIds = [1, 2];
      expect(component.isStageSelected(1)).toBe(true);
      expect(component.isStageSelected(3)).toBe(false);
    });

    it('should select single stage', () => {
      component.selectedMaturityStageIds = [1, 2];
      component.selectSingleStage(3);
      expect(component.selectedMaturityStageIds).toEqual([3]);
    });

    it('should clear selections when changing mode', () => {
      component.selectedMaturityStageIds = [1, 2];
      component.rangeStartStageId = 1;
      component.rangeEndStageId = 3;

      component.onStageSelectionModeChange();

      expect(component.selectedMaturityStageIds).toEqual([]);
      expect(component.rangeStartStageId).toBeNull();
      expect(component.rangeEndStageId).toBeNull();
    });

    it('should select range of stages', () => {
      component.rangeStartStageId = 1;
      component.rangeEndStageId = 3;

      component.onRangeChange();

      expect(component.selectedMaturityStageIds).toEqual([1, 2, 3]);
    });

    it('should handle reverse range selection', () => {
      component.rangeStartStageId = 3;
      component.rangeEndStageId = 1;

      component.onRangeChange();

      expect(component.selectedMaturityStageIds).toEqual([1, 2, 3]);
    });
  });

  describe('Form Operations', () => {
    it('should add a new group', () => {
      spyOn(component.addProcessTechnologyGroup, 'emit');

      component.newName = 'Test Group';
      component.newDescription = 'Test Description';
      component.newType = 'Technology';
      component.selectedFunctionCapabilityId = 1;
      component.selectedMaturityStageIds = [1, 2];

      const mockForm: any = {
        valid: true,
        resetForm: jasmine.createSpy('resetForm')
      };

      component.onAddGroup(mockForm);

      expect(component.addProcessTechnologyGroup.emit).toHaveBeenCalledWith({
        name: 'Test Group',
        description: 'Test Description',
        type: 'Technology',
        functionCapabilityId: 1,
        maturityStages: [1, 2]
      });
      expect(mockForm.resetForm).toHaveBeenCalled();
    });

    it('should not add group if form is invalid', () => {
      spyOn(component.addProcessTechnologyGroup, 'emit');

      component.newName = '';
      component.selectedFunctionCapabilityId = 1;
      component.selectedMaturityStageIds = [1];

      const mockForm: any = {
        valid: false,
        resetForm: jasmine.createSpy('resetForm')
      };

      component.onAddGroup(mockForm);

      expect(component.addProcessTechnologyGroup.emit).not.toHaveBeenCalled();
    });

    it('should remove a group after confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(component.removeProcessTechnologyGroup, 'emit');

      component.onRemoveGroup(mockProcessTechnologyGroups[0]);

      expect(window.confirm).toHaveBeenCalled();
      expect(component.removeProcessTechnologyGroup.emit).toHaveBeenCalledWith({
        id: 1,
        type: 'Technology'
      });
    });

    it('should not remove group if not confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      spyOn(component.removeProcessTechnologyGroup, 'emit');

      component.onRemoveGroup(mockProcessTechnologyGroups[0]);

      expect(component.removeProcessTechnologyGroup.emit).not.toHaveBeenCalled();
    });

    it('should edit an existing group', () => {
      spyOn(component.editProcessTechnologyGroup, 'emit');

      component.editingId = 1;
      component.newName = 'Updated Name';
      component.newDescription = 'Updated Description';
      component.newType = 'Process';
      component.selectedFunctionCapabilityId = 2;
      component.selectedMaturityStageIds = [2, 3];

      const mockForm: any = {
        valid: true,
        resetForm: jasmine.createSpy('resetForm')
      };

      component.onAddGroup(mockForm);

      expect(component.editProcessTechnologyGroup.emit).toHaveBeenCalledWith({
        id: 1,
        name: 'Updated Name',
        description: 'Updated Description',
        type: 'Process',
        functionCapabilityId: 2,
        maturityStages: [2, 3]
      });
    });

    it('should start editing a group', () => {
      component.startEdit(mockProcessTechnologyGroups[0]);

      expect(component.editingId).toBe(1);
      expect(component.newName).toBe('SSO System');
      expect(component.newDescription).toBe('Single Sign-On');
      expect(component.newType).toBe('Technology');
      expect(component.selectedFunctionCapabilityId).toBe(1);
    });

    it('should cancel editing', () => {
      component.editingId = 1;
      component.newName = 'Test';

      component.cancelEdit();

      expect(component.editingId).toBeNull();
      expect(component.newName).toBe('');
    });

    it('should reset form', () => {
      component.newName = 'Test';
      component.editingId = 1;
      component.selectedMaturityStageIds = [1, 2];

      const mockForm: any = {
        resetForm: jasmine.createSpy('resetForm')
      };

      component.resetForm(mockForm);

      expect(component.newName).toBe('');
      expect(component.editingId).toBeNull();
      expect(component.selectedMaturityStageIds).toEqual([]);
      expect(mockForm.resetForm).toHaveBeenCalled();
    });
  });

  describe('Pillar Change', () => {
    it('should reset function capability if it doesn\'t belong to new pillar', () => {
      component.selectedFunctionCapabilityId = 1;
      component.selectedTechPillarId = 2;

      component.onTechPillarChange();

      expect(component.selectedFunctionCapabilityId).toBeNull();
    });

    it('should keep function capability if it belongs to selected pillar', () => {
      component.selectedFunctionCapabilityId = 1;
      component.selectedTechPillarId = 1;

      component.onTechPillarChange();

      expect(component.selectedFunctionCapabilityId).toBe(1);
    });

    it('should convert string pillar ID to number', () => {
      component.selectedTechPillarId = '1' as any;

      component.onTechPillarChange();

      expect(component.selectedTechPillarId).toBe(1);
    });

    it('should convert "null" string to null', () => {
      component.selectedTechPillarId = 'null' as any;

      component.onTechPillarChange();

      expect(component.selectedTechPillarId).toBeNull();
    });
  });

  describe('Helper Methods', () => {
    it('should get pillar name', () => {
      expect(component.getPillarName(1)).toBe('Identity');
      expect(component.getPillarName(999)).toBe('Unknown');
    });

    it('should get pillar ID for group', () => {
      expect(component.getPillarIdForGroup(1)).toBe(1);
      expect(component.getPillarIdForGroup(3)).toBe(2);
      expect(component.getPillarIdForGroup(999)).toBe(0);
    });

    it('should get function capability name', () => {
      expect(component.getFunctionCapabilityName(1)).toBe('Authentication');
      expect(component.getFunctionCapabilityName(999)).toBe('Unknown');
    });

    it('should get maturity stage name', () => {
      expect(component.getMaturityStageName(1)).toBe('Initial');
      expect(component.getMaturityStageName(999)).toBe('Unknown');
    });

    it('should return sorted maturity stages', () => {
      const sorted = component.sortedMaturityStages;
      expect(sorted[0].id).toBe(1);
      expect(sorted[sorted.length - 1].id).toBe(4);
    });
  });

  describe('Form Validation', () => {
    it('should check if field is invalid', () => {
      const mockForm: any = {
        controls: {
          testField: {
            invalid: true,
            dirty: true,
            touched: false
          }
        }
      };

      expect(component.isInvalid(mockForm, 'testField', false)).toBe(true);
    });

    it('should consider form submission in validation', () => {
      const mockForm: any = {
        controls: {
          testField: {
            invalid: true,
            dirty: false,
            touched: false
          }
        }
      };

      expect(component.isInvalid(mockForm, 'testField', true)).toBe(true);
    });
  });
});
