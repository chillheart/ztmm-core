import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Pillar, FunctionCapability, MaturityStage, ProcessTechnologyGroup } from '../../models/ztmm.models';
import { IndexedDBService } from '../../services/indexeddb.service';

export interface WizardStageImplementation {
  maturity_stage_id: number;
  maturity_stage_name: string;
  description: string;
}

export interface WizardResult {
  // Step 1: Basic Info
  name: string;
  description: string;
  type: 'Technology' | 'Process';
  functionCapabilityId: number;
  maturityStages: number[];

  // Step 2: Stage Implementations
  stageImplementations: WizardStageImplementation[];
}

@Component({
  selector: 'app-process-tech-wizard-modal',
  templateUrl: './process-tech-wizard-modal.component.html',
  styleUrls: ['./process-tech-wizard-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ProcessTechWizardModalComponent implements OnInit {
  @Input() pillars: Pillar[] = [];
  @Input() functionCapabilities: FunctionCapability[] = [];
  @Input() maturityStages: MaturityStage[] = [];
  @Input() editingGroup: ProcessTechnologyGroup | null = null;
  @Output() save = new EventEmitter<WizardResult>();
  @Output() cancelled = new EventEmitter<void>();

  // Inject IndexedDB service
  private data = inject(IndexedDBService);

  // Wizard state
  currentStep: 1 | 2 = 1;

  // Step 1: Basic Information
  name = '';
  description = '';
  type: 'Technology' | 'Process' = 'Technology';
  selectedFunctionCapabilityId: number | null = null;
  selectedPillarId: number | null = null;
  selectedMaturityStageIds: number[] = [];
  step1Submitted = false;

  // Step 2: Stage Implementations
  stageImplementations: WizardStageImplementation[] = [];
  step2Submitted = false;

  get filteredFunctionCapabilities() {
    if (!this.selectedPillarId) return this.functionCapabilities;
    return this.functionCapabilities.filter(fc => fc.pillar_id === this.selectedPillarId);
  }

  get sortedMaturityStages() {
    return [...this.maturityStages].sort((a, b) => a.id - b.id);
  }

  get canProceedToStep2(): boolean {
    return !!(
      this.name.trim() &&
      this.description.trim() &&
      this.selectedFunctionCapabilityId &&
      this.selectedMaturityStageIds.length > 0
    );
  }

  get canSave(): boolean {
    return this.stageImplementations.every(si => si.description.trim().length > 0);
  }

  async ngOnInit() {
    // If editing, populate form
    if (this.editingGroup) {
      this.name = this.editingGroup.name;
      this.description = this.editingGroup.description;
      this.type = this.editingGroup.type;
      this.selectedFunctionCapabilityId = this.editingGroup.function_capability_id;

      // Set pillar based on function capability
      const fc = this.functionCapabilities.find(f => f.id === this.editingGroup!.function_capability_id);
      if (fc) {
        this.selectedPillarId = fc.pillar_id;
      }

      // Load existing stage implementations
      const existingImplementations = await this.data.getMaturityStageImplementationsByGroup(this.editingGroup.id);

      // Extract the maturity stage IDs
      this.selectedMaturityStageIds = existingImplementations
        .map(impl => impl.maturity_stage_id)
        .sort((a, b) => a - b);
    }
  }

  onPillarChange() {
    // Clear function capability if it doesn't belong to selected pillar
    if (this.selectedFunctionCapabilityId && this.selectedPillarId) {
      const selectedFunction = this.functionCapabilities.find(
        fc => fc.id === this.selectedFunctionCapabilityId
      );
      if (selectedFunction && selectedFunction.pillar_id !== this.selectedPillarId) {
        this.selectedFunctionCapabilityId = null;
      }
    }
  }

  isStageSelected(stageId: number): boolean {
    return this.selectedMaturityStageIds.includes(stageId);
  }

  toggleStageInRange(stageId: number): void {
    const currentlySelected = [...this.selectedMaturityStageIds];

    if (currentlySelected.length === 0) {
      // First selection: just select this stage
      this.selectedMaturityStageIds = [stageId];
    } else if (currentlySelected.length === 1) {
      // Second selection: create a range between first and second
      const firstStageId = currentlySelected[0];
      if (firstStageId === stageId) {
        // Clicking the same stage deselects it
        this.selectedMaturityStageIds = [];
      } else {
        // Create range from first to second
        const start = Math.min(firstStageId, stageId);
        const end = Math.max(firstStageId, stageId);
        this.selectedMaturityStageIds = this.sortedMaturityStages
          .filter(stage => stage.id >= start && stage.id <= end)
          .map(stage => stage.id);
      }
    } else {
      // Already have a range: clicking any stage resets to just that stage
      this.selectedMaturityStageIds = [stageId];
    }
  }

  getMaturityStageName(maturityStageId: number): string {
    return this.maturityStages.find(ms => ms.id === maturityStageId)?.name || 'Unknown';
  }

  getSelectedStageNames(): string {
    return this.selectedMaturityStageIds
      .map(id => this.getMaturityStageName(id))
      .join(', ');
  }

  async nextStep() {
    this.step1Submitted = true;

    if (!this.canProceedToStep2) {
      return;
    }

    // Initialize stage implementations for step 2
    if (this.editingGroup) {
      // Load existing descriptions when editing
      const existingImplementations = await this.data.getMaturityStageImplementationsByGroup(this.editingGroup.id);

      this.stageImplementations = this.selectedMaturityStageIds.map(stageId => {
        const existing = existingImplementations.find(impl => impl.maturity_stage_id === stageId);
        return {
          maturity_stage_id: stageId,
          maturity_stage_name: this.getMaturityStageName(stageId),
          description: existing ? existing.description : '' // Use existing description or empty
        };
      });
    } else {
      // New group: empty descriptions
      this.stageImplementations = this.selectedMaturityStageIds.map(stageId => ({
        maturity_stage_id: stageId,
        maturity_stage_name: this.getMaturityStageName(stageId),
        description: '' // User will fill this in
      }));
    }

    this.currentStep = 2;
  }

  previousStep() {
    this.currentStep = 1;
    this.step2Submitted = false;
  }

  onCancel() {
    this.cancelled.emit();
  }

  getExampleDescription(maturityStageId: number, type: 'Technology' | 'Process'): string {
    const examples = {
      Technology: {
        1: 'Manual processes with spreadsheets and basic tools',
        2: 'Point solutions implemented with limited integration',
        3: 'Integrated platform with automation and monitoring',
        4: 'AI-driven, self-healing system with predictive analytics'
      },
      Process: {
        1: 'Ad-hoc, reactive approach with no formal documentation',
        2: 'Basic documented procedures with manual execution',
        3: 'Standardized workflows with automation and metrics',
        4: 'Continuous optimization with real-time feedback loops'
      }
    };

    return examples[type][maturityStageId as keyof typeof examples.Technology] || 'Describe implementation details';
  }

  onSave() {
    this.step2Submitted = true;

    if (!this.canSave) {
      return;
    }

    const result: WizardResult = {
      name: this.name.trim(),
      description: this.description.trim(),
      type: this.type,
      functionCapabilityId: this.selectedFunctionCapabilityId!,
      maturityStages: this.selectedMaturityStageIds,
      stageImplementations: this.stageImplementations
    };

    this.save.emit(result);
  }
}
