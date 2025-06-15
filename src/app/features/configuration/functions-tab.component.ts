import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Pillar, FunctionCapability } from '../../models/ztmm.models';

@Component({
  selector: 'app-functions-tab',
  templateUrl: './functions-tab.component.html',
  styleUrls: ['./functions-tab.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class FunctionsTabComponent {
  @Input() pillars: Pillar[] = [];
  @Input() functionCapabilities: FunctionCapability[] = [];
  @Output() addFunctionCapability = new EventEmitter<{name: string, type: 'Function' | 'Capability', pillarId: number}>();
  @Output() removeFunctionCapability = new EventEmitter<number>();
  @Output() editFunctionCapability = new EventEmitter<{id: number, name: string, type: 'Function' | 'Capability', pillarId: number}>();
  @Output() saveFunctionOrder = new EventEmitter<number[]>();

  newFunctionCapability = '';
  newFunctionCapabilityType: 'Function' | 'Capability' = 'Function';
  selectedPillarId: number | null = null;
  functionFormSubmitted = false;
  dragFunctionIndex: number | null = null;
  editingFunctionId: number | null = null;
  editingFunction: Partial<FunctionCapability> = {};

  onAddFunctionCapability(form: NgForm) {
    this.functionFormSubmitted = true;
    if (form.valid && this.newFunctionCapability.trim() && this.selectedPillarId) {
      this.addFunctionCapability.emit({
        name: this.newFunctionCapability.trim(),
        type: this.newFunctionCapabilityType,
        pillarId: this.selectedPillarId
      });
      this.newFunctionCapability = '';
      this.functionFormSubmitted = false;
      form.resetForm();
      this.selectedPillarId = null;
      this.newFunctionCapabilityType = 'Function';
    }
  }

  onRemoveFunctionCapability(id: number) {
    if (confirm('Are you sure you want to delete this function/capability? This will also delete all associated technologies, processes, and assessments.')) {
      this.removeFunctionCapability.emit(id);
    }
  }

  startEditFunction(fc: FunctionCapability) {
    this.editingFunctionId = fc.id;
    this.editingFunction = { ...fc };
  }

  saveEditFunction() {
    if (this.editingFunctionId && this.editingFunction.name?.trim() &&
        this.editingFunction.type && this.editingFunction.pillar_id) {
      this.editFunctionCapability.emit({
        id: this.editingFunctionId,
        name: this.editingFunction.name.trim(),
        type: this.editingFunction.type,
        pillarId: this.editingFunction.pillar_id
      });
      this.cancelEditFunction();
    }
  }

  cancelEditFunction() {
    this.editingFunctionId = null;
    this.editingFunction = {};
  }

  onFunctionDragStart(index: number) {
    this.dragFunctionIndex = index;
  }

  onFunctionDrop(targetIndex: number) {
    if (this.dragFunctionIndex !== null && this.dragFunctionIndex !== targetIndex) {
      const draggedFunction = this.functionCapabilities[this.dragFunctionIndex];
      const newFunctions = [...this.functionCapabilities];

      // Remove the dragged item
      newFunctions.splice(this.dragFunctionIndex, 1);

      // Insert at new position
      const insertIndex = this.dragFunctionIndex < targetIndex ? targetIndex - 1 : targetIndex;
      newFunctions.splice(insertIndex, 0, draggedFunction);

      // Emit the new order (just IDs)
      this.saveFunctionOrder.emit(newFunctions.map(f => f.id));
    }
  }

  onFunctionDragEnd() {
    this.dragFunctionIndex = null;
  }

  getPillarName(pillarId: number): string {
    return this.pillars.find(p => p.id === pillarId)?.name || 'Unknown';
  }

  isInvalid(form: NgForm, name: string, submitted = false): boolean {
    const control = form.controls[name];
    return control && control.invalid && (control.dirty || control.touched || submitted);
  }
}
