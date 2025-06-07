import { Injectable } from '@angular/core';
import { Pillar, FunctionCapability, MaturityStage, TechnologyProcess, AssessmentResponse, AssessmentStatus } from '../models/ztmm.models';
import { SqlJsService } from './sqljs.service';

@Injectable({ providedIn: 'root' })
export class ZtmmDataWebService {
  constructor(private sqlJs: SqlJsService) {}

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

  // Ensure database is initialized before any operation
  private async ensureInitialized(): Promise<void> {
    await this.sqlJs.initialize();
  }

  async getPillars(): Promise<Pillar[]> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.sqlJs.getPillars(), 'getPillars');
  }

  async addPillar(name: string): Promise<void> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.sqlJs.addPillar(name), 'addPillar');
  }

  async removePillar(id: number): Promise<void> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.sqlJs.removePillar(id), 'removePillar');
  }

  async editPillar(id: number, name: string): Promise<void> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.sqlJs.editPillar(id, name), 'editPillar');
  }

  async savePillarOrder(order: number[]): Promise<void> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.sqlJs.savePillarOrder(order), 'savePillarOrder');
  }

  async getFunctionCapabilities(): Promise<FunctionCapability[]> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.sqlJs.getFunctionCapabilities(), 'getFunctionCapabilities');
  }

  async addFunctionCapability(name: string, type: 'Function' | 'Capability', pillarId: number): Promise<void> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.sqlJs.addFunctionCapability(name, type, pillarId), 'addFunctionCapability');
  }

  async removeFunctionCapability(id: number): Promise<void> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.sqlJs.removeFunctionCapability(id), 'removeFunctionCapability');
  }

  async editFunctionCapability(id: number, name: string, type: 'Function' | 'Capability', pillarId: number): Promise<void> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.sqlJs.editFunctionCapability(id, name, type, pillarId), 'editFunctionCapability');
  }

  async saveFunctionOrder(order: number[]): Promise<void> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.sqlJs.saveFunctionOrder(order), 'saveFunctionOrder');
  }

  async getMaturityStages(): Promise<MaturityStage[]> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.sqlJs.getMaturityStages(), 'getMaturityStages');
  }

  async getTechnologiesProcesses(functionCapabilityId?: number): Promise<TechnologyProcess[]> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.sqlJs.getTechnologiesProcesses(functionCapabilityId), 'getTechnologiesProcesses');
  }

  async addTechnologyProcess(description: string, type: 'Technology' | 'Process', functionCapabilityId: number, maturityStageId: number): Promise<void> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.sqlJs.addTechnologyProcess(description, type, functionCapabilityId, maturityStageId), 'addTechnologyProcess');
  }

  async removeTechnologyProcess(id: number): Promise<void> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.sqlJs.removeTechnologyProcess(id), 'removeTechnologyProcess');
  }

  async editTechnologyProcess(id: number, description: string, type: 'Technology' | 'Process', functionCapabilityId: number, maturityStageId: number): Promise<void> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.sqlJs.editTechnologyProcess(id, description, type, functionCapabilityId, maturityStageId), 'editTechnologyProcess');
  }

  async saveAssessment(techProcessId: number, status: AssessmentStatus, notes?: string): Promise<void> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.sqlJs.saveAssessment(techProcessId, status, notes), 'saveAssessment');
  }

  async getAssessmentResponses(): Promise<AssessmentResponse[]> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.sqlJs.getAssessmentResponses(), 'getAssessmentResponses');
  }

  // Additional web-specific functionality
  async exportData(): Promise<{ data: Uint8Array; filename: string }> {
    await this.ensureInitialized();
    const data = await this.sqlJs.exportDatabase();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `ztmm-assessment-backup-${timestamp}.db`;
    return { data, filename };
  }

  async importData(file: File): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const data = new Uint8Array(arrayBuffer);
          await this.sqlJs.importDatabase(data);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  async createBackup(): Promise<void> {
    await this.ensureInitialized();
    return this.sqlJs.createBackup();
  }

  async getBackups(): Promise<{ name: string; timestamp: number; date: string }[]> {
    await this.ensureInitialized();
    const backups = await this.sqlJs.getBackups();
    return backups.map(backup => ({
      ...backup,
      date: new Date(backup.timestamp).toLocaleString()
    }));
  }

  async restoreBackup(backupName: string): Promise<void> {
    await this.ensureInitialized();
    return this.sqlJs.restoreBackup(backupName);
  }

  async clearAllData(): Promise<void> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.sqlJs.clearAllData(), 'clearAllData');
  }

  // Migration helper - import data from exported Electron database
  async migrateFromElectronData(electronData: any): Promise<void> {
    await this.ensureInitialized();

    try {
      // Import pillars
      if (electronData.pillars && Array.isArray(electronData.pillars)) {
        for (const pillar of electronData.pillars) {
          await this.addPillar(pillar.name);
        }
      }

      // Import function capabilities
      if (electronData.functionCapabilities && Array.isArray(electronData.functionCapabilities)) {
        for (const fc of electronData.functionCapabilities) {
          await this.addFunctionCapability(fc.name, fc.type, fc.pillar_id);
        }
      }

      // Import technology processes
      if (electronData.technologiesProcesses && Array.isArray(electronData.technologiesProcesses)) {
        for (const tp of electronData.technologiesProcesses) {
          await this.addTechnologyProcess(tp.description, tp.type, tp.function_capability_id, tp.maturity_stage_id);
        }
      }

      // Import assessment responses
      if (electronData.assessmentResponses && Array.isArray(electronData.assessmentResponses)) {
        for (const ar of electronData.assessmentResponses) {
          await this.saveAssessment(ar.tech_process_id, ar.status, ar.notes);
        }
      }

      console.log('Migration from Electron data completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw new Error('Failed to migrate data from Electron format');
    }
  }
}
