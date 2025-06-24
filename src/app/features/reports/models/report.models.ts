import { Pillar, FunctionCapability } from '../../../models/ztmm.models';

export type MaturityStatus = 'completed' | 'in-progress' | 'not-started' | 'not-assessed';

export interface MaturityStageBreakdown {
  stageName: string;
  assessedItems: number;
  totalItems: number;
  completedItems: number; // Fully Implemented + Superseded
  inProgressItems: number; // Partially Implemented
  notStartedItems: number; // Not Implemented
  percentage: number;
  completionPercentage: number; // Based on completed items only
  status: MaturityStatus;
}

export interface FunctionSummary {
  functionCapability: FunctionCapability;
  assessedItems: number;
  totalItems: number;
  assessmentPercentage: number;
  overallMaturityStage: string;
  maturityStageBreakdown: MaturityStageBreakdown[];
}

export interface PillarSummary {
  pillar: Pillar;
  functions: FunctionSummary[];
  assessedItems: number;
  totalItems: number;
  assessmentPercentage: number;
  overallMaturityStage: string;
  maturityStageBreakdown: MaturityStageBreakdown[];
}

export interface DetailedAssessmentItem {
  pillarName: string;
  functionCapabilityName: string;
  functionCapabilityType: string;
  name: string;
  description: string;
  type: string;
  maturityStageName: string;
  status: string;
  notes: string;
}

export type ViewLevel = 'pillar-overview' | 'pillar-detail' | 'function-detail';
