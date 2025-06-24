import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FunctionSummary, DetailedAssessmentItem } from '../models/report.models';
import { MaturityCalculationService } from '../services/maturity-calculation.service';

@Component({
  selector: 'app-function-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="functionSummary">
      <!-- Function Header -->
      <div class="card mb-4">
        <div class="card-header">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h4 class="mb-1">
                <i class="bi bi-gear-fill text-primary me-2"></i>
                {{ functionSummary.functionCapability.name }}
              </h4>
              <div class="d-flex gap-3 align-items-center">
                <span class="badge bg-primary">{{ functionSummary.functionCapability.type }}</span>
                <span class="badge {{ maturityCalc.getMaturityStageColor(functionSummary.overallMaturityStage) }}">
                  Maturity: {{ functionSummary.overallMaturityStage }}
                </span>
                <span class="text-muted">
                  {{ functionSummary.assessmentPercentage }}% assessed
                  ({{ functionSummary.assessedItems }}/{{ functionSummary.totalItems }})
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="card-body">
          <!-- Function Maturity Stage Breakdown -->
          <div class="row">
            <div *ngFor="let breakdown of functionSummary.maturityStageBreakdown" class="col-md-3 col-sm-6 mb-3">
              <div class="card h-100">
                <div class="card-body text-center">
                  <div class="display-6 mb-2">
                    <i class="bi {{ maturityCalc.getStatusIcon(breakdown.status) }} {{ maturityCalc.getStatusClass(breakdown.status) }} rounded-circle p-2"></i>
                  </div>
                  <h6 class="card-title">{{ breakdown.stageName }}</h6>
                  <div class="h4 mb-1">{{ breakdown.completionPercentage }}%</div>
                  <div class="text-muted small">
                    {{ breakdown.completedItems }} of {{ breakdown.assessedItems }} completed
                  </div>
                  <div class="text-muted small">
                    {{ breakdown.assessedItems }} of {{ breakdown.totalItems }} assessed
                  </div>

                  <!-- Progress breakdown -->
                  <div class="mt-2" *ngIf="breakdown.assessedItems > 0">
                    <div class="small text-success" *ngIf="breakdown.completedItems > 0">
                      ✓ {{ breakdown.completedItems }} completed
                    </div>
                    <div class="small text-warning" *ngIf="breakdown.inProgressItems > 0">
                      ⏳ {{ breakdown.inProgressItems }} in progress
                    </div>
                    <div class="small text-danger" *ngIf="breakdown.notStartedItems > 0">
                      ✗ {{ breakdown.notStartedItems }} not started
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Assessment Items -->
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Assessment Details</h5>
          <button type="button"
                  class="btn btn-outline-secondary btn-sm"
                  (click)="toggleDescriptions()"
                  title="Toggle technology descriptions">
            <i class="bi bi-text-paragraph me-1"></i>
            {{ showDescriptions ? 'Hide' : 'Show' }} Descriptions
          </button>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Technology/Process</th>
                  <th>Type</th>
                  <th class="text-center">Maturity Stage</th>
                  <th class="text-center">Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of detailedItems"
                    [class]="getRowClass(item.status)">
                  <td>
                    <div class="fw-semibold">{{ item.name }}</div>
                    <div *ngIf="showDescriptions" class="text-muted small mt-1">{{ item.description }}</div>
                  </td>
                  <td>
                    <span class="badge bg-secondary">{{ item.type }}</span>
                  </td>
                  <td class="text-center">
                    <span class="badge {{ maturityCalc.getMaturityStageColor(item.maturityStageName) }}">
                      {{ item.maturityStageName }}
                    </span>
                  </td>
                  <td class="text-center">
                    <span class="badge {{ maturityCalc.getAssessmentStatusClass(item.status) }}">
                      {{ item.status }}
                    </span>
                  </td>
                  <td>
                    <div class="text-muted small" [title]="item.notes">
                      {{ item.notes || 'No notes' }}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card-body .card {
      transition: transform 0.2s ease;
    }

    .card-body .card:hover {
      transform: translateY(-2px);
    }

    .table tbody tr.status-completed {
      background-color: rgba(25, 135, 84, 0.05);
    }

    .table tbody tr.status-in-progress {
      background-color: rgba(255, 193, 7, 0.05);
    }

    .table tbody tr.status-not-started {
      background-color: rgba(220, 53, 69, 0.05);
    }

    .small {
      font-size: 0.775rem;
    }
  `]
})
export class FunctionDetailComponent {
  @Input() functionSummary: FunctionSummary | null = null;
  @Input() detailedItems: DetailedAssessmentItem[] = [];
  @Input() showDescriptions = false;
  @Output() descriptionsToggled = new EventEmitter<boolean>();

  constructor(public maturityCalc: MaturityCalculationService) {}

  toggleDescriptions(): void {
    this.showDescriptions = !this.showDescriptions;
    this.descriptionsToggled.emit(this.showDescriptions);
  }

  getRowClass(status: string): string {
    switch (status) {
      case 'Fully Implemented':
      case 'Superseded':
        return 'status-completed';
      case 'Partially Implemented':
        return 'status-in-progress';
      case 'Not Implemented':
        return 'status-not-started';
      default:
        return '';
    }
  }
}
