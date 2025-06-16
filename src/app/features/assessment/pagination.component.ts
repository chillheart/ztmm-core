import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class PaginationComponent {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() itemsPerPage = 5;
  @Input() totalItems = 0;
  @Input() showSaveButton = true;
  
  // Stage-based pagination inputs
  @Input() availableStages: string[] = [];
  @Input() currentStageName = '';
  @Input() currentStageItemCount = 0;

  @Output() pageChange = new EventEmitter<number>();
  @Output() previousPage = new EventEmitter<void>();
  @Output() nextPage = new EventEmitter<void>();
  @Output() saveCurrentPage = new EventEmitter<void>();

  // Make Math available to template
  Math = Math;

  onPageClick(page: number): void {
    this.pageChange.emit(page);
  }

  onPreviousClick(): void {
    this.previousPage.emit();
  }

  onNextClick(): void {
    this.nextPage.emit();
  }

  onSaveClick(): void {
    this.saveCurrentPage.emit();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;

    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
      const end = Math.min(this.totalPages, start + maxVisible - 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  getStageDisplayName(pageNumber: number): string {
    if (this.availableStages.length > 0 && pageNumber >= 1 && pageNumber <= this.availableStages.length) {
      return this.availableStages[pageNumber - 1];
    }
    return pageNumber.toString();
  }

  getStageColorClass(stageName: string): string {
    switch (stageName) {
      case 'Traditional': return 'btn-secondary';
      case 'Initial': return 'btn-warning';
      case 'Advanced': return 'btn-info';
      case 'Optimal': return 'btn-success';
      default: return 'btn-outline-primary';
    }
  }

  getStartItem(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }
}
