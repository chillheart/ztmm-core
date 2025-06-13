import { Injectable } from '@angular/core';
import { ZtmmDataWebService } from '../services/ztmm-data-web.service';
import { Pillar, FunctionCapability, MaturityStage, TechnologyProcess, AssessmentResponse } from '../models/ztmm.models';

export interface ExportedData {
  pillars: Pillar[];
  functionCapabilities: FunctionCapability[];
  maturityStages: MaturityStage[];
  technologiesProcesses: TechnologyProcess[];
  assessmentResponses: AssessmentResponse[];
  exportDate: string;
  version: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataExportService {

  constructor(private dataService: ZtmmDataWebService) {}

  /**
   * Export all data from the current web database to a JSON file
   */
  async exportToJson(): Promise<ExportedData> {
    try {
      const [
        pillars,
        functionCapabilities,
        maturityStages,
        technologiesProcesses,
        assessmentResponses
      ] = await Promise.all([
        this.dataService.getPillars(),
        this.dataService.getFunctionCapabilities(),
        this.dataService.getMaturityStages(),
        this.dataService.getTechnologiesProcesses(),
        this.dataService.getAssessmentResponses()
      ]);

      return {
        pillars,
        functionCapabilities,
        maturityStages,
        technologiesProcesses,
        assessmentResponses,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  /**
   * Import data from a JSON export into the current web database
   * This method completely resets the database and imports with preserved IDs
   */
  async importFromJson(data: ExportedData): Promise<void> {
    try {
      // Completely reset the database instead of just clearing data
      // This ensures we start with a fresh database and can preserve original IDs
      await this.dataService.resetDatabase();

      // Import with preserved IDs using direct SQL inserts
      await this.dataService.importDataWithPreservedIds(data);

      console.log('Data import completed successfully');
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  /**
   * Download the exported data as a JSON file
   */
  async downloadExport(): Promise<void> {
    try {
      const data = await this.exportToJson();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ztmm-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading export:', error);
      throw error;
    }
  }

  /**
   * Upload and import data from a JSON file
   */
  async uploadAndImport(file: File): Promise<void> {
    try {
      const text = await file.text();
      const data: ExportedData = JSON.parse(text);

      // Validate the data structure
      if (!this.validateImportData(data)) {
        throw new Error('Invalid import data format');
      }

      await this.importFromJson(data);
    } catch (error) {
      console.error('Error uploading and importing data:', error);
      throw error;
    }
  }

  /**
   * Clear all data from the database (use with caution!)
   */
  private async clearAllData(): Promise<void> {
    console.warn('Clearing all data from database');
    await this.dataService.clearAllData();
  }

  /**
   * Validate the structure of imported data
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private validateImportData(data: any): data is ExportedData {
    return !!(data &&
           Array.isArray(data.pillars) &&
           Array.isArray(data.functionCapabilities) &&
           Array.isArray(data.maturityStages) &&
           Array.isArray(data.technologiesProcesses) &&
           Array.isArray(data.assessmentResponses) &&
           typeof data.exportDate === 'string' &&
           typeof data.version === 'string');
  }

  /**
   * Get import/export statistics
   */
  async getDataStatistics(): Promise<{
    pillars: number;
    functionCapabilities: number;
    maturityStages: number;
    technologiesProcesses: number;
    assessmentResponses: number;
  }> {
    try {
      const [
        pillars,
        functionCapabilities,
        maturityStages,
        technologiesProcesses,
        assessmentResponses
      ] = await Promise.all([
        this.dataService.getPillars(),
        this.dataService.getFunctionCapabilities(),
        this.dataService.getMaturityStages(),
        this.dataService.getTechnologiesProcesses(),
        this.dataService.getAssessmentResponses()
      ]);

      return {
        pillars: pillars.length,
        functionCapabilities: functionCapabilities.length,
        maturityStages: maturityStages.length,
        technologiesProcesses: technologiesProcesses.length,
        assessmentResponses: assessmentResponses.length
      };
    } catch (error) {
      console.error('Error getting data statistics:', error);
      return {
        pillars: 0,
        functionCapabilities: 0,
        maturityStages: 0,
        technologiesProcesses: 0,
        assessmentResponses: 0
      };
    }
  }
}
