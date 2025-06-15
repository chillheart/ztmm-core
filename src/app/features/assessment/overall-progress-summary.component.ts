import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, style, transition, animate } from '@angular/animations';
import { Pillar } from '../../models/ztmm.models';

export interface OverallPillarProgress {
  pillar: Pillar;
  totalItems: number;
  completedItems: number;
  progressPercentage: number;
  functionCount: number;
}

@Component({
  selector: 'app-overall-progress-summary',
  templateUrl: './overall-progress-summary.component.html',
  styleUrls: ['./overall-progress-summary.component.scss'],
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class OverallProgressSummaryComponent {
  @Input() overallPillarProgress: OverallPillarProgress[] = [];
  @Output() pillarSelected = new EventEmitter<number>();

  onPillarClick(pillarId: number): void {
    this.pillarSelected.emit(pillarId);
  }

  getTotalFunctions(): number {
    return this.overallPillarProgress.reduce((total, progress) => total + progress.functionCount, 0);
  }

  getTotalCompletedItems(): number {
    return this.overallPillarProgress.reduce((total, progress) => total + progress.completedItems, 0);
  }

  getTotalItems(): number {
    return this.overallPillarProgress.reduce((total, progress) => total + progress.totalItems, 0);
  }

  getOverallProgress(): number {
    const total = this.getTotalItems();
    const completed = this.getTotalCompletedItems();
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }
}
