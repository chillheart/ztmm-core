import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Pillar } from '../models/ztmm.models';

@Component({
  selector: 'app-pillars-tab',
  templateUrl: './pillars-tab.component.html',
  styleUrls: ['./pillars-tab.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PillarsTabComponent {
  @Input() pillars: Pillar[] = [];
  @Output() addPillar = new EventEmitter<string>();
  @Output() removePillar = new EventEmitter<number>();
  @Output() editPillar = new EventEmitter<{id: number, name: string}>();
  @Output() savePillarOrder = new EventEmitter<number[]>();

  newPillar = '';
  pillarFormSubmitted = false;
  dragPillarIndex: number | null = null;
  editingPillarId: number | null = null;
  editingPillarName = '';

  onAddPillar(form: NgForm) {
    this.pillarFormSubmitted = true;
    if (form.valid && this.newPillar.trim()) {
      this.addPillar.emit(this.newPillar.trim());
      this.newPillar = '';
      this.pillarFormSubmitted = false;
      form.resetForm();
    }
  }

  onRemovePillar(id: number) {
    if (confirm('Are you sure you want to delete this pillar? This will also delete all associated functions, capabilities, technologies, processes, and assessments.')) {
      this.removePillar.emit(id);
    }
  }

  startEditPillar(pillar: Pillar) {
    this.editingPillarId = pillar.id;
    this.editingPillarName = pillar.name;
  }

  saveEditPillar() {
    if (this.editingPillarId && this.editingPillarName.trim()) {
      this.editPillar.emit({
        id: this.editingPillarId,
        name: this.editingPillarName.trim()
      });
      this.cancelEditPillar();
    }
  }

  cancelEditPillar() {
    this.editingPillarId = null;
    this.editingPillarName = '';
  }

  onPillarDragStart(index: number) {
    this.dragPillarIndex = index;
  }

  onPillarDrop(targetIndex: number) {
    if (this.dragPillarIndex !== null && this.dragPillarIndex !== targetIndex) {
      const draggedPillar = this.pillars[this.dragPillarIndex];
      const newPillars = [...this.pillars];

      // Remove the dragged item
      newPillars.splice(this.dragPillarIndex, 1);

      // Insert at new position
      const insertIndex = this.dragPillarIndex < targetIndex ? targetIndex - 1 : targetIndex;
      newPillars.splice(insertIndex, 0, draggedPillar);

      // Emit the new order (just IDs)
      this.savePillarOrder.emit(newPillars.map(p => p.id));
    }
  }

  onPillarDragEnd() {
    this.dragPillarIndex = null;
  }

  isInvalid(form: NgForm, name: string, submitted = false): boolean {
    const control = form.controls[name];
    return control && control.invalid && (control.dirty || control.touched || submitted);
  }
}
