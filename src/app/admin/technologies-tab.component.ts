import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Pillar, FunctionCapability, MaturityStage, TechnologyProcess } from '../models/ztmm.models';

@Component({
  selector: 'app-technologies-tab',
  templateUrl: './technologies-tab.component.html',
  styleUrls: ['./technologies-tab.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TechnologiesTabComponent {
  @Input() pillars: Pillar[] = [];
  @Input() functionCapabilities: FunctionCapability[] = [];
  @Input() maturityStages: MaturityStage[] = [];
  @Input() technologiesProcesses: TechnologyProcess[] = [];
  @Output() addTechnologyProcess = new EventEmitter<{description: string, type: 'Technology' | 'Process', functionCapabilityId: number, maturityStageId: number}>();
  @Output() removeTechnologyProcess = new EventEmitter<number>();
  @Output() editTechnologyProcess = new EventEmitter<{id: number, description: string, type: 'Technology' | 'Process', functionCapabilityId: number, maturityStageId: number}>();
  @Output() loadTechnologiesProcesses = new EventEmitter<void>();

  newTechnologyProcess = '';
  newTechnologyProcessType: 'Technology' | 'Process' = 'Technology';
  selectedFunctionCapabilityId: number | null = null;
  selectedMaturityStageId: number | null = null;
  selectedTechPillarId: number | null = null;
  techFormSubmitted = false;
  editingTechProcessId: number | null = null;
  editingTechProcess: Partial<TechnologyProcess> = {};

  get filteredFunctionCapabilities() {
    if (!this.selectedTechPillarId) return this.functionCapabilities;
    return this.functionCapabilities.filter(fc => fc.pillar_id === this.selectedTechPillarId);
  }

  get filteredTechnologiesProcesses() {
    if (!this.selectedTechPillarId) return this.technologiesProcesses;

    // Get function capability IDs that belong to the selected pillar
    const pillarFunctionCapabilityIds = this.functionCapabilities
      .filter(fc => fc.pillar_id === this.selectedTechPillarId)
      .map(fc => fc.id);

    // Filter technologies/processes that belong to those function capabilities
    return this.technologiesProcesses.filter(tp =>
      pillarFunctionCapabilityIds.includes(tp.function_capability_id)
    );
  }

  onAddTechnologyProcess(form: NgForm) {
    this.techFormSubmitted = true;
    if (form.valid && this.newTechnologyProcess.trim() &&
        this.selectedFunctionCapabilityId && this.selectedMaturityStageId) {
      this.addTechnologyProcess.emit({
        description: this.newTechnologyProcess.trim(),
        type: this.newTechnologyProcessType,
        functionCapabilityId: this.selectedFunctionCapabilityId,
        maturityStageId: this.selectedMaturityStageId
      });
      this.newTechnologyProcess = '';
      this.techFormSubmitted = false;
      form.resetForm();
      this.selectedFunctionCapabilityId = null;
      this.selectedMaturityStageId = null;
      this.newTechnologyProcessType = 'Technology';
    }
  }

  onRemoveTechnologyProcess(id: number) {
    if (confirm('Are you sure you want to delete this technology/process? This will also delete all associated assessments.')) {
      this.removeTechnologyProcess.emit(id);
    }
  }

  startEditTechProcess(tp: TechnologyProcess) {
    this.editingTechProcessId = tp.id;
    this.editingTechProcess = { ...tp };
  }

  saveEditTechProcess() {
    if (this.editingTechProcessId && this.editingTechProcess.description?.trim() &&
        this.editingTechProcess.type && this.editingTechProcess.function_capability_id &&
        this.editingTechProcess.maturity_stage_id) {
      this.editTechnologyProcess.emit({
        id: this.editingTechProcessId,
        description: this.editingTechProcess.description.trim(),
        type: this.editingTechProcess.type,
        functionCapabilityId: this.editingTechProcess.function_capability_id,
        maturityStageId: this.editingTechProcess.maturity_stage_id
      });
      this.cancelEditTechProcess();
    }
  }

  cancelEditTechProcess() {
    this.editingTechProcessId = null;
    this.editingTechProcess = {};
  }

  onTechPillarChange() {
    // If a function capability is selected, check if it still matches the new pillar filter
    if (this.selectedFunctionCapabilityId && this.selectedTechPillarId) {
      const selectedFunction = this.functionCapabilities.find(fc => fc.id === this.selectedFunctionCapabilityId);
      if (selectedFunction && selectedFunction.pillar_id !== this.selectedTechPillarId) {
        // Reset function capability selection if it doesn't match the new pillar filter
        this.selectedFunctionCapabilityId = null;
        this.loadTechnologiesProcesses.emit();
      }
    }
  }

  getPillarName(pillarId: number): string {
    return this.pillars.find(p => p.id === pillarId)?.name || 'Unknown';
  }

  getFunctionCapabilityName(functionCapabilityId: number): string {
    return this.functionCapabilities.find(fc => fc.id === functionCapabilityId)?.name || 'Unknown';
  }

  getMaturityStageName(maturityStageId: number): string {
    return this.maturityStages.find(ms => ms.id === maturityStageId)?.name || 'Unknown';
  }

  isInvalid(form: NgForm, name: string, submitted = false): boolean {
    const control = form.controls[name];
    return control && control.invalid && (control.dirty || control.touched || submitted);
  }
}
