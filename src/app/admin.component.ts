import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ZtmmDataService } from './services/ztmm-data.service';
import { Pillar, FunctionCapability, MaturityStage, TechnologyProcess } from './models/ztmm.models';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AdminComponent {
  pillars: Pillar[] = [];
  functionCapabilities: FunctionCapability[] = [];
  maturityStages: MaturityStage[] = [];
  technologiesProcesses: TechnologyProcess[] = [];

  newPillar = '';
  newFunctionCapability = '';
  newFunctionCapabilityType: 'Function' | 'Capability' = 'Function';
  selectedPillarId: number | null = null;
  newTechnologyProcess = '';
  newTechnologyProcessType: 'Technology' | 'Process' = 'Technology';
  selectedFunctionCapabilityId: number | null = null;
  selectedMaturityStageId: number | null = null;
  activeTab: 'pillars' | 'functions' | 'tech' = 'pillars';

  // For drag-and-drop
  dragPillarIndex: number | null = null;
  dragFunctionIndex: number | null = null;

  editingPillarId: number | null = null;
  editingPillarName = '';
  editingFunctionId: number | null = null;
  editingFunction: Partial<FunctionCapability> = {};
  editingTechProcessId: number | null = null;
  editingTechProcess: Partial<TechnologyProcess> = {};

  constructor(private data: ZtmmDataService) {
    this.loadAll();
  }

  async loadAll() {
    try {
      this.maturityStages = await this.data.getMaturityStages();
    } catch (error) {
      console.error('Error loading maturity stages:', error);
      this.maturityStages = [];
    }

    try {
      this.pillars = await this.data.getPillars();
    } catch (error) {
      console.error('Error loading pillars:', error);
      this.pillars = [];
    }

    try {
      this.functionCapabilities = await this.data.getFunctionCapabilities();
    } catch (error) {
      console.error('Error loading function capabilities:', error);
      this.functionCapabilities = [];
    }

    await this.loadTechnologiesProcesses();
  }

  async loadTechnologiesProcesses() {
    try {
      if (this.selectedFunctionCapabilityId) {
        this.technologiesProcesses = await this.data.getTechnologiesProcesses(this.selectedFunctionCapabilityId);
      } else {
        // Show all for admin view
        let all: TechnologyProcess[] = [];
        if (Array.isArray(this.functionCapabilities)) {
          for (const fc of this.functionCapabilities) {
            try {
              const tps = await this.data.getTechnologiesProcesses(fc.id);
              all = all.concat(tps);
            } catch (error) {
              console.error(`Error loading technologies/processes for function capability ${fc.id}:`, error);
            }
          }
        }
        this.technologiesProcesses = all;
      }
    } catch (error) {
      console.error('Error loading technologies/processes:', error);
      this.technologiesProcesses = [];
    }
  }

  async addPillar(pillarForm?: NgForm) {
    this.pillarFormSubmitted = true;
    if (pillarForm && pillarForm.invalid) return;
    if (!this.newPillar.trim()) return;

    try {
      await this.data.addPillar(this.newPillar.trim());
      this.newPillar = '';
      this.pillars = await this.data.getPillars();
      this.pillarFormSubmitted = false;
      // Do not reset the form, just clear validation styling
      if (pillarForm) {
        setTimeout(() => pillarForm.form.markAsPristine());
      }
    } catch (error) {
      console.error('Error adding pillar:', error);
    }
  }

  async addFunctionCapability(functionForm?: NgForm) {
    this.functionFormSubmitted = true;
    if (functionForm && functionForm.invalid) return;
    if (!this.newFunctionCapability.trim() || !this.selectedPillarId) return;
    await this.data.addFunctionCapability(this.newFunctionCapability.trim(), this.newFunctionCapabilityType, this.selectedPillarId);
    this.newFunctionCapability = '';
    this.functionCapabilities = await this.data.getFunctionCapabilities();
    this.loadTechnologiesProcesses();
    this.functionFormSubmitted = false;
    // Do not reset the form, just clear validation styling
    if (functionForm) {
      setTimeout(() => functionForm.form.markAsPristine());
    }
  }

  async addTechnologyProcess(techForm?: NgForm) {
    this.techFormSubmitted = true;
    if (techForm && techForm.invalid) return;
    if (!this.newTechnologyProcess.trim() || !this.selectedFunctionCapabilityId || !this.selectedMaturityStageId) return;
    await this.data.addTechnologyProcess(
      this.newTechnologyProcess.trim(),
      this.newTechnologyProcessType,
      this.selectedFunctionCapabilityId,
      this.selectedMaturityStageId
    );
    this.newTechnologyProcess = '';
    this.newTechnologyProcessType = 'Technology';
    this.loadTechnologiesProcesses();
    this.techFormSubmitted = false;
    // Do not reset the form, just clear validation styling
    if (techForm) {
      setTimeout(() => techForm.form.markAsPristine());
    }
  }

  async removePillar(id: number) {
    if (!confirm('Are you sure you want to delete this pillar? This will also delete all associated function/capabilities and technologies/processes.')) {
      return;
    }

    try {
      await this.data.removePillar(id);
      this.pillars = await this.data.getPillars();
      this.functionCapabilities = await this.data.getFunctionCapabilities();
      this.loadTechnologiesProcesses();
    } catch (error) {
      console.error('Error removing pillar:', error);
    }
  }

  async removeFunctionCapability(id: number) {
    if (!confirm('Are you sure you want to delete this function/capability? This will also delete all associated technologies/processes.')) {
      return;
    }

    try {
      await this.data.removeFunctionCapability(id);
      this.functionCapabilities = await this.data.getFunctionCapabilities();
      this.loadTechnologiesProcesses();
    } catch (error) {
      console.error('Error removing function capability:', error);
    }
  }

  async removeTechnologyProcess(id: number) {
    if (!confirm('Are you sure you want to delete this technology/process?')) {
      return;
    }

    try {
      await this.data.removeTechnologyProcess(id);
      this.loadTechnologiesProcesses();
    } catch (error) {
      console.error('Error removing technology process:', error);
    }
  }

  getPillarName(id: number) {
    return this.pillars.find(p => p.id === id)?.name || 'Unknown';
  }
  getFunctionCapabilityName(id: number) {
    return this.functionCapabilities.find(fc => fc.id === id)?.name || 'Unknown';
  }
  getMaturityStageName(id: number) {
    return this.maturityStages.find(ms => ms.id === id)?.name || 'Unknown';
  }

  // For drag-and-drop
  onPillarDragStart(index: number) {
    this.dragPillarIndex = index;
  }
  onPillarDrop(index: number) {
    if (this.dragPillarIndex === null || this.dragPillarIndex === index) return;
    const moved = this.pillars.splice(this.dragPillarIndex, 1)[0];
    this.pillars.splice(index, 0, moved);
    this.dragPillarIndex = null;
    this.savePillarOrder();
  }
  onPillarDragEnd() {
    this.dragPillarIndex = null;
  }
  async savePillarOrder() {
    await this.data.savePillarOrder(this.pillars.map(p => p.id));
  }

  onFunctionDragStart(index: number) {
    this.dragFunctionIndex = index;
  }
  onFunctionDrop(index: number) {
    if (this.dragFunctionIndex === null || this.dragFunctionIndex === index) return;
    const moved = this.functionCapabilities.splice(this.dragFunctionIndex, 1)[0];
    this.functionCapabilities.splice(index, 0, moved);
    this.dragFunctionIndex = null;
    this.saveFunctionOrder();
  }
  onFunctionDragEnd() {
    this.dragFunctionIndex = null;
  }
  async saveFunctionOrder() {
    await this.data.saveFunctionOrder(this.functionCapabilities.map(fc => fc.id));
  }

  startEditPillar(pillar: Pillar) {
    this.editingPillarId = pillar.id;
    this.editingPillarName = pillar.name;
  }
  async saveEditPillar() {
    if (this.editingPillarId && this.editingPillarName.trim()) {
      await this.data.editPillar(this.editingPillarId, this.editingPillarName.trim());
      this.pillars = await this.data.getPillars();
    }
    this.editingPillarId = null;
    this.editingPillarName = '';
  }
  cancelEditPillar() {
    this.editingPillarId = null;
    this.editingPillarName = '';
  }

  startEditFunction(fc: FunctionCapability) {
    this.editingFunctionId = fc.id;
    this.editingFunction = { ...fc };
  }
  async saveEditFunction() {
    if (this.editingFunctionId && this.editingFunction.name?.trim() && this.editingFunction.type && this.editingFunction.pillar_id) {
      await this.data.editFunctionCapability(
        this.editingFunctionId,
        this.editingFunction.name.trim(),
        this.editingFunction.type,
        this.editingFunction.pillar_id
      );
      this.functionCapabilities = await this.data.getFunctionCapabilities();
      this.loadTechnologiesProcesses();
    }
    this.editingFunctionId = null;
    this.editingFunction = {};
  }
  cancelEditFunction() {
    this.editingFunctionId = null;
    this.editingFunction = {};
  }

  startEditTechProcess(tp: TechnologyProcess) {
    this.editingTechProcessId = tp.id;
    this.editingTechProcess = { ...tp };
  }
  async saveEditTechProcess() {
    if (
      this.editingTechProcessId &&
      this.editingTechProcess.description?.trim() &&
      this.editingTechProcess.type &&
      this.editingTechProcess.function_capability_id &&
      this.editingTechProcess.maturity_stage_id
    ) {
      await this.data.editTechnologyProcess(
        this.editingTechProcessId,
        this.editingTechProcess.description.trim(),
        this.editingTechProcess.type,
        this.editingTechProcess.function_capability_id,
        this.editingTechProcess.maturity_stage_id
      );
      this.loadTechnologiesProcesses();
    }
    this.editingTechProcessId = null;
    this.editingTechProcess = {};
  }
  cancelEditTechProcess() {
    this.editingTechProcessId = null;
    this.editingTechProcess = {};
  }

  // Helper for validation
  isInvalid(form: NgForm, name: string, submitted = false) {
    const control = form.controls[name];
    return control && control.invalid && (control.dirty || control.touched || submitted);
  }

  // Track form submission for validation
  pillarFormSubmitted = false;
  functionFormSubmitted = false;
  techFormSubmitted = false;

  selectedTechPillarId: number | null = null;
  get filteredFunctionCapabilities() {
    if (!this.selectedTechPillarId) return this.functionCapabilities;
    return this.functionCapabilities.filter(fc => fc.pillar_id === this.selectedTechPillarId);
  }
  onTechPillarChange() {
    // Reset function capability selection if it doesn't match the filter
    if (this.selectedFunctionCapabilityId && this.selectedTechPillarId) {
      const match = this.functionCapabilities.find(fc => fc.id === this.selectedFunctionCapabilityId && fc.pillar_id === this.selectedTechPillarId);
      if (!match) {
        this.selectedFunctionCapabilityId = null;
        this.loadTechnologiesProcesses();
      }
    }
  }
}
