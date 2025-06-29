import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PillarSummary } from '../models/report.models';
import { MaturityCalculationService } from '../services/maturity-calculation.service';

@Component({
  selector: 'app-pillar-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pillar-overview.component.html',
  styleUrls: ['./pillar-overview.component.scss']
})
export class PillarOverviewComponent {
  @Input() pillarSummaries: PillarSummary[] = [];
  @Output() pillarSelected = new EventEmitter<PillarSummary>();

  constructor(public maturityCalc: MaturityCalculationService) {}

  onPillarClick(pillarSummary: PillarSummary): void {
    this.pillarSelected.emit(pillarSummary);
  }

  getProgressBarClass(status: string): string {
    switch (status) {
      case 'completed': return 'bg-success';
      case 'in-progress': return 'bg-warning';
      case 'not-started': return 'bg-danger';
      case 'not-assessed': return 'bg-secondary';
      default: return 'bg-light';
    }
  }

  getOverallImplementationPercentage(pillarSummary: PillarSummary): number {
    const totalAssessed = pillarSummary.maturityStageBreakdown.reduce((sum, breakdown) => sum + breakdown.assessedItems, 0);
    const totalCompleted = pillarSummary.maturityStageBreakdown.reduce((sum, breakdown) => sum + breakdown.completedItems, 0);

    return totalAssessed > 0 ? Math.round((totalCompleted / totalAssessed) * 100) : 0;
  }

  getStageColor(status: string): string {
    switch (status) {
      case 'completed': return '#28a745';
      case 'in-progress': return '#ffc107';
      case 'not-started': return '#dc3545';
      case 'not-assessed': return '#6c757d';
      default: return '#e9ecef';
    }
  }
}
