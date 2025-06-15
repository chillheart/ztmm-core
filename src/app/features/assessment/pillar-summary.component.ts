import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, style, transition, animate } from '@angular/animations';
import { FunctionCapability } from '../../models/ztmm.models';

export interface PillarSummary {
  functionCapability: FunctionCapability;
  totalCount: number;
  completedCount: number;
  completionPercentage: number;
}

@Component({
  selector: 'app-pillar-summary',
  templateUrl: './pillar-summary.component.html',
  styleUrls: ['./pillar-summary.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-10px)', opacity: 0 }),
        animate('300ms', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class PillarSummaryComponent {
  @Input() pillarSummary: PillarSummary[] = [];
  @Input() selectedFunctionCapabilityId: number | null = null;
  @Input() selectedPillarName: string = '';
  @Output() backToOverview = new EventEmitter<void>();
  @Output() functionCapabilitySelected = new EventEmitter<number>();

  onBackClick(): void {
    this.backToOverview.emit();
  }

  onAssessButtonClick(summary: PillarSummary): void {
    if (summary.totalCount > 0) {
      this.functionCapabilitySelected.emit(summary.functionCapability.id);
    }
  }

  getButtonClass(summary: PillarSummary): string {
    if (summary.totalCount === 0) {
      return 'btn btn-sm btn-outline-secondary';
    }
    return this.selectedFunctionCapabilityId === summary.functionCapability.id ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-outline-primary';
  }

  getButtonText(summary: PillarSummary): string {
    if (summary.totalCount === 0) {
      return 'No Items';
    }
    return this.selectedFunctionCapabilityId === summary.functionCapability.id ? 'Assessing' : 'Assess';
  }
}
