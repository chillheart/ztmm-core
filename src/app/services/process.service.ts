import { Injectable } from '@angular/core';
import { IndexedDBService } from './indexeddb.service';
import {
  ProcessTechnologyGroup,
  MaturityStageImplementation,
  Assessment,
  StageImplementationDetail,
  MaturityStageId
} from '../models/ztmm.models';

/**
 * Service for managing Process-type ProcessTechnologyGroups
 * Provides a simplified interface for working with processes
 */
@Injectable({
  providedIn: 'root'
})
export class ProcessService {
  constructor(private db: IndexedDBService) {}

  /**
   * Get all processes, optionally filtered by function capability
   */
  async getProcesses(functionCapabilityId?: number): Promise<ProcessTechnologyGroup[]> {
    const allGroups = await this.db.getProcessTechnologyGroups();

    let filtered = allGroups.filter(g => g.type === 'Process');

    if (functionCapabilityId !== undefined) {
      filtered = filtered.filter(g => g.function_capability_id === functionCapabilityId);
    }

    return filtered.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  }

  /**
   * Get a single process by ID
   */
  async getProcess(processId: number): Promise<ProcessTechnologyGroup | undefined> {
    const processes = await this.getProcesses();
    return processes.find(p => p.id === processId);
  }

  /**
   * Get a process with all its maturity stage implementations
   */
  async getProcessWithStages(processId: number): Promise<{
    process: ProcessTechnologyGroup;
    stages: MaturityStageImplementation[];
  } | undefined> {
    const process = await this.getProcess(processId);
    if (!process) {
      return undefined;
    }

    const allStages = await this.db.getMaturityStageImplementations();
    const stages = allStages
      .filter(s => s.process_technology_group_id === processId)
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

    return { process, stages };
  }

  /**
   * Get assessment for a process
   */
  async getProcessAssessment(processId: number): Promise<Assessment | undefined> {
    const assessments = await this.db.getAssessmentsV2();
    return assessments.find(a => a.process_technology_group_id === processId);
  }

  /**
   * Get assessment with stage implementation details
   */
  async getProcessAssessmentWithDetails(processId: number): Promise<{
    assessment: Assessment;
    details: StageImplementationDetail[];
  } | undefined> {
    const assessment = await this.getProcessAssessment(processId);
    if (!assessment) {
      return undefined;
    }

    const allDetails = await this.db.getStageImplementationDetails();
    const details = allDetails.filter(d => d.assessment_id === assessment.id);

    return { assessment, details };
  }

  /**
   * Add a new process
   */
  async addProcess(process: Omit<ProcessTechnologyGroup, 'id'>): Promise<number> {
    // Ensure type is set to Process
    const processToAdd: Omit<ProcessTechnologyGroup, 'id'> = {
      ...process,
      type: 'Process'
    };

    return await this.db.addProcessTechnologyGroup(processToAdd);
  }

  /**
   * Update an existing process
   */
  async updateProcess(process: ProcessTechnologyGroup): Promise<void> {
    // Ensure type remains Process
    const processToUpdate: ProcessTechnologyGroup = {
      ...process,
      type: 'Process'
    };

    await this.db.updateProcessTechnologyGroup(processToUpdate);
  }

  /**
   * Delete a process and all related data (stages, assessments, details)
   */
  async deleteProcess(processId: number): Promise<void> {
    // Get all related data first
    const stages = await this.db.getMaturityStageImplementations();
    const relatedStages = stages.filter(s => s.process_technology_group_id === processId);

    const assessments = await this.db.getAssessmentsV2();
    const relatedAssessment = assessments.find(a => a.process_technology_group_id === processId);

    // Delete in reverse order of dependencies
    if (relatedAssessment) {
      // Delete stage implementation details first
      const details = await this.db.getStageImplementationDetails();
      const relatedDetails = details.filter(d => d.assessment_id === relatedAssessment.id);

      for (const detail of relatedDetails) {
        await this.db.deleteStageImplementationDetail(detail.id!);
      }

      // Delete assessment
      await this.db.deleteAssessment(relatedAssessment.id!);
    }

    // Delete stage implementations
    for (const stage of relatedStages) {
      await this.db.deleteMaturityStageImplementation(stage.id!);
    }

    // Finally delete the process itself
    await this.db.deleteProcessTechnologyGroup(processId);
  }

  /**
   * Add a maturity stage implementation for a process
   */
  async addProcessStage(stage: Omit<MaturityStageImplementation, 'id'>): Promise<number> {
    return await this.db.addMaturityStageImplementation(stage);
  }

  /**
   * Update a maturity stage implementation
   */
  async updateProcessStage(stage: MaturityStageImplementation): Promise<void> {
    await this.db.updateMaturityStageImplementation(stage);
  }

  /**
   * Delete a maturity stage implementation
   */
  async deleteProcessStage(stageId: number): Promise<void> {
    await this.db.deleteMaturityStageImplementation(stageId);
  }

  /**
   * Create or update an assessment for a process
   */
  async saveProcessAssessment(assessment: Omit<Assessment, 'id'> | Assessment): Promise<number> {
    if ('id' in assessment && assessment.id) {
      await this.db.updateAssessment(assessment as Assessment);
      return assessment.id;
    } else {
      return await this.db.addAssessment(assessment);
    }
  }

  /**
   * Add a stage implementation detail to an assessment
   */
  async addStageDetail(detail: Omit<StageImplementationDetail, 'id'>): Promise<number> {
    return await this.db.addStageImplementationDetail(detail);
  }

  /**
   * Update a stage implementation detail
   */
  async updateStageDetail(detail: StageImplementationDetail): Promise<void> {
    await this.db.updateStageImplementationDetail(detail);
  }

  /**
   * Delete a stage implementation detail
   */
  async deleteStageDetail(detailId: number): Promise<void> {
    await this.db.deleteStageImplementationDetail(detailId);
  }

  /**
   * Get the count of processes, optionally filtered by function capability
   */
  async getProcessCount(functionCapabilityId?: number): Promise<number> {
    const processes = await this.getProcesses(functionCapabilityId);
    return processes.length;
  }

  /**
   * Reorder processes within a function capability
   */
  async reorderProcesses(functionCapabilityId: number, processIds: number[]): Promise<void> {
    const processes = await this.getProcesses(functionCapabilityId);

    for (let i = 0; i < processIds.length; i++) {
      const process = processes.find(p => p.id === processIds[i]);
      if (process) {
        process.order_index = i;
        await this.updateProcess(process);
      }
    }
  }
}
