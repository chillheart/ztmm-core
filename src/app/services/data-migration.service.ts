import { Injectable } from '@angular/core';
import { IndexedDBService } from './indexeddb.service';
import {
  TechnologyProcess,
  AssessmentResponse,
  ProcessTechnologyGroup,
  ProcessTechnologyMetadata,
  MaturityStageImplementation,
  Assessment,
  StageImplementationDetail,
  MaturityStageId,
  AssessmentStatus,
  MigrationValidationResult
} from '../models/ztmm.models';

/**
 * Service responsible for migrating data from V1 to V2 maturity model format.
 *
 * Migration Strategy:
 * 1. Group V1 TechnologyProcess records by name and function_capability_id
 * 2. Create ProcessTechnologyGroup for each unique group
 * 3. Create MaturityStageImplementation for each maturity stage
 * 4. Transform AssessmentResponse to Assessment with achieved/target logic
 * 5. Create StageImplementationDetail records from V1 assessment data
 */
@Injectable({
  providedIn: 'root'
})
export class DataMigrationService {
  constructor(private indexedDBService: IndexedDBService) {}

  /**
   * Validate V1 data before migration
   */
  async validateV1Data(): Promise<MigrationValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const techProcesses = await this.indexedDBService.getTechnologiesProcesses();
      const assessmentResponses = await this.indexedDBService.getAssessmentResponses();

      // Check for orphaned records
      const functionCapabilities = await this.indexedDBService.getFunctionCapabilities();
      const functionCapabilityIds = new Set(functionCapabilities.map(fc => fc.id!));

      for (const tp of techProcesses) {
        if (!functionCapabilityIds.has(tp.function_capability_id)) {
          errors.push(`TechnologyProcess "${tp.name}" references non-existent function_capability_id: ${tp.function_capability_id}`);
        }
      }

      // Check for duplicate names within same function capability and maturity stage
      const duplicates = this.findDuplicateTechProcesses(techProcesses);
      if (duplicates.length > 0) {
        warnings.push(`Found ${duplicates.length} duplicate TechnologyProcess records that will be merged`);
      }

      // Check assessment responses
      const techProcessIds = new Set(techProcesses.map(tp => tp.id!));
      for (const ar of assessmentResponses) {
        if (!techProcessIds.has(ar.tech_process_id)) {
          errors.push(`AssessmentResponse references non-existent tech_process_id: ${ar.tech_process_id}`);
        }
      }

      const estimatedGroups = this.estimateGroupCount(techProcesses);
      const estimatedAssessments = this.estimateAssessmentCount(assessmentResponses);

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        groupsCreated: estimatedGroups,
        implementationsCreated: techProcesses.length,
        assessmentsCreated: estimatedAssessments
      };
    } catch (error) {
      errors.push(`Validation failed: ${error}`);
      return {
        valid: false,
        errors,
        warnings,
        groupsCreated: 0,
        implementationsCreated: 0,
        assessmentsCreated: 0
      };
    }
  }

  /**
   * Perform the full migration from V1 to V2 format
   */
  async migrateV1ToV2(options: {
    validateFirst?: boolean;
    dryRun?: boolean;
    preserveV1Data?: boolean;
  } = {}): Promise<{
    success: boolean;
    message: string;
    validation?: MigrationValidationResult;
    migrationStats?: {
      processTechnologyGroupsCreated: number;
      maturityStageImplementationsCreated: number;
      assessmentsCreated: number;
      stageImplementationDetailsCreated: number;
    };
    errors?: string[];
  }> {
    const { validateFirst = true, dryRun = false, preserveV1Data = true } = options;

    try {
      // Step 1: Validate V1 data
      if (validateFirst) {
        console.log('Validating V1 data before migration...');
        const validation = await this.validateV1Data();

        if (!validation.valid) {
          return {
            success: false,
            message: 'Validation failed. Migration aborted.',
            validation,
            errors: validation.errors
          };
        }

        if (validation.warnings.length > 0) {
          console.warn('Validation warnings:', validation.warnings);
        }

        console.log('Validation passed. Estimated groups:', validation.groupsCreated);
      }

      // Step 2: Load V1 data
      console.log('Loading V1 data...');
      const techProcesses = await this.indexedDBService.getTechnologiesProcesses();
      const assessmentResponses = await this.indexedDBService.getAssessmentResponses();

      // Step 3: Group and transform data
      console.log('Transforming V1 data to V2 format...');
      const groupedData = this.groupTechnologyProcesses(techProcesses);

      const processTechnologyGroups: ProcessTechnologyGroup[] = [];
      const maturityStageImplementations: MaturityStageImplementation[] = [];
      const assessments: Assessment[] = [];
      const stageImplementationDetails: StageImplementationDetail[] = [];

      // Create ProcessTechnologyGroups and MaturityStageImplementations
      let groupIdCounter = 1;
      let implementationIdCounter = 1;

      for (const [groupKey, processes] of groupedData.entries()) {
        const firstProcess = processes[0];

        // Create ProcessTechnologyGroup
        const group: ProcessTechnologyGroup = {
          id: groupIdCounter++,
          name: this.extractGroupName(firstProcess.name),
          description: firstProcess.description,
          type: firstProcess.type === 'Technology' ? 'Technology' : 'Process',
          function_capability_id: firstProcess.function_capability_id,
          order_index: groupIdCounter - 1, // Use counter as order
          metadata: {
            tags: [],
            custom_fields: {},
            migrated_from_v1: true,
            original_v1_ids: processes.map(p => p.id!)
          } as ProcessTechnologyMetadata & { migrated_from_v1: boolean; original_v1_ids: number[] }
        };
        processTechnologyGroups.push(group);

        // Create MaturityStageImplementation for each stage
        for (const process of processes) {
          const implementation: MaturityStageImplementation = {
            id: implementationIdCounter++,
            process_technology_group_id: group.id!,
            maturity_stage_id: process.maturity_stage_id,
            description: process.description,
            order_index: process.maturity_stage_id
          };
          maturityStageImplementations.push(implementation);
        }

        // Create Assessment for this group
        const groupAssessments = assessmentResponses.filter(ar =>
          processes.some(p => p.id === ar.tech_process_id)
        );

        if (groupAssessments.length > 0) {
          const assessment = this.createAssessmentFromV1(
            group.id!,
            groupAssessments,
            maturityStageImplementations.filter(impl => impl.process_technology_group_id === group.id)
          );
          assessments.push(assessment);

          // Create StageImplementationDetails
          const details = this.createStageImplementationDetails(
            assessment.id!,
            groupAssessments,
            processes
          );
          stageImplementationDetails.push(...details);
        }
      }

      // Step 4: Write V2 data (if not dry run)
      if (!dryRun) {
        console.log('Writing V2 data to database...');
        await this.indexedDBService.bulkImportV2Data({
          processTechnologyGroups,
          maturityStageImplementations,
          assessments,
          stageImplementationDetails
        });

        console.log('Migration completed successfully');
      } else {
        console.log('Dry run completed - no data written');
      }

      return {
        success: true,
        message: dryRun ? 'Dry run completed successfully' : 'Migration completed successfully',
        migrationStats: {
          processTechnologyGroupsCreated: processTechnologyGroups.length,
          maturityStageImplementationsCreated: maturityStageImplementations.length,
          assessmentsCreated: assessments.length,
          stageImplementationDetailsCreated: stageImplementationDetails.length
        }
      };

    } catch (error) {
      console.error('Migration failed:', error);
      return {
        success: false,
        message: `Migration failed: ${error}`,
        errors: [String(error)]
      };
    }
  }

  /**
   * Group TechnologyProcess records by name and function capability
   */
  private groupTechnologyProcesses(processes: TechnologyProcess[]): Map<string, TechnologyProcess[]> {
    const groups = new Map<string, TechnologyProcess[]>();

    for (const process of processes) {
      // Extract base name (remove maturity stage prefix/suffix)
      const baseName = this.extractGroupName(process.name);
      const key = `${process.function_capability_id}-${baseName}-${process.type}`;

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(process);
    }

    // Sort processes within each group by maturity stage
    for (const processes of groups.values()) {
      processes.sort((a, b) => a.maturity_stage_id - b.maturity_stage_id);
    }

    return groups;
  }

  /**
   * Extract the base group name from a TechnologyProcess name
   * Removes common maturity stage indicators
   */
  private extractGroupName(name: string): string {
    // Remove common stage prefixes/suffixes
    const cleaned = name
      .replace(/\s*-\s*(Initial|Developing|Defined|Managed|Optimizing)$/i, '')
      .replace(/^(Initial|Developing|Defined|Managed|Optimizing)\s*-\s*/i, '')
      .replace(/\s*\((Initial|Developing|Defined|Managed|Optimizing)\)/i, '')
      .trim();

    return cleaned || name;
  }

  /**
   * Create an Assessment from V1 AssessmentResponse records
   */
  private createAssessmentFromV1(
    groupId: number,
    assessmentResponses: AssessmentResponse[],
    implementations: MaturityStageImplementation[]
  ): Assessment {
    // Find the highest fully implemented stage
    const implementedStages = new Set<number>();
    const partiallyImplementedStages = new Set<number>();

    for (const ar of assessmentResponses) {
      const matchingImpl = implementations.find(impl =>
        impl.maturity_stage_id === this.getTechProcessStage(ar)
      );

      if (matchingImpl) {
        if (ar.status === 'Fully Implemented') {
          implementedStages.add(matchingImpl.maturity_stage_id);
        } else if (ar.status === 'Partially Implemented') {
          partiallyImplementedStages.add(matchingImpl.maturity_stage_id);
        }
      }
    }

    // Achieved = highest fully completed stage
    const sortedImplemented = Array.from(implementedStages).sort((a, b) => a - b);
    const achievedStageId = sortedImplemented.length > 0
      ? sortedImplemented[sortedImplemented.length - 1]
      : MaturityStageId.Initial;

    // Target = highest stage with any implementation (partial or full)
    const allStages = [...implementedStages, ...partiallyImplementedStages];
    const sortedAll = allStages.sort((a, b) => a - b);
    const targetStageId = sortedAll.length > 0
      ? sortedAll[sortedAll.length - 1]
      : MaturityStageId.Initial;

    // Overall status
    let overallStatus: AssessmentStatus;
    if (implementedStages.size === 0 && partiallyImplementedStages.size === 0) {
      overallStatus = 'Not Implemented';
    } else if (achievedStageId === MaturityStageId.Optimal) {
      overallStatus = 'Fully Implemented';
    } else if (partiallyImplementedStages.size > 0) {
      overallStatus = 'Partially Implemented';
    } else {
      overallStatus = 'Partially Implemented';
    }

    return {
      id: groupId, // Use same ID as group for simplicity
      process_technology_group_id: groupId,
      achieved_maturity_stage_id: achievedStageId,
      target_maturity_stage_id: targetStageId,
      implementation_status: overallStatus,
      notes: 'Migrated from V1 assessment data',
      last_updated: new Date().toISOString()
    };
  }

  /**
   * Create StageImplementationDetails from V1 assessment responses
   */
  private createStageImplementationDetails(
    assessmentId: number,
    assessmentResponses: AssessmentResponse[],
    processes: TechnologyProcess[]
  ): StageImplementationDetail[] {
    const details: StageImplementationDetail[] = [];
    let detailIdCounter = assessmentId * 1000; // Offset to avoid ID collisions

    for (const ar of assessmentResponses) {
      const process = processes.find(p => p.id === ar.tech_process_id);
      if (!process) continue;

      const detail: StageImplementationDetail = {
        id: detailIdCounter++,
        assessment_id: assessmentId,
        maturity_stage_id: process.maturity_stage_id,
        status: this.statusToStageStatus(ar.status),
        completion_percentage: this.statusToPercentage(ar.status),
        notes: ar.notes || ''
      };
      details.push(detail);
    }

    return details;
  }

  /**
   * Helper: Convert AssessmentStatus to StageImplementationStatus
   */
  private statusToStageStatus(status: AssessmentStatus): 'Not Started' | 'In Progress' | 'Completed' {
    switch (status) {
      case 'Not Implemented': return 'Not Started';
      case 'Partially Implemented': return 'In Progress';
      case 'Fully Implemented': return 'Completed';
      case 'Superseded': return 'Completed';
      default: return 'Not Started';
    }
  }

  /**
   * Helper: Get maturity stage from TechnologyProcess via AssessmentResponse
   */
  private getTechProcessStage(ar: AssessmentResponse): number {
    // This would need to look up the actual stage from the tech process
    // For now, we'll infer from the assessment response
    return ar.tech_process_id; // This is a simplification
  }

  /**
   * Helper: Convert status to completion percentage
   */
  private statusToPercentage(status: AssessmentStatus): number {
    switch (status) {
      case 'Not Implemented': return 0;
      case 'Partially Implemented': return 50;
      case 'Fully Implemented': return 100;
      case 'Superseded': return 100;
      default: return 0;
    }
  }

  /**
   * Helper: Find duplicate TechnologyProcess records
   */
  private findDuplicateTechProcesses(processes: TechnologyProcess[]): TechnologyProcess[] {
    const seen = new Map<string, TechnologyProcess>();
    const duplicates: TechnologyProcess[] = [];

    for (const process of processes) {
      const key = `${process.function_capability_id}-${process.name}-${process.maturity_stage_id}`;
      if (seen.has(key)) {
        duplicates.push(process);
      } else {
        seen.set(key, process);
      }
    }

    return duplicates;
  }

  /**
   * Helper: Estimate number of groups from processes
   */
  private estimateGroupCount(processes: TechnologyProcess[]): number {
    const uniqueGroups = new Set<string>();
    for (const process of processes) {
      const baseName = this.extractGroupName(process.name);
      uniqueGroups.add(`${process.function_capability_id}-${baseName}-${process.type}`);
    }
    return uniqueGroups.size;
  }

  /**
   * Helper: Estimate number of assessments
   */
  private estimateAssessmentCount(assessmentResponses: AssessmentResponse[]): number {
    const uniqueGroups = new Set(assessmentResponses.map(ar => ar.tech_process_id));
    return uniqueGroups.size;
  }

  /**
   * Rollback V2 data (for testing or if migration fails)
   */
  async rollbackV2Data(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Rolling back V2 data...');

      // Clear all V2 stores
      const groups = await this.indexedDBService.getProcessTechnologyGroups();
      for (const group of groups) {
        await this.indexedDBService.deleteProcessTechnologyGroup(group.id!);
      }

      return {
        success: true,
        message: 'V2 data rolled back successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: `Rollback failed: ${error}`
      };
    }
  }

  /**
   * Check if V2 data exists (to prevent duplicate migrations)
   */
  async hasV2Data(): Promise<boolean> {
    const groups = await this.indexedDBService.getProcessTechnologyGroups();
    return groups.length > 0;
  }
}
