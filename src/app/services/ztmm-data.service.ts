import { Injectable } from '@angular/core';
import { Pillar, FunctionCapability, MaturityStage, TechnologyProcess, AssessmentResponse, AssessmentStatus } from '../models/ztmm.models';

@Injectable({ providedIn: 'root' })
export class ZtmmDataService {
  // @ts-ignore
  private api = window.api;

  async getPillars(): Promise<Pillar[]> {
    return await this.api.getPillars();
  }

  async addPillar(name: string): Promise<void> {
    return await this.api.addPillar(name);
  }

  async removePillar(id: number): Promise<void> {
    return await this.api.removePillar(id);
  }

  async getFunctionCapabilities(): Promise<FunctionCapability[]> {
    return await this.api.getFunctionCapabilities();
  }

  async addFunctionCapability(name: string, type: 'Function' | 'Capability', pillarId: number): Promise<void> {
    return await this.api.addFunctionCapability(name, type, pillarId);
  }

  async removeFunctionCapability(id: number): Promise<void> {
    return await this.api.removeFunctionCapability(id);
  }

  async getMaturityStages(): Promise<MaturityStage[]> {
    return await this.api.getMaturityStages();
  }

  async getTechnologiesProcesses(functionCapabilityId: number): Promise<TechnologyProcess[]> {
    return await this.api.getTechnologiesProcesses(functionCapabilityId);
  }

  async addTechnologyProcess(description: string, type: 'Technology' | 'Process', functionCapabilityId: number, maturityStageId: number): Promise<void> {
    return await this.api.addTechnologyProcess(description, type, functionCapabilityId, maturityStageId);
  }

  async removeTechnologyProcess(id: number): Promise<void> {
    return await this.api.removeTechnologyProcess(id);
  }

  async saveAssessment(techProcessId: number, status: AssessmentStatus, notes?: string): Promise<void> {
    return await this.api.saveAssessment(techProcessId, status, notes);
  }

  async getAssessmentResponses(): Promise<AssessmentResponse[]> {
    return await this.api.getAssessmentResponses();
  }

  async savePillarOrder(order: number[]): Promise<void> {
    return await this.api.savePillarOrder(order);
  }
  async saveFunctionOrder(order: number[]): Promise<void> {
    return await this.api.saveFunctionOrder(order);
  }

  async editPillar(id: number, name: string): Promise<void> {
    return await this.api.editPillar(id, name);
  }
  async editFunctionCapability(id: number, name: string, type: 'Function' | 'Capability', pillarId: number): Promise<void> {
    return await this.api.editFunctionCapability(id, name, type, pillarId);
  }
  async editTechnologyProcess(id: number, description: string, type: 'Technology' | 'Process', functionCapabilityId: number, maturityStageId: number): Promise<void> {
    return await this.api.editTechnologyProcess(id, description, type, functionCapabilityId, maturityStageId);
  }
}
