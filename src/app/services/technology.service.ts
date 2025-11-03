import { Injectable } from '@angular/core';
import { IndexedDBService } from './indexeddb.service';
import {
  ProcessTechnologyGroup,
  MaturityStageImplementation,
  Assessment,
  StageImplementationDetail
} from '../models/ztmm.models';

/**
 * Service for managing Technology-type ProcessTechnologyGroups
 * Provides a simplified interface for working with technologies
 */
@Injectable({
  providedIn: 'root'
})
export class TechnologyService {
  constructor(private db: IndexedDBService) {}

  /**
   * Get all technologies, optionally filtered by function capability
   */
  async getTechnologies(functionCapabilityId?: number): Promise<ProcessTechnologyGroup[]> {
    const allGroups = await this.db.getProcessTechnologyGroups();

    let filtered = allGroups.filter(g => g.type === 'Technology');

    if (functionCapabilityId !== undefined) {
      filtered = filtered.filter(g => g.function_capability_id === functionCapabilityId);
    }

    return filtered.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  }

  /**
   * Get a single technology by ID
   */
  async getTechnology(technologyId: number): Promise<ProcessTechnologyGroup | undefined> {
    const technologies = await this.getTechnologies();
    return technologies.find(t => t.id === technologyId);
  }

  /**
   * Get a technology with all its maturity stage implementations
   */
  async getTechnologyWithStages(technologyId: number): Promise<{
    technology: ProcessTechnologyGroup;
    stages: MaturityStageImplementation[];
  } | undefined> {
    const technology = await this.getTechnology(technologyId);
    if (!technology) {
      return undefined;
    }

    const allStages = await this.db.getMaturityStageImplementations();
    const stages = allStages
      .filter(s => s.process_technology_group_id === technologyId)
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

    return { technology, stages };
  }

  /**
   * Get assessment for a technology
   */
  async getTechnologyAssessment(technologyId: number): Promise<Assessment | undefined> {
    const assessments = await this.db.getAssessmentsV2();
    return assessments.find(a => a.process_technology_group_id === technologyId);
  }

  /**
   * Get assessment with stage implementation details
   */
  async getTechnologyAssessmentWithDetails(technologyId: number): Promise<{
    assessment: Assessment;
    details: StageImplementationDetail[];
  } | undefined> {
    const assessment = await this.getTechnologyAssessment(technologyId);
    if (!assessment) {
      return undefined;
    }

    const allDetails = await this.db.getStageImplementationDetails();
    const details = allDetails.filter(d => d.assessment_id === assessment.id);

    return { assessment, details };
  }

  /**
   * Add a new technology
   */
  async addTechnology(technology: Omit<ProcessTechnologyGroup, 'id'>): Promise<number> {
    // Ensure type is set to Technology
    const technologyToAdd: Omit<ProcessTechnologyGroup, 'id'> = {
      ...technology,
      type: 'Technology'
    };

    return await this.db.addProcessTechnologyGroup(technologyToAdd);
  }

  /**
   * Update an existing technology
   */
  async updateTechnology(technology: ProcessTechnologyGroup): Promise<void> {
    // Ensure type remains Technology
    const technologyToUpdate: ProcessTechnologyGroup = {
      ...technology,
      type: 'Technology'
    };

    await this.db.updateProcessTechnologyGroup(technologyToUpdate);
  }

  /**
   * Delete a technology and all related data (stages, assessments, details)
   */
  async deleteTechnology(technologyId: number): Promise<void> {
    // Get all related data first
    const stages = await this.db.getMaturityStageImplementations();
    const relatedStages = stages.filter(s => s.process_technology_group_id === technologyId);

    const assessments = await this.db.getAssessmentsV2();
    const relatedAssessment = assessments.find(a => a.process_technology_group_id === technologyId);

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

    // Finally delete the technology itself
    await this.db.deleteProcessTechnologyGroup(technologyId);
  }

  /**
   * Add a maturity stage implementation for a technology
   */
  async addTechnologyStage(stage: Omit<MaturityStageImplementation, 'id'>): Promise<number> {
    return await this.db.addMaturityStageImplementation(stage);
  }

  /**
   * Update a maturity stage implementation
   */
  async updateTechnologyStage(stage: MaturityStageImplementation): Promise<void> {
    await this.db.updateMaturityStageImplementation(stage);
  }

  /**
   * Delete a maturity stage implementation
   */
  async deleteTechnologyStage(stageId: number): Promise<void> {
    await this.db.deleteMaturityStageImplementation(stageId);
  }

  /**
   * Create or update an assessment for a technology
   */
  async saveTechnologyAssessment(assessment: Omit<Assessment, 'id'> | Assessment): Promise<number> {
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
   * Get the count of technologies, optionally filtered by function capability
   */
  async getTechnologyCount(functionCapabilityId?: number): Promise<number> {
    const technologies = await this.getTechnologies(functionCapabilityId);
    return technologies.length;
  }

  /**
   * Reorder technologies within a function capability
   */
  async reorderTechnologies(functionCapabilityId: number, technologyIds: number[]): Promise<void> {
    const technologies = await this.getTechnologies(functionCapabilityId);

    for (let i = 0; i < technologyIds.length; i++) {
      const technology = technologies.find(t => t.id === technologyIds[i]);
      if (technology) {
        technology.order_index = i;
        await this.updateTechnology(technology);
      }
    }
  }
}
