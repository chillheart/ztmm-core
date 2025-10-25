import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Pillar, FunctionCapability, MaturityStage, ProcessTechnologyGroup } from '../../models/ztmm.models';

@Component({
  selector: 'app-technologies-v2-tab',
  templateUrl: './technologies-v2-tab.component.html',
  styleUrls: ['./technologies-v2-tab.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TechnologiesV2TabComponent {
  @Input() pillars: Pillar[] = [];
  @Input() functionCapabilities: FunctionCapability[] = [];
  @Input() maturityStages: MaturityStage[] = [];
  @Input() processTechnologyGroups: ProcessTechnologyGroup[] = [];
  @Output() addProcessTechnologyGroup = new EventEmitter<{
    name: string,
    description: string,
    type: 'Technology' | 'Process',
    functionCapabilityId: number,
    maturityStages: number[]
  }>();
  @Output() removeProcessTechnologyGroup = new EventEmitter<{ id: number, type: 'Technology' | 'Process' }>();
  @Output() editProcessTechnologyGroup = new EventEmitter<{
    id: number,
    name: string,
    description: string,
    type: 'Technology' | 'Process',
    functionCapabilityId: number,
    maturityStages: number[]
  }>();

  // Form properties
  newName = '';
  newDescription = '';
  newType: 'Technology' | 'Process' = 'Technology';
  selectedFunctionCapabilityId: number | null = null;
  selectedTechPillarId: number | string | null = null;
  selectedMaturityStageIds: number[] = [];
  formSubmitted = false;
  editingId: number | null = null;
  editingGroup: Partial<ProcessTechnologyGroup> = {};

  // Stage selection helpers
  stageSelectionMode: 'range' | 'individual' = 'range';
  rangeStartStageId: number | null = null;
  rangeEndStageId: number | null = null;

  get filteredFunctionCapabilities() {
    if (!this.selectedTechPillarId) return this.functionCapabilities;
    return this.functionCapabilities.filter(fc => fc.pillar_id === this.selectedTechPillarId);
  }

  get filteredProcessTechnologyGroups() {
    if (!this.selectedTechPillarId || this.selectedTechPillarId === 'null') {
      return this.processTechnologyGroups;
    }

    const pillarId = typeof this.selectedTechPillarId === 'string' ? Number(this.selectedTechPillarId) : this.selectedTechPillarId;
    const pillarFunctionCapabilityIds = this.functionCapabilities
      .filter(fc => fc.pillar_id === pillarId)
      .map(fc => fc.id);

    return this.processTechnologyGroups.filter(ptg =>
      pillarFunctionCapabilityIds.includes(ptg.function_capability_id)
    );
  }

  get sortedMaturityStages() {
    return [...this.maturityStages].sort((a, b) => a.id - b.id);
  }

  isStageSelected(stageId: number): boolean {
    return this.selectedMaturityStageIds.includes(stageId);
  }

  toggleStageSelection(stageId: number): void {
    const index = this.selectedMaturityStageIds.indexOf(stageId);
    if (index > -1) {
      this.selectedMaturityStageIds.splice(index, 1);
    } else {
      this.selectedMaturityStageIds.push(stageId);
    }
    this.selectedMaturityStageIds.sort((a, b) => a - b);
  }

  onStageSelectionModeChange(): void {
    this.selectedMaturityStageIds = [];
    this.rangeStartStageId = null;
    this.rangeEndStageId = null;
  }

  onRangeChange(): void {
    if (this.rangeStartStageId && this.rangeEndStageId) {
      const start = Math.min(this.rangeStartStageId, this.rangeEndStageId);
      const end = Math.max(this.rangeStartStageId, this.rangeEndStageId);
      this.selectedMaturityStageIds = this.sortedMaturityStages
        .filter(stage => stage.id >= start && stage.id <= end)
        .map(stage => stage.id);
    }
  }

  onAddGroup(form: NgForm): void {
    this.formSubmitted = true;

    if (!form.valid || !this.newName.trim() || !this.newDescription.trim() ||
        !this.selectedFunctionCapabilityId || this.selectedMaturityStageIds.length === 0) {
      return;
    }

    if (this.editingId) {
      // Edit mode
      this.editProcessTechnologyGroup.emit({
        id: this.editingId,
        name: this.newName.trim(),
        description: this.newDescription.trim(),
        type: this.newType,
        functionCapabilityId: this.selectedFunctionCapabilityId,
        maturityStages: [...this.selectedMaturityStageIds]
      });
    } else {
      // Add mode
      this.addProcessTechnologyGroup.emit({
        name: this.newName.trim(),
        description: this.newDescription.trim(),
        type: this.newType,
        functionCapabilityId: this.selectedFunctionCapabilityId,
        maturityStages: [...this.selectedMaturityStageIds]
      });
    }

    this.resetForm(form);
  }

  onRemoveGroup(group: ProcessTechnologyGroup): void {
    if (confirm(`Are you sure you want to delete "${group.name}"? This will also delete all associated maturity stage implementations and assessments.`)) {
      this.removeProcessTechnologyGroup.emit({ id: group.id, type: group.type });
    }
  }

  startEdit(group: ProcessTechnologyGroup): void {
    this.editingId = group.id;
    this.editingGroup = { ...group };
    this.newName = group.name;
    this.newDescription = group.description;
    this.newType = group.type;
    this.selectedFunctionCapabilityId = group.function_capability_id;

    // TODO: Load MaturityStageImplementations for this group to populate selectedMaturityStageIds
    // For now, we'll need to query them separately or pass them in
    // This is a limitation we'll address when we add stage management
    this.selectedMaturityStageIds = [];

    // Scroll to form
    setTimeout(() => {
      document.querySelector('.add-group-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editingGroup = {};
    this.newName = '';
    this.newDescription = '';
    this.newType = 'Technology';
    this.selectedFunctionCapabilityId = null;
    this.selectedMaturityStageIds = [];
  }

  resetForm(form: NgForm): void {
    this.newName = '';
    this.newDescription = '';
    this.newType = 'Technology';
    this.selectedFunctionCapabilityId = null;
    this.selectedMaturityStageIds = [];
    this.rangeStartStageId = null;
    this.rangeEndStageId = null;
    this.formSubmitted = false;
    this.editingId = null;
    this.editingGroup = {};
    form.resetForm();
  }

  onTechPillarChange(): void {
    if (typeof this.selectedTechPillarId === 'string') {
      this.selectedTechPillarId = this.selectedTechPillarId === 'null' ? null : Number(this.selectedTechPillarId);
    }

    if (this.selectedFunctionCapabilityId && this.selectedTechPillarId) {
      const selectedFunction = this.functionCapabilities.find(fc => fc.id === this.selectedFunctionCapabilityId);
      if (selectedFunction && selectedFunction.pillar_id !== this.selectedTechPillarId) {
        this.selectedFunctionCapabilityId = null;
      }
    }
  }

  getPillarName(pillarId: number): string {
    return this.pillars.find(p => p.id === pillarId)?.name || 'Unknown';
  }

  getPillarIdForGroup(functionCapabilityId: number): number {
    return this.functionCapabilities.find(fc => fc.id === functionCapabilityId)?.pillar_id || 0;
  }

  getFunctionCapabilityName(functionCapabilityId: number): string {
    return this.functionCapabilities.find(fc => fc.id === functionCapabilityId)?.name || 'Unknown';
  }

  getMaturityStageName(maturityStageId: number): string {
    return this.maturityStages.find(ms => ms.id === maturityStageId)?.name || 'Unknown';
  }

  getStageRange(group: ProcessTechnologyGroup): string {
    // This is a placeholder - we'll need to query MaturityStageImplementations
    // to get the actual stages this group spans
    return 'Multiple stages';
  }

  isInvalid(form: NgForm, name: string, submitted = false): boolean {
    const control = form.controls[name];
    return control && control.invalid && (control.dirty || control.touched || submitted);
  }
}
