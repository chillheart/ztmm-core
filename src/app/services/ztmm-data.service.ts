import { Injectable } from '@angular/core';
import { Pillar, FunctionCapability, MaturityStage, TechnologyProcess, AssessmentResponse, AssessmentStatus } from '../models/ztmm.models';

@Injectable({ providedIn: 'root' })
export class ZtmmDataService {
  private get api() {
    const windowApi = (window as any).api;
    if (!windowApi) {
      throw new Error('Electron API not available. Make sure the application is running in Electron environment.');
    }
    return windowApi;
  }

  /**
   * Handles API calls with proper error handling and logging
   */
  private async handleApiCall<T>(operation: () => Promise<T>, operationName: string): Promise<T> {
    try {
      const result = await operation();
      console.log(`API operation '${operationName}' completed successfully`);
      return result;
    } catch (error) {
      console.error(`API operation '${operationName}' failed:`, error);

      // Re-throw with more user-friendly message if it's a validation error
      if (error instanceof Error && error.message.includes('validation')) {
        throw new Error(`Invalid input: ${error.message}`);
      }

      throw error;
    }
  }

  async getPillars(): Promise<Pillar[]> {
    return this.handleApiCall(() => this.api.getPillars(), 'getPillars');
  }

  async addPillar(name: string): Promise<void> {
    // Client-side validation
    if (!name || typeof name !== 'string') {
      throw new Error('Pillar name is required and must be a string');
    }
    if (name.trim().length === 0) {
      throw new Error('Pillar name cannot be empty');
    }
    if (name.length > 255) {
      throw new Error('Pillar name cannot exceed 255 characters');
    }

    return this.handleApiCall(() => this.api.addPillar(name.trim()), 'addPillar');
  }

  async removePillar(id: number): Promise<void> {
    if (!Number.isInteger(id) || id < 1) {
      throw new Error('Invalid pillar ID');
    }

    return this.handleApiCall(() => this.api.removePillar(id), 'removePillar');
  }

  async getFunctionCapabilities(): Promise<FunctionCapability[]> {
    return this.handleApiCall(() => this.api.getFunctionCapabilities(), 'getFunctionCapabilities');
  }

  async addFunctionCapability(name: string, type: 'Function' | 'Capability', pillarId: number): Promise<void> {
    // Client-side validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Function/Capability name is required');
    }
    if (name.length > 255) {
      throw new Error('Function/Capability name cannot exceed 255 characters');
    }
    if (!['Function', 'Capability'].includes(type)) {
      throw new Error('Type must be either Function or Capability');
    }
    if (!Number.isInteger(pillarId) || pillarId < 1) {
      throw new Error('Invalid pillar ID');
    }

    return this.handleApiCall(() => this.api.addFunctionCapability(name.trim(), type, pillarId), 'addFunctionCapability');
  }

  async removeFunctionCapability(id: number): Promise<void> {
    if (!Number.isInteger(id) || id < 1) {
      throw new Error('Invalid function capability ID');
    }

    return this.handleApiCall(() => this.api.removeFunctionCapability(id), 'removeFunctionCapability');
  }

  async getMaturityStages(): Promise<MaturityStage[]> {
    return this.handleApiCall(() => this.api.getMaturityStages(), 'getMaturityStages');
  }

  async getTechnologiesProcesses(functionCapabilityId: number): Promise<TechnologyProcess[]> {
    if (!Number.isInteger(functionCapabilityId) || functionCapabilityId < 1) {
      throw new Error('Invalid function capability ID');
    }

    return this.handleApiCall(() => this.api.getTechnologiesProcesses(functionCapabilityId), 'getTechnologiesProcesses');
  }

  async addTechnologyProcess(description: string, type: 'Technology' | 'Process', functionCapabilityId: number, maturityStageId: number): Promise<void> {
    // Client-side validation
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      throw new Error('Technology/Process description is required');
    }
    if (description.length > 500) {
      throw new Error('Technology/Process description cannot exceed 500 characters');
    }
    if (!['Technology', 'Process'].includes(type)) {
      throw new Error('Type must be either Technology or Process');
    }
    if (!Number.isInteger(functionCapabilityId) || functionCapabilityId < 1) {
      throw new Error('Invalid function capability ID');
    }
    if (!Number.isInteger(maturityStageId) || maturityStageId < 1) {
      throw new Error('Invalid maturity stage ID');
    }

    return this.handleApiCall(() => this.api.addTechnologyProcess(description.trim(), type, functionCapabilityId, maturityStageId), 'addTechnologyProcess');
  }

  async removeTechnologyProcess(id: number): Promise<void> {
    if (!Number.isInteger(id) || id < 1) {
      throw new Error('Invalid technology process ID');
    }

    return this.handleApiCall(() => this.api.removeTechnologyProcess(id), 'removeTechnologyProcess');
  }

  async saveAssessment(techProcessId: number, status: AssessmentStatus, notes?: string): Promise<void> {
    // Client-side validation
    if (!Number.isInteger(techProcessId) || techProcessId < 1) {
      throw new Error('Invalid technology process ID');
    }
    if (!['Not Implemented', 'Partially Implemented', 'Fully Implemented'].includes(status)) {
      throw new Error('Invalid assessment status');
    }
    if (notes && notes.length > 2000) {
      throw new Error('Notes cannot exceed 2000 characters');
    }

    return this.handleApiCall(() => this.api.saveAssessment(techProcessId, status, notes), 'saveAssessment');
  }

  async getAssessmentResponses(): Promise<AssessmentResponse[]> {
    return this.handleApiCall(() => this.api.getAssessmentResponses(), 'getAssessmentResponses');
  }

  async savePillarOrder(order: number[]): Promise<void> {
    if (!Array.isArray(order)) {
      throw new Error('Order must be an array');
    }
    if (order.length > 1000) {
      throw new Error('Order array too large');
    }
    if (!order.every(id => Number.isInteger(id) && id > 0)) {
      throw new Error('All order IDs must be positive integers');
    }

    return this.handleApiCall(() => this.api.savePillarOrder(order), 'savePillarOrder');
  }

  async saveFunctionOrder(order: number[]): Promise<void> {
    if (!Array.isArray(order)) {
      throw new Error('Order must be an array');
    }
    if (order.length > 1000) {
      throw new Error('Order array too large');
    }
    if (!order.every(id => Number.isInteger(id) && id > 0)) {
      throw new Error('All order IDs must be positive integers');
    }

    return this.handleApiCall(() => this.api.saveFunctionOrder(order), 'saveFunctionOrder');
  }

  async editPillar(id: number, name: string): Promise<void> {
    if (!Number.isInteger(id) || id < 1) {
      throw new Error('Invalid pillar ID');
    }
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Pillar name is required');
    }
    if (name.length > 255) {
      throw new Error('Pillar name cannot exceed 255 characters');
    }

    return this.handleApiCall(() => this.api.editPillar(id, name.trim()), 'editPillar');
  }

  async editFunctionCapability(id: number, name: string, type: 'Function' | 'Capability', pillarId: number): Promise<void> {
    if (!Number.isInteger(id) || id < 1) {
      throw new Error('Invalid function capability ID');
    }
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Function/Capability name is required');
    }
    if (name.length > 255) {
      throw new Error('Function/Capability name cannot exceed 255 characters');
    }
    if (!['Function', 'Capability'].includes(type)) {
      throw new Error('Type must be either Function or Capability');
    }
    if (!Number.isInteger(pillarId) || pillarId < 1) {
      throw new Error('Invalid pillar ID');
    }

    return this.handleApiCall(() => this.api.editFunctionCapability(id, name.trim(), type, pillarId), 'editFunctionCapability');
  }

  async editTechnologyProcess(id: number, description: string, type: 'Technology' | 'Process', functionCapabilityId: number, maturityStageId: number): Promise<void> {
    if (!Number.isInteger(id) || id < 1) {
      throw new Error('Invalid technology process ID');
    }
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      throw new Error('Technology/Process description is required');
    }
    if (description.length > 500) {
      throw new Error('Technology/Process description cannot exceed 500 characters');
    }
    if (!['Technology', 'Process'].includes(type)) {
      throw new Error('Type must be either Technology or Process');
    }
    if (!Number.isInteger(functionCapabilityId) || functionCapabilityId < 1) {
      throw new Error('Invalid function capability ID');
    }
    if (!Number.isInteger(maturityStageId) || maturityStageId < 1) {
      throw new Error('Invalid maturity stage ID');
    }

    return this.handleApiCall(() => this.api.editTechnologyProcess(id, description.trim(), type, functionCapabilityId, maturityStageId), 'editTechnologyProcess');
  }
}
