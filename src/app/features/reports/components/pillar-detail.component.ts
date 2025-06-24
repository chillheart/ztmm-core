import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PillarSummary, FunctionSummary } from '../models/report.models';
import { MaturityCalculationService } from '../services/maturity-calculation.service';

@Component({
  selector: 'app-pillar-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="pillarSummary">
      <!-- Pillar Header -->
      <div class="card mb-4">
        <div class="card-header">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h4 class="mb-1">
                <i class="bi bi-diagram-3-fill text-primary me-2"></i>
                {{ pillarSummary.pillar.name }}
              </h4>
              <div class="d-flex gap-3 align-items-center">
                <span class="badge {{ maturityCalc.getMaturityStageColor(pillarSummary.overallMaturityStage) }} fs-6">
                  Overall Maturity: {{ pillarSummary.overallMaturityStage }}
                </span>
                <span class="text-muted">
                  {{ pillarSummary.functions.length }} function{{ pillarSummary.functions.length !== 1 ? 's' : '' }} •
                  {{ pillarSummary.assessmentPercentage }}% assessed
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="card-body">
          <!-- Pillar Maturity Stage Overview -->
          <div class="row mb-4">
            <div *ngFor="let breakdown of pillarSummary.maturityStageBreakdown" class="col-md-3 col-sm-6 mb-3">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Functions Table -->
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">Functions & Capabilities</h5>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Function/Capability</th>
                  <th>Type</th>
                  <th class="text-center">Assessment Progress</th>
                  <th class="text-center">Maturity Stage</th>
                  <th class="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let functionSummary of pillarSummary.functions"
                    [class.table-active]="selectedFunctionId === functionSummary.functionCapability.id">
                  <td>
                    <div class="fw-semibold">{{ functionSummary.functionCapability.name }}</div>
                  </td>
                  <td>
                    <span class="badge bg-primary">{{ functionSummary.functionCapability.type }}</span>
                  </td>
                  <td class="text-center">
                    <div class="d-flex align-items-center justify-content-center">
                      <div class="progress me-2" style="width: 100px; height: 20px;">
                        <div class="progress-bar"
                             [class]="functionSummary.assessmentPercentage === 100 ? 'bg-success' :
                                     functionSummary.assessmentPercentage >= 50 ? 'bg-warning' : 'bg-danger'"
                             [style.width.%]="functionSummary.assessmentPercentage"
                             role="progressbar">
                          <small class="text-white fw-bold">{{ functionSummary.assessmentPercentage }}%</small>
                        </div>
                      </div>
                      <small class="text-muted">{{ functionSummary.assessedItems }}/{{ functionSummary.totalItems }}</small>
                    </div>
                  </td>
                  <td class="text-center">
                    <span class="badge {{ maturityCalc.getMaturityStageColor(functionSummary.overallMaturityStage) }}">
                      {{ functionSummary.overallMaturityStage }}
                    </span>
                  </td>
                  <td class="text-center">
                    <button class="btn btn-outline-primary btn-sm"
                            (click)="onFunctionClick(functionSummary)"
                            [disabled]="functionSummary.totalItems === 0">
                      <i class="bi bi-eye me-1"></i>View Details
                    </button>
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

    .table-active {
      background-color: rgba(13, 110, 253, 0.075);
    }
  `]
})
export class PillarDetailComponent {
  @Input() pillarSummary: PillarSummary | null = null;
  @Input() selectedFunctionId: number | null = null;
  @Output() functionSelected = new EventEmitter<FunctionSummary>();

  constructor(public maturityCalc: MaturityCalculationService) {}

  onFunctionClick(functionSummary: FunctionSummary): void {
    this.functionSelected.emit(functionSummary);
  }
}
