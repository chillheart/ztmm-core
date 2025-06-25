import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AssessmentItemComponent } from './assessment-item.component';
import { PaginationComponent } from './pagination.component';
import { TechnologyProcess, AssessmentStatus, FunctionCapability, MaturityStage } from '../../models/ztmm.models';

@Component({
  selector: 'app-assessment-overview',
  templateUrl: './assessment-overview.component.html',
  styleUrls: ['./assessment-overview.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AssessmentItemComponent, PaginationComponent]
})
export class AssessmentOverviewComponent {
  @Input() technologiesProcesses: TechnologyProcess[] = [];
  @Input() paginatedTechnologiesProcesses: TechnologyProcess[] = [];
  @Input() assessmentStatuses: (AssessmentStatus | null)[] = [];
  @Input() assessmentNotes: string[] = [];
  @Input() statusOptions: AssessmentStatus[] = [];
  @Input() functionCapabilities: FunctionCapability[] = [];
  @Input() maturityStages: MaturityStage[] = [];
  @Input() selectedFunctionCapabilityName = '';
  @Input() selectedFunctionCapabilityType = '';
  @Input() isAutoSaving = false;
  @Input() showSuccess = false;
  @Input() showTechnologyDescriptions = true;

  // Pagination inputs
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() itemsPerPage = 5;

  // Maturity stage grouping inputs
  @Input() technologiesProcessesByStage: Record<string, TechnologyProcess[]> = {};
  @Input() availableStages: string[] = [];
  @Input() currentStageName = '';
  @Input() currentStageItemCount = 0;

  @Output() assessmentChange = new EventEmitter<{index: number, field: 'status' | 'notes', value: AssessmentStatus | null | string}>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() previousPage = new EventEmitter<void>();
  @Output() nextPage = new EventEmitter<void>();
  @Output() saveCurrentPage = new EventEmitter<void>();
  @Output() saveAll = new EventEmitter<void>();
  @Output() toggleDescriptions = new EventEmitter<void>();

  // Make Math available to template
  Math = Math;

  onAssessmentChange(index: number, field: 'status' | 'notes', value: AssessmentStatus | null | string): void {
    this.assessmentChange.emit({ index, field, value });
  }

  onStatusChange(localIndex: number, status: AssessmentStatus | null): void {
    this.onAssessmentChange(localIndex, 'status', status);
  }

  onNotesChange(localIndex: number, notes: string): void {
    this.onAssessmentChange(localIndex, 'notes', notes);
  }

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  onPreviousPage(): void {
    this.previousPage.emit();
  }

  onNextPage(): void {
    this.nextPage.emit();
  }

  onSaveCurrentPage(): void {
    this.saveCurrentPage.emit();
  }

  onSaveAll(): void {
    this.saveAll.emit();
  }

  onToggleDescriptions(): void {
    this.toggleDescriptions.emit();
  }

  getGlobalItemIndex(localIndex: number): number {
    return (this.currentPage - 1) * this.itemsPerPage + localIndex;
  }

  getCurrentProgress(): number {
    if (this.technologiesProcesses.length === 0) return 0;
    const completedCount = this.assessmentStatuses.filter(status => status !== null).length;
    return Math.round((completedCount / this.technologiesProcesses.length) * 100);
  }

  getMaturityStageName(id: number): string {
    return this.maturityStages.find(ms => ms.id === id)?.name || 'Unknown';
  }

  getStageColorClass(stageName: string): string {
    switch (stageName) {
      case 'Traditional': return 'bg-secondary';
      case 'Initial': return 'bg-warning';
      case 'Advanced': return 'bg-info';
      case 'Optimal': return 'bg-success';
      default: return 'bg-light';
    }
  }

  shouldShowItem(_tp: TechnologyProcess): boolean {
    // Show all items when using stage grouping (pagination happens at stage level)
    return true;
  }

  getItemNumber(tp: TechnologyProcess): number {
    const index = this.technologiesProcesses.findIndex(item => item.id === tp.id);
    return index + 1;
  }

  getStatusForItem(tp: TechnologyProcess): AssessmentStatus | null {
    const index = this.technologiesProcesses.findIndex(item => item.id === tp.id);
    return index >= 0 ? this.assessmentStatuses[index] : null;
  }

  getNotesForItem(tp: TechnologyProcess): string {
    const index = this.technologiesProcesses.findIndex(item => item.id === tp.id);
    return index >= 0 ? (this.assessmentNotes[index] || '') : '';
  }

  onStatusChangeForItem(tp: TechnologyProcess, status: AssessmentStatus | null): void {
    const index = this.technologiesProcesses.findIndex(item => item.id === tp.id);
    if (index >= 0) {
      this.assessmentChange.emit({ index, field: 'status', value: status });
    }
  }

  onNotesChangeForItem(tp: TechnologyProcess, notes: string): void {
    const index = this.technologiesProcesses.findIndex(item => item.id === tp.id);
    if (index >= 0) {
      this.assessmentChange.emit({ index, field: 'notes', value: notes });
    }
  }

  getCurrentStageItems(): TechnologyProcess[] {
    return this.currentStageName ? (this.technologiesProcessesByStage[this.currentStageName] || []) : [];
  }

  shouldShowCurrentStage(): boolean {
    return !!this.currentStageName && this.getCurrentStageItems().length > 0;
  }
}
