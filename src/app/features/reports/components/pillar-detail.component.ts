import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PillarSummary, FunctionSummary } from '../models/report.models';
import { MaturityCalculationService } from '../services/maturity-calculation.service';

@Component({
  selector: 'app-pillar-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pillar-detail.component.html',
  styleUrls: ['./pillar-detail.component.scss']
})
export class PillarDetailComponent {
  @Input() pillarSummary: PillarSummary | null = null;
  @Input() selectedFunctionId: number | null = null;
  @Output() functionSelected = new EventEmitter<FunctionSummary>();

  constructor(public maturityCalc: MaturityCalculationService) {}

  onFunctionClick(functionSummary: FunctionSummary): void {
    this.functionSelected.emit(functionSummary);
  }

  getOverallImplementationPercentage(functionSummary: FunctionSummary): number {
    const totalAssessed = functionSummary.maturityStageBreakdown.reduce((sum, breakdown) => sum + breakdown.assessedItems, 0);
    const totalCompleted = functionSummary.maturityStageBreakdown.reduce((sum, breakdown) => sum + breakdown.completedItems, 0);

    return totalAssessed > 0 ? Math.round((totalCompleted / totalAssessed) * 100) : 0;
  }

  getStageIndicatorClass(status: string): string {
    switch (status) {
      case 'completed': return 'stage-completed';
      case 'in-progress': return 'stage-in-progress';
      case 'not-started': return 'stage-not-started';
      case 'not-assessed': return 'stage-not-assessed';
      default: return 'stage-not-assessed';
    }
  }
}
