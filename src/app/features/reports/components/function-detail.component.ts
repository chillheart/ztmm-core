import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FunctionSummary, DetailedAssessmentItem } from '../models/report.models';
import { MaturityCalculationService } from '../services/maturity-calculation.service';

@Component({
  selector: 'app-function-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './function-detail.component.html',
  styleUrls: ['./function-detail.component.scss']
})
export class FunctionDetailComponent {
  @Input() functionSummary: FunctionSummary | null = null;
  @Input() detailedItems: DetailedAssessmentItem[] = [];
  @Output() descriptionsToggled = new EventEmitter<boolean>();

  constructor(public maturityCalc: MaturityCalculationService) {}

  getItemsForStage(stageName: string): DetailedAssessmentItem[] {
    return this.detailedItems.filter(item => item.maturityStageName === stageName);
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
