import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewLevel, PillarSummary, FunctionSummary } from '../models/report.models';

@Component({
  selector: 'app-reports-breadcrumb',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav aria-label="breadcrumb" class="mb-4" *ngIf="currentView !== 'pillar-overview'">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <a href="#"
             (click)="navigateTo('pillar-overview'); $event.preventDefault()"
             class="text-decoration-none">
            <i class="bi bi-house me-1"></i>Pillar Overview
          </a>
        </li>
        <li class="breadcrumb-item"
            *ngIf="selectedPillar"
            [class.active]="currentView === 'pillar-detail'">
          <a href="#"
             *ngIf="currentView === 'function-detail'"
             (click)="navigateTo('pillar-detail'); $event.preventDefault()"
             class="text-decoration-none">
            {{ selectedPillar.pillar.name }}
          </a>
          <span *ngIf="currentView === 'pillar-detail'">{{ selectedPillar.pillar.name }}</span>
        </li>
        <li class="breadcrumb-item active"
            *ngIf="selectedFunction && currentView === 'function-detail'">
          {{ selectedFunction.functionCapability.name }}
        </li>
      </ol>
    </nav>
  `,
  styles: [`
    .breadcrumb-item a {
      color: var(--bs-primary);
      transition: color 0.2s ease;
    }

    .breadcrumb-item a:hover {
      color: var(--bs-primary);
      text-decoration: underline !important;
    }
  `]
})
export class ReportsBreadcrumbComponent {
  @Input() currentView: ViewLevel = 'pillar-overview';
  @Input() selectedPillar: PillarSummary | null = null;
  @Input() selectedFunction: FunctionSummary | null = null;
  @Output() navigationRequested = new EventEmitter<ViewLevel>();

  navigateTo(view: ViewLevel): void {
    this.navigationRequested.emit(view);
  }
}
