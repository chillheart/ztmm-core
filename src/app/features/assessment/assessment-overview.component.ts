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
  @Input() selectedFunctionCapabilityName: string = '';
  @Input() selectedFunctionCapabilityType: string = '';
  @Input() isAutoSaving: boolean = false;
  @Input() showSuccess: boolean = false;

  // Pagination inputs
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() itemsPerPage: number = 5;

  @Output() assessmentChange = new EventEmitter<{index: number, field: 'status' | 'notes', value: AssessmentStatus | null | string}>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() previousPage = new EventEmitter<void>();
  @Output() nextPage = new EventEmitter<void>();
  @Output() saveCurrentPage = new EventEmitter<void>();
  @Output() saveAll = new EventEmitter<void>();

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

  getGlobalItemIndex(localIndex: number): number {
    return (this.currentPage - 1) * this.itemsPerPage + localIndex;
  }

  getCurrentProgress(): number {
    if (this.technologiesProcesses.length === 0) return 0;
    const completedCount = this.assessmentStatuses.filter(status => status !== null).length;
    return Math.round((completedCount / this.technologiesProcesses.length) * 100);
  }
}
