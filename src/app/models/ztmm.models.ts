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

// ============================================================================
// LEGACY MODELS (V1) - Kept for backward compatibility during migration
// ============================================================================

export interface TechnologyProcess {
  id: number;
  name: string;
  description: string;
  type: 'Technology' | 'Process';
  function_capability_id: number;
  maturity_stage_id: number;
}

export type AssessmentStatus = 'Not Implemented' | 'Partially Implemented' | 'Fully Implemented' | 'Superseded';

export interface AssessmentResponse {
  id: number;
  tech_process_id: number;
  status: AssessmentStatus;
  notes?: string;
}

// ============================================================================
// NEW MODELS (V2) - Maturity Model Refactor
// ============================================================================

/**
 * ProcessTechnologyGroup - Unified entity for both Processes and Technologies
 * Represents a concept that exists across multiple maturity stages
 * Example: "Multi-Factor Authentication" as a Technology, or "User Creation" as a Process
 */
export interface ProcessTechnologyGroup {
  id: number;
  name: string;
  description: string;
  type: 'Technology' | 'Process';
  function_capability_id: number;
  order_index: number;
  metadata?: ProcessTechnologyMetadata;
}

/**
 * Optional metadata for type-specific fields
 * Extensible for future requirements without schema changes
 */
export interface ProcessTechnologyMetadata {
  // Technology-specific fields
  vendor?: string;
  productName?: string;
  licenseRequired?: boolean;
  deployment?: 'Cloud' | 'On-Premise' | 'Hybrid';
  
  // Process-specific fields
  frequency?: 'Continuous' | 'Periodic' | 'Event-Driven';
  ownerRole?: string;
  documentationRequired?: boolean;
}

/**
 * MaturityStageImplementation - Describes what a process/technology looks like at each maturity stage
 * Example: MFA at "Initial" stage = "SMS-based 2FA for privileged accounts"
 *          MFA at "Advanced" stage = "Hardware tokens/authenticator apps for all users"
 */
export interface MaturityStageImplementation {
  id: number;
  process_technology_group_id: number;
  maturity_stage_id: number; // 1=Traditional, 2=Initial, 3=Advanced, 4=Optimal
  description: string;
  order_index: number;
}

/**
 * Assessment - Tracks the implementation status of a process/technology
 * Separates "achieved" (fully completed) from "target" (currently working on)
 */
export interface Assessment {
  id: number;
  process_technology_group_id: number;
  achieved_maturity_stage_id: number; // Highest COMPLETED stage (reports show this as current)
  target_maturity_stage_id: number | null; // Stage currently working on (null if fully implemented)
  implementation_status: AssessmentStatus;
  notes: string;
  last_updated: string; // ISO 8601 date string
}

/**
 * StageImplementationDetail - Granular tracking of progress per maturity stage
 * Allows tracking partial implementation of individual stages
 */
export interface StageImplementationDetail {
  id: number;
  assessment_id: number;
  maturity_stage_id: number;
  status: StageImplementationStatus;
  completion_percentage: number; // 0-100
  notes?: string;
}

export type StageImplementationStatus = 'Not Started' | 'In Progress' | 'Completed';

// ============================================================================
// DATA VERSIONING & MIGRATION
// ============================================================================

/**
 * Data format version for import/export compatibility
 */
export type DataFormatVersion = '1.0.0' | '2.0.0';

/**
 * ExportedData - Unified export format supporting both V1 (legacy) and V2 (new) models
 * Allows seamless import of old format while supporting new structure
 */
export interface ExportedData {
  version: DataFormatVersion;
  exportDate: string;
  
  // Common data (unchanged between versions)
  pillars: Pillar[];
  functionCapabilities: FunctionCapability[];
  maturityStages: MaturityStage[];
  
  // V1 format (legacy) - optional for backward compatibility
  technologiesProcesses?: TechnologyProcess[];
  assessmentResponses?: AssessmentResponse[];
  
  // V2 format (new) - optional, present when exporting new format
  processTechnologyGroups?: ProcessTechnologyGroup[];
  maturityStageImplementations?: MaturityStageImplementation[];
  assessments?: Assessment[];
  stageImplementationDetails?: StageImplementationDetail[];
}

/**
 * Helper type for maturity stage IDs
 */
export enum MaturityStageId {
  Traditional = 1,
  Initial = 2,
  Advanced = 3,
  Optimal = 4
}

/**
 * Helper type for maturity stage names
 */
export const MaturityStageName: Record<number, string> = {
  1: 'Traditional',
  2: 'Initial',
  3: 'Advanced',
  4: 'Optimal'
};

/**
 * Validation result for data migration
 */
export interface MigrationValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  groupsCreated: number;
  implementationsCreated: number;
  assessmentsCreated: number;
}
