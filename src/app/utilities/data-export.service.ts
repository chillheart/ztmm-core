import { Injectable } from '@angular/core';
import { IndexedDBService } from '../services/indexeddb.service';
import { DataMigrationService } from '../services/data-migration.service';
import { LoggingService } from '../services/logging.service';
import {
  ExportedData,
  DataFormatVersion
} from '../models/ztmm.models';

@Injectable({
  providedIn: 'root'
})
export class DataExportService {
  private readonly LOG_CONTEXT = 'DataExportService';

  constructor(
    private dataService: IndexedDBService,
    private migrationService: DataMigrationService,
    private logger: LoggingService
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
      const pillars = rawPillars.map(p => ({ ...p }));
      const functionCapabilities = rawFunctionCapabilities.map(fc => ({ ...fc }));

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
      this.logger.error('Error exporting data', error as Error, this.LOG_CONTEXT);
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
      this.logger.info(`Importing data version: ${version}`, this.LOG_CONTEXT);

      if (version === '1.0.0') {
        await this.importV1Data(data);
      } else {
        await this.importV2Data(data);
      }

      this.logger.info('Data import completed successfully', this.LOG_CONTEXT);
    } catch (error) {
      this.logger.error('Error importing data', error as Error, this.LOG_CONTEXT);
      throw error;
    }
  }

  /**
   * Import V1 format data (legacy)
   * Imports V1 data and then migrates it to V2 format
   */
  private async importV1Data(data: ExportedData): Promise<void> {
    this.logger.info('Importing V1 format data', this.LOG_CONTEXT);

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

    // Log what we're about to import
    console.log('📊 Import Summary:');
    console.log(`  • ${data.pillars?.length || 0} Pillars`);
    console.log(`  • ${data.functionCapabilities?.length || 0} Function Capabilities`);
    console.log(`  • ${data.maturityStages?.length || 0} Maturity Stages`);
    console.log(`  • ${data.processTechnologyGroups?.length || 0} Process/Technology Groups`);
    console.log(`  • ${data.maturityStageImplementations?.length || 0} Maturity Stage Implementations`);
    console.log(`  • ${data.assessments?.length || 0} Assessments`);
    console.log(`  • ${data.stageImplementationDetails?.length || 0} Stage Implementation Details`);

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
      console.log('📁 Reading import file:', file.name);
      const text = await file.text();
      const data: ExportedData = JSON.parse(text);

      // Validate the data structure
      if (!this.validateImportData(data)) {
        throw new Error('Invalid import data format. Please ensure the file is a valid ZTMM export file.');
      }

      console.log('✅ File validated, starting import...');
      await this.importFromJson(data);
      console.log('✅ Import completed successfully');
    } catch (error) {
      console.error('❌ Error uploading and importing data:', error);

      // Provide user-friendly error messages
      if (error instanceof Error) {
        if (error.message.includes('duplicate MaturityStageImplementation')) {
          // Extract useful information from the error
          const match = error.message.match(/group_id=(\d+), stage_id=(\d+)/);
          if (match) {
            const [, groupId, stageId] = match;
            throw new Error(
              `Import failed: Duplicate maturity stage implementation detected.\n\n` +
              `The import file contains multiple implementations for the same combination:\n` +
              `  • Process/Technology Group ID: ${groupId}\n` +
              `  • Maturity Stage ID: ${stageId}\n\n` +
              `Each process/technology group can only have one implementation per maturity stage.\n` +
              `Please fix the import file and try again.`
            );
          }
        } else if (error.message.includes('ConstraintError')) {
          throw new Error(
            `Import failed: Database constraint violation.\n\n` +
            `${error.message}\n\n` +
            `This usually means the import file contains duplicate or invalid data.\n` +
            `Check the browser console for detailed information.`
          );
        }
      }

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
   * Returns V2 data counts (processTechnologyGroups, maturityStageImplementations, assessments)
   */
  async getDataStatistics(): Promise<{
    version: DataFormatVersion;
    pillars: number;
    functionCapabilities: number;
    maturityStages: number;
    processTechnologyGroups: number;
    maturityStageImplementations: number;
    assessments: number;
  }> {
    try {
      const [
        pillars,
        functionCapabilities,
        maturityStages,
        processTechnologyGroups,
        maturityStageImplementations,
        assessments
      ] = await Promise.all([
        this.dataService.getPillars(),
        this.dataService.getFunctionCapabilities(),
        this.dataService.getMaturityStages(),
        this.dataService.getProcessTechnologyGroups(),
        this.dataService.getMaturityStageImplementations(),
        this.dataService.getAssessmentsV2()
      ]);

      // Version is always 2.0.0 since V1 is deprecated (operational code removed in Phase 6)
      // V1 data can still be imported but the active model is always V2
      const version: DataFormatVersion = '2.0.0';

      return {
        version,
        pillars: pillars.length,
        functionCapabilities: functionCapabilities.length,
        maturityStages: maturityStages.length,
        processTechnologyGroups: processTechnologyGroups.length,
        maturityStageImplementations: maturityStageImplementations.length,
        assessments: assessments.length
      };
    } catch (error) {
      console.error('Error getting data statistics:', error);
      return {
        version: '2.0.0',
        pillars: 0,
        functionCapabilities: 0,
        maturityStages: 0,
        processTechnologyGroups: 0,
        maturityStageImplementations: 0,
        assessments: 0
      };
    }
  }
}
