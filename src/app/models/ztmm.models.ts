export interface Pillar {
  id: number;
  name: string;
}

export interface FunctionCapability {
  id: number;
  name: string;
  type: 'Function' | 'Capability';
  pillar_id: number;
}

export interface MaturityStage {
  id: number;
  name: 'Traditional' | 'Initial' | 'Advanced' | 'Optimal';
}

export interface TechnologyProcess {
  id: number;
  description: string;
  type: 'Technology' | 'Process';
  function_capability_id: number;
  maturity_stage_id: number;
}

export type AssessmentStatus = 'Not Implemented' | 'Partially Implemented' | 'Fully Implemented';

export interface AssessmentResponse {
  id: number;
  tech_process_id: number;
  status: AssessmentStatus;
  notes?: string;
}
