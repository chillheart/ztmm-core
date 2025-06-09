import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ZtmmDataWebService } from './services/ztmm-data-web.service';
import { DataExportService } from './utilities/data-export.service';
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
  activeTab: 'pillars' | 'functions' | 'tech' | 'management' = 'pillars';

  // Data Export properties
  dataStatistics = {
    pillars: 0,
    functionCapabilities: 0,
    maturityStages: 0,
    technologiesProcesses: 0,
    assessmentResponses: 0
  };
  isImporting = false;
  isExporting = false;
  isResetting = false;

  // For drag-and-drop
  dragPillarIndex: number | null = null;
  dragFunctionIndex: number | null = null;

  editingPillarId: number | null = null;
  editingPillarName = '';
  editingFunctionId: number | null = null;
  editingFunction: Partial<FunctionCapability> = {};
  editingTechProcessId: number | null = null;
  editingTechProcess: Partial<TechnologyProcess> = {};

  constructor(private data: ZtmmDataWebService, private exportService: DataExportService) {
    this.loadAll();
    this.loadDataStatistics();
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
    if (techForm && techForm.invalid) {
      return;
    }
    if (!this.newTechnologyProcess.trim() || !this.selectedFunctionCapabilityId || !this.selectedMaturityStageId) {
      return;
    }

    try {
      await this.data.addTechnologyProcess(
        this.newTechnologyProcess.trim(),
        this.newTechnologyProcessType,
        this.selectedFunctionCapabilityId,
        this.selectedMaturityStageId
      );

      this.newTechnologyProcess = '';
      this.newTechnologyProcessType = 'Technology';

      await this.loadTechnologiesProcesses();

      this.techFormSubmitted = false;
      // Do not reset the form, just clear validation styling
      if (techForm) {
        setTimeout(() => techForm.form.markAsPristine());
      }
    } catch (error) {
      console.error('Error in addTechnologyProcess:', error);
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

  onTechPillarChange() {
    // If a function capability is selected, check if it still matches the new pillar filter
    if (this.selectedFunctionCapabilityId && this.selectedTechPillarId) {
      const selectedFunction = this.functionCapabilities.find(fc => fc.id === this.selectedFunctionCapabilityId);
      if (selectedFunction && selectedFunction.pillar_id !== this.selectedTechPillarId) {
        // Reset function capability selection if it doesn't match the new pillar filter
        this.selectedFunctionCapabilityId = null;
        this.loadTechnologiesProcesses();
      }
    }
  }

  get filteredFunctionCapabilities() {
    if (!this.selectedTechPillarId) return this.functionCapabilities;
    return this.functionCapabilities.filter(fc => fc.pillar_id === this.selectedTechPillarId);
  }

  // Data Export methods
  async loadDataStatistics() {
    try {
      this.dataStatistics = await this.exportService.getDataStatistics();
    } catch (error) {
      console.error('Error loading data statistics:', error);
    }
  }

  async exportData() {
    try {
      this.isExporting = true;
      await this.exportService.downloadExport();
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data. Please check the console for details.');
    } finally {
      this.isExporting = false;
    }
  }

  async onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    if (!file.name.endsWith('.json')) {
      alert('Please select a JSON file');
      return;
    }

    // Enhanced confirmation since import now performs complete database reset
    const confirmation = confirm(
      'Are you sure you want to import this data? This will:\n\n' +
      '• COMPLETELY RESET the database (same as "Reset Database" button)\n' +
      '• Delete ALL existing data\n' +
      '• Import the JSON data with original IDs preserved\n' +
      '• Replace the entire database structure with the imported data\n\n' +
      'This action cannot be undone!'
    );

    if (!confirmation) {
      // Reset the file input if user cancels
      target.value = '';
      return;
    }

    const doubleConfirmation = confirm(
      'Final confirmation: The database will be completely reset and replaced with the imported data.\n\n' +
      'Click OK to proceed with the import.'
    );

    if (!doubleConfirmation) {
      // Reset the file input if user cancels
      target.value = '';
      return;
    }

    try {
      this.isImporting = true;
      await this.exportService.uploadAndImport(file);
      alert('Data imported successfully! The database has been completely replaced with the imported data.');

      // Reload all data and statistics
      await this.loadAll();
      await this.loadDataStatistics();

      // Reset the file input
      target.value = '';
    } catch (error) {
      console.error('Error importing data:', error);
      alert('Error importing data. Please check the console for details.');
    } finally {
      this.isImporting = false;
    }
  }

  async resetDatabase() {
    const confirmation = confirm(
      'Are you sure you want to completely reset the database? This will:\n\n' +
      '• Delete the ENTIRE database from IndexedDB\n' +
      '• Reinitialize with fresh ZTMM framework structure\n' +
      '• Delete ALL technologies/processes\n' +
      '• Delete ALL function/capabilities (including custom ones)\n' +
      '• Delete ALL pillars (including custom ones)\n' +
      '• Delete ALL assessment responses\n' +
      '• Reset to default ZTMM framework only\n\n' +
      'This action cannot be undone!'
    );

    if (!confirmation) return;

    const doubleConfirmation = confirm(
      'This is your final warning! The entire database will be permanently deleted and recreated.\n\n' +
      'Click OK to proceed with the complete database reset.'
    );

    if (!doubleConfirmation) return;

    try {
      this.isResetting = true;

      // Use the new resetDatabase method that completely drops and recreates the database
      await this.data.resetDatabase();

      // Reload all data and statistics to reflect the reset
      await this.loadAll();
      await this.loadDataStatistics();

      alert('Database has been completely reset and reinitialized with fresh ZTMM framework!');
    } catch (error) {
      console.error('Error resetting database:', error);
      alert('Error resetting database. Please check the console for details.');
    } finally {
      this.isResetting = false;
    }
  }

}
