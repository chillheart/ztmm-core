import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaturityStage, MaturityStageImplementation } from '../../models/ztmm.models';

@Component({
  selector: 'app-progress-visualizer',
  templateUrl: './progress-visualizer.component.html',
  styleUrls: ['./progress-visualizer.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ProgressVisualizerComponent implements OnInit {
  @Input() achievedStageId = 0;
  @Input() targetStageId: number | null = null;
  @Input() availableStages: MaturityStage[] = [];
  @Input() stageImplementations: MaturityStageImplementation[] = [];
  @Input() compact = false;

  ngOnInit() {
    // Sort available stages by ID
    this.availableStages = [...this.availableStages].sort((a, b) => a.id - b.id);
  }

  getStageStatus(stageId: number): 'completed' | 'in-progress' | 'future' | 'not-available' {
    if (!this.hasImplementation(stageId)) {
      return 'not-available';
    }
    if (stageId <= this.achievedStageId) {
      return 'completed';
    }
    if (stageId === this.targetStageId) {
      return 'in-progress';
    }
    return 'future';
  }

  hasImplementation(stageId: number): boolean {
    return this.stageImplementations.some(si => si.maturity_stage_id === stageId);
  }

  getStageClass(stageId: number): string {
    const status = this.getStageStatus(stageId);
    switch (status) {
      case 'completed': return 'stage-completed';
      case 'in-progress': return 'stage-in-progress';
      case 'future': return 'stage-future';
      case 'not-available': return 'stage-not-available';
      default: return '';
    }
  }

  getStageIcon(stageId: number): string {
    const status = this.getStageStatus(stageId);
    switch (status) {
      case 'completed': return 'bi-check-circle-fill';
      case 'in-progress': return 'bi-arrow-right-circle-fill';
      case 'future': return 'bi-circle';
      case 'not-available': return 'bi-dash-circle';
      default: return 'bi-circle';
    }
  }

  getProgressPercentage(): number {
    if (this.availableStages.length === 0 || this.achievedStageId === 0) return 0;

    const maxStageId = Math.max(...this.availableStages.map(s => s.id));
    const minStageId = Math.min(...this.availableStages.map(s => s.id));
    const range = maxStageId - minStageId;

    if (range === 0) return this.achievedStageId > 0 ? 100 : 0;
    if (this.achievedStageId <= minStageId) return 0;

    return Math.min(100, ((this.achievedStageId - minStageId) / range) * 100);
  }

  getStageImplementation(stageId: number): MaturityStageImplementation | undefined {
    return this.stageImplementations.find(si => si.maturity_stage_id === stageId);
  }

  getStageName(stageId: number): string {
    return this.availableStages.find(s => s.id === stageId)?.name || 'Unknown';
  }
}
