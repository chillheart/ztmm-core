import { Injectable } from '@angular/core';
import { IndexedDBService } from '../services/indexeddb.service';
import { DataMigrationService } from '../services/data-migration.service';
import {
  Pillar,
  FunctionCapability,
  MaturityStage,
  ExportedData,
  DataFormatVersion
} from '../models/ztmm.models';

@Injectable({
  providedIn: 'root'
})
export class DataExportService {

  constructor(
    private dataService: IndexedDBService,
    private migrationService: DataMigrationService
  ) {}

  /**
   * Export all data from the current web database to V2 JSON format
   * Always exports in V2 format, even if V1 data exists
   */
  async exportToJson(): Promise<ExportedData> {
    try {
      const [
        rawPillars,
        rawFunctionCapabilities,
        maturityStages,
        processTechnologyGroups,
        maturityStageImplementations,
        assessments,
        stageImplementationDetails
      ] = await Promise.all([
        this.dataService.getAllRawPillars(),
        this.dataService.getAllRawFunctionCapabilities(),
        this.dataService.getMaturityStages(),
        this.dataService.getProcessTechnologyGroups(),
        this.dataService.getMaturityStageImplementations(),
        this.dataService.getAssessmentsV2(),
        this.dataService.getStageImplementationDetails()
      ]);

      // Ensure order_index is exported
      const pillars = rawPillars.map((p: any) => ({ ...p }));
      const functionCapabilities = rawFunctionCapabilities.map((fc: any) => ({ ...fc }));

      return {
        version: '2.0.0',
        exportDate: new Date().toISOString(),
        pillars,
        functionCapabilities,
        maturityStages,
        // V2 data
        processTechnologyGroups,
        maturityStageImplementations,
        assessments,
        stageImplementationDetails
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  /**
   * Import data from a JSON export into the current web database
   * Supports both V1 (legacy) and V2 (new) format imports
   * V1 data will be automatically migrated to V2 format
   */
  async importFromJson(data: ExportedData): Promise<void> {
    try {
      const version = this.detectDataVersion(data);
      console.log(`Importing data version: ${version}`);

      if (version === '1.0.0') {
        await this.importV1Data(data);
      } else {
        await this.importV2Data(data);
      }

      console.log('Data import completed successfully');
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  /**
   * Import V1 format data (legacy)
   * Imports V1 data and then migrates it to V2 format
   */
  private async importV1Data(data: ExportedData): Promise<void> {
    console.log('Importing V1 format data...');
    
    // Step 1: Reset database and import V1 data
    await this.dataService.resetDatabase(true);
    
    // Import common data
    await this.dataService.importDataWithPreservedIds({
      pillars: data.pillars,
      functionCapabilities: data.functionCapabilities,
      maturityStages: data.maturityStages,
      technologiesProcesses: data.technologiesProcesses || [],
      assessmentResponses: data.assessmentResponses || []
    });

    // Step 2: Automatically migrate to V2 format
    console.log('Auto-migrating V1 data to V2 format...');
    const migrationResult = await this.migrationService.migrateV1ToV2({
      validateFirst: true,
      dryRun: false,
      preserveV1Data: true // Keep V1 data for backward compatibility
    });

    if (!migrationResult.success) {
      throw new Error(`Migration failed: ${migrationResult.message}`);
    }

    console.log('V1 data imported and migrated to V2 successfully');
  }

  /**
   * Import V2 format data (new)
   */
  private async importV2Data(data: ExportedData): Promise<void> {
    console.log('Importing V2 format data...');
    
    // Reset the database
    await this.dataService.resetDatabase(true);

    // Import common data (pillars, function capabilities, maturity stages)
    await this.dataService.importDataWithPreservedIds({
      pillars: data.pillars,
      functionCapabilities: data.functionCapabilities,
      maturityStages: data.maturityStages,
      technologiesProcesses: [],
      assessmentResponses: []
    });

    // Import V2 data
    await this.dataService.bulkImportV2Data({
      processTechnologyGroups: data.processTechnologyGroups || [],
      maturityStageImplementations: data.maturityStageImplementations || [],
      assessments: data.assessments || [],
      stageImplementationDetails: data.stageImplementationDetails || []
    });

    console.log('V2 data imported successfully');
  }

  /**
   * Detect data version from export structure
   */
  private detectDataVersion(data: ExportedData): DataFormatVersion {
    // Check explicit version field first
    if (data.version === '2.0.0') {
      return '2.0.0';
    }
    
    if (data.version === '1.0.0') {
      return '1.0.0';
    }

    // Fallback: detect by presence of V2 fields
    if (data.processTechnologyGroups || data.maturityStageImplementations || data.assessments) {
      return '2.0.0';
    }

    // Fallback: detect by presence of V1 fields
    if (data.technologiesProcesses || data.assessmentResponses) {
      return '1.0.0';
    }

    // Default to V1 if can't determine
    console.warn('Could not determine data version, defaulting to V1');
    return '1.0.0';
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
   * Supports both V1 and V2 format validation
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private validateImportData(data: any): data is ExportedData {
    // Check basic structure
    const hasBasicStructure = !!(
      data &&
      Array.isArray(data.pillars) &&
      Array.isArray(data.functionCapabilities) &&
      Array.isArray(data.maturityStages) &&
      typeof data.exportDate === 'string'
    );

    if (!hasBasicStructure) {
      return false;
    }

    // Version field is optional but recommended
    const version = data.version || this.detectDataVersion(data);

    // Validate V1 format
    if (version === '1.0.0') {
      return !!(
        Array.isArray(data.technologiesProcesses) &&
        Array.isArray(data.assessmentResponses)
      );
    }

    // Validate V2 format
    if (version === '2.0.0') {
      return !!(
        Array.isArray(data.processTechnologyGroups) &&
        Array.isArray(data.maturityStageImplementations) &&
        Array.isArray(data.assessments) &&
        Array.isArray(data.stageImplementationDetails)
      );
    }

    return false;
  }

  /**
   * Get import/export statistics
   * Shows both V1 and V2 data counts
   */
  async getDataStatistics(): Promise<{
    version: DataFormatVersion;
    pillars: number;
    functionCapabilities: number;
    maturityStages: number;
    // V1 counts (legacy)
    technologiesProcesses: number;
    assessmentResponses: number;
    // V2 counts (new)
    processTechnologyGroups: number;
    maturityStageImplementations: number;
    assessments: number;
    stageImplementationDetails: number;
  }> {
    try {
      const [
        pillars,
        functionCapabilities,
        maturityStages,
        technologiesProcesses,
        assessmentResponses,
        processTechnologyGroups,
        maturityStageImplementations,
        assessments,
        stageImplementationDetails
      ] = await Promise.all([
        this.dataService.getPillars(),
        this.dataService.getFunctionCapabilities(),
        this.dataService.getMaturityStages(),
        this.dataService.getTechnologiesProcesses(),
        this.dataService.getAssessmentResponses(),
        this.dataService.getProcessTechnologyGroups(),
        this.dataService.getMaturityStageImplementations(),
        this.dataService.getAssessmentsV2(),
        this.dataService.getStageImplementationDetails()
      ]);

      // Determine active version based on data
      const hasV2Data = processTechnologyGroups.length > 0;
      const version: DataFormatVersion = hasV2Data ? '2.0.0' : '1.0.0';

      return {
        version,
        pillars: pillars.length,
        functionCapabilities: functionCapabilities.length,
        maturityStages: maturityStages.length,
        technologiesProcesses: technologiesProcesses.length,
        assessmentResponses: assessmentResponses.length,
        processTechnologyGroups: processTechnologyGroups.length,
        maturityStageImplementations: maturityStageImplementations.length,
        assessments: assessments.length,
        stageImplementationDetails: stageImplementationDetails.length
      };
    } catch (error) {
      console.error('Error getting data statistics:', error);
      return {
        version: '2.0.0',
        pillars: 0,
        functionCapabilities: 0,
        maturityStages: 0,
        technologiesProcesses: 0,
        assessmentResponses: 0,
        processTechnologyGroups: 0,
        maturityStageImplementations: 0,
        assessments: 0,
        stageImplementationDetails: 0
      };
    }
  }
}
