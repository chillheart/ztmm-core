import { Injectable } from '@angular/core';
import { Pillar, FunctionCapability, MaturityStage, TechnologyProcess, AssessmentResponse, AssessmentStatus } from '../models/ztmm.models';
import { IndexedDBService } from './indexeddb.service';

@Injectable({ providedIn: 'root' })
export class ZtmmDataWebService {
  constructor(private indexedDB: IndexedDBService) {}

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
    await this.indexedDB.initialize();
  }

  async getPillars(): Promise<Pillar[]> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.indexedDB.getPillars(), 'getPillars');
  }

  async addPillar(name: string): Promise<void> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.indexedDB.addPillar(name), 'addPillar');
  }

  async removePillar(id: number): Promise<void> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.indexedDB.removePillar(id), 'removePillar');
  }

  async editPillar(id: number, name: string): Promise<void> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.indexedDB.editPillar(id, name), 'editPillar');
  }

  async savePillarOrder(order: number[]): Promise<void> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.indexedDB.savePillarOrder(order), 'savePillarOrder');
  }

  async getFunctionCapabilities(): Promise<FunctionCapability[]> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.indexedDB.getFunctionCapabilities(), 'getFunctionCapabilities');
  }

  async addFunctionCapability(name: string, type: 'Function' | 'Capability', pillarId: number): Promise<void> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.indexedDB.addFunctionCapability(name, type, pillarId), 'addFunctionCapability');
  }

  async removeFunctionCapability(id: number): Promise<void> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.indexedDB.removeFunctionCapability(id), 'removeFunctionCapability');
  }

  async editFunctionCapability(id: number, name: string, type: 'Function' | 'Capability', pillarId: number): Promise<void> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.indexedDB.editFunctionCapability(id, name, type, pillarId), 'editFunctionCapability');
  }

  async saveFunctionOrder(order: number[]): Promise<void> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.indexedDB.saveFunctionOrder(order), 'saveFunctionOrder');
  }

  async getMaturityStages(): Promise<MaturityStage[]> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.indexedDB.getMaturityStages(), 'getMaturityStages');
  }

  async getTechnologiesProcesses(functionCapabilityId?: number): Promise<TechnologyProcess[]> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.indexedDB.getTechnologiesProcesses(functionCapabilityId), 'getTechnologiesProcesses');
  }

  async getAllTechnologiesProcesses(): Promise<TechnologyProcess[]> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.indexedDB.getAllTechnologiesProcesses(), 'getAllTechnologiesProcesses');
  }

  async getTechnologiesProcessesByFunction(functionCapabilityId: number): Promise<TechnologyProcess[]> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.indexedDB.getTechnologiesProcessesByFunction(functionCapabilityId), 'getTechnologiesProcessesByFunction');
  }

  async addTechnologyProcess(description: string, type: 'Technology' | 'Process', functionCapabilityId: number, maturityStageId: number): Promise<void> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.indexedDB.addTechnologyProcess(description, type, functionCapabilityId, maturityStageId), 'addTechnologyProcess');
  }

  async removeTechnologyProcess(id: number): Promise<void> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.indexedDB.removeTechnologyProcess(id), 'removeTechnologyProcess');
  }

  async editTechnologyProcess(id: number, description: string, type: 'Technology' | 'Process', functionCapabilityId: number, maturityStageId: number): Promise<void> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.indexedDB.editTechnologyProcess(id, description, type, functionCapabilityId, maturityStageId), 'editTechnologyProcess');
  }

  async saveAssessment(techProcessId: number, status: AssessmentStatus, notes?: string): Promise<void> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.indexedDB.saveAssessment(techProcessId, status, notes), 'saveAssessment');
  }

  async getAssessmentResponses(): Promise<AssessmentResponse[]> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.indexedDB.getAssessmentResponses(), 'getAssessmentResponses');
  }

  // Additional web-specific functionality
  async exportData(): Promise<{ data: Uint8Array; filename: string }> {
    await this.ensureInitialized();
    const data = await this.indexedDB.exportDatabase();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `ztmm-assessment-backup-${timestamp}.json`;
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
          await this.indexedDB.importDatabase(data);
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
    return this.indexedDB.createBackup();
  }

  async getBackups(): Promise<{ name: string; timestamp: number }[]> {
    await this.ensureInitialized();
    return this.indexedDB.getBackups();
  }

  async restoreBackup(backupName: string): Promise<void> {
    await this.ensureInitialized();
    return this.indexedDB.restoreBackup(backupName);
  }

  async clearAllData(): Promise<void> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.indexedDB.clearAllData(), 'clearAllData');
  }

  async resetDatabase(): Promise<void> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.indexedDB.resetDatabase(), 'resetDatabase');
  }

  // Migration support for Electron data
  async migrateFromElectronData(electronData: any): Promise<void> {
    try {
      console.log('Starting migration from Electron data format...');

      // Migrate pillars
      if (electronData.pillars) {
        for (const pillar of electronData.pillars) {
          await this.addPillar(pillar.name);
        }
      }

      // Migrate function capabilities
      if (electronData.functionCapabilities) {
        for (const fc of electronData.functionCapabilities) {
          await this.addFunctionCapability(fc.name, fc.type, fc.pillar_id);
        }
      }

      // Migrate technology processes
      if (electronData.technologiesProcesses) {
        for (const tp of electronData.technologiesProcesses) {
          await this.addTechnologyProcess(tp.description, tp.type, tp.function_capability_id, tp.maturity_stage_id);
        }
      }

      // Migrate assessment responses
      if (electronData.assessmentResponses) {
        for (const ar of electronData.assessmentResponses) {
          await this.saveAssessment(ar.tech_process_id, ar.status, ar.notes);
        }
      }

      console.log('Migration from Electron data completed successfully');
    } catch (error) {
      console.error('Migration from Electron data failed:', error);
      throw new Error('Failed to migrate data from Electron format');
    }
  }

  // Import data with preserved IDs from JSON export (complete database replacement)
  async importDataWithPreservedIds(data: any): Promise<void> {
    await this.ensureInitialized();
    return this.handleApiCall(() => this.indexedDB.importDataWithPreservedIds(data), 'importDataWithPreservedIds');
  }

  // Check if database is ready
  isDatabaseReady(): boolean {
    return this.indexedDB.isReady();
  }
}
