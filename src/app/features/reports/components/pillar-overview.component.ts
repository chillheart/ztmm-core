import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PillarSummary } from '../models/report.models';
import { MaturityCalculationService } from '../services/maturity-calculation.service';

@Component({
  selector: 'app-pillar-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="row g-4" *ngIf="pillarSummaries.length > 0">
      <div *ngFor="let pillarSummary of pillarSummaries; let i = index" class="col-lg-6 col-xl-4">
        <div class="card h-100 pillar-summary-card"
             (click)="onPillarClick(pillarSummary)"
             role="button"
             tabindex="0"
             (keydown.enter)="onPillarClick(pillarSummary)"
             (keydown.space)="onPillarClick(pillarSummary)">
          <div class="card-header">
            <h5 class="card-title mb-1">
              <i class="bi bi-diagram-3-fill text-primary me-2"></i>
              {{ pillarSummary.pillar.name }}
            </h5>
            <div class="d-flex justify-content-between align-items-center">
              <span class="badge {{ maturityCalc.getMaturityStageColor(pillarSummary.overallMaturityStage) }}">
                {{ pillarSummary.overallMaturityStage }}
              </span>
              <small class="text-muted">
                {{ pillarSummary.functions.length }} function{{ pillarSummary.functions.length !== 1 ? 's' : '' }}
              </small>
            </div>
          </div>
          <div class="card-body">
            <!-- Assessment Progress -->
            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted small">Assessment Progress</span>
                <span class="badge bg-light text-dark">{{ pillarSummary.assessmentPercentage }}%</span>
              </div>
              <div class="progress" style="height: 8px;">
                <div class="progress-bar bg-primary"
                     [style.width.%]="pillarSummary.assessmentPercentage"
                     role="progressbar"></div>
              </div>
              <div class="d-flex justify-content-between mt-1">
                <small class="text-muted">{{ pillarSummary.assessedItems }} assessed</small>
                <small class="text-muted">{{ pillarSummary.totalItems }} total</small>
              </div>
            </div>

            <!-- Maturity Stage Breakdown -->
            <div class="maturity-stage-summary">
              <h6 class="text-muted mb-2">Maturity Stage Progress</h6>
              <div class="row g-2">
                <div *ngFor="let breakdown of pillarSummary.maturityStageBreakdown" class="col-6">
                  <div class="d-flex align-items-center">
                    <span class="badge {{ maturityCalc.getStatusClass(breakdown.status) }} me-2" style="min-width: 20px;">
                      <i class="bi {{ maturityCalc.getStatusIcon(breakdown.status) }}"></i>
                    </span>
                    <div class="flex-grow-1">
                      <div class="small fw-semibold">{{ breakdown.stageName }}</div>
                      <div class="small text-muted">
                        {{ breakdown.completionPercentage }}% complete
                        <span class="text-muted">({{ breakdown.completedItems }}/{{ breakdown.assessedItems }})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="card-footer bg-transparent">
            <div class="d-flex justify-content-end">
              <button class="btn btn-outline-primary btn-sm">
                <i class="bi bi-arrow-right me-1"></i>View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Data Message -->
    <div *ngIf="pillarSummaries.length === 0" class="row justify-content-center">
      <div class="col-lg-8">
        <div class="alert alert-info text-center">
          <i class="bi bi-info-circle fs-2 mb-3"></i>
          <h5>No Assessment Data Found</h5>
          <p class="mb-3">No assessment data is available to generate reports. Please complete some assessments first.</p>
          <a routerLink="/assessment" class="btn btn-primary">
            <i class="bi bi-clipboard-check me-2"></i>Start Assessment
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pillar-summary-card {
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .pillar-summary-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .maturity-stage-summary .badge {
      font-size: 0.7rem;
    }
  `]
})
export class PillarOverviewComponent {
  @Input() pillarSummaries: PillarSummary[] = [];
  @Output() pillarSelected = new EventEmitter<PillarSummary>();

  constructor(public maturityCalc: MaturityCalculationService) {}

  onPillarClick(pillarSummary: PillarSummary): void {
    this.pillarSelected.emit(pillarSummary);
  }
}
