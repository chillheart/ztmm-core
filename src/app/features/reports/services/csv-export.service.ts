import { Injectable } from '@angular/core';
import { PillarSummary, FunctionSummary, DetailedAssessmentItem } from '../models/report.models';

@Injectable({
  providedIn: 'root'
})
export class CsvExportService {

  generateCsvReport(
    pillarSummaries: PillarSummary[],
    allFunctionDetails: Map<number, DetailedAssessmentItem[]>
  ): string {
    const csvRows: string[] = [];

    // Add CSV header
    csvRows.push(this.generateCsvHeader());

    // Add pillar overview data
    for (const pillar of pillarSummaries) {
      csvRows.push(this.generatePillarRow(pillar));

      // Add function data for this pillar
      for (const func of pillar.functions) {
        csvRows.push(this.generateFunctionRow(pillar, func));

        // Add detailed assessment items
        const details = allFunctionDetails.get(func.functionCapability.id) || [];
        for (const detail of details) {
          csvRows.push(this.generateDetailRow(pillar, func, detail));
        }
      }
    }

    return csvRows.join('\n');
  }

  private generateCsvHeader(): string {
    const headers = [
      'Type', // 'Pillar', 'Function', 'Detail'
      'Pillar Name',
      'Function Name',
      'Technology/Process',
      'Current Maturity Stage',
      'Actual Maturity Stage',
      'Has Sequential Gap',
      'Sequential Gap Explanation',
      'Assessed Items',
      'Total Items',
      'Completed Items',
      'In Progress Items',
      'Not Started Items',
      'Assessment Percentage',
      'Completion Percentage',
      'Item Type',
      'Implementation Status',
      'Stage Name',
      'Description',
      'Notes'
    ];

    return this.escapeCsvRow(headers);
  }

  private generatePillarRow(pillar: PillarSummary): string {
    const row = [
      'Pillar',
      pillar.pillar.name,
      '', // Function Name
      '', // Technology/Process
      pillar.overallMaturityStage,
      pillar.actualMaturityStage || '',
      pillar.hasSequentialMaturityGap ? 'Yes' : 'No',
      pillar.sequentialMaturityExplanation || '',
      pillar.assessedItems.toString(),
      pillar.totalItems.toString(),
      '', // Completed Items (aggregated at pillar level)
      '', // In Progress Items
      '', // Not Started Items
      `${pillar.assessmentPercentage.toFixed(1)}%`,
      '', // Completion Percentage (not at pillar level)
      '', // Item Type
      '', // Implementation Status
      '', // Stage Name
      pillar.pillar.name, // Description
      '' // Notes
    ];

    return this.escapeCsvRow(row);
  }

  private generateFunctionRow(pillar: PillarSummary, func: FunctionSummary): string {
    const row = [
      'Function',
      pillar.pillar.name,
      func.functionCapability.name,
      '', // Technology/Process
      func.overallMaturityStage,
      func.actualMaturityStage || '',
      func.hasSequentialMaturityGap ? 'Yes' : 'No',
      func.sequentialMaturityExplanation || '',
      func.assessedItems.toString(),
      func.totalItems.toString(),
      '', // Completed Items (aggregated)
      '', // In Progress Items
      '', // Not Started Items
      `${func.assessmentPercentage.toFixed(1)}%`,
      '', // Completion Percentage
      func.functionCapability.type,
      '', // Implementation Status
      '', // Stage Name
      func.functionCapability.name, // Description
      '' // Notes
    ];

    return this.escapeCsvRow(row);
  }

  private generateDetailRow(pillar: PillarSummary, func: FunctionSummary, detail: DetailedAssessmentItem): string {
    // Enhanced V2 detection: check if the item name contains stage info
    const isV2Format = detail.name.includes(' - ') && 
      (detail.name.includes('Traditional') || detail.name.includes('Initial') || 
       detail.name.includes('Advanced') || detail.name.includes('Optimal'));
    
    // For V2, extract the base name and stage
    const displayName = isV2Format ? detail.name.split(' - ')[0] : detail.name;
    const stageName = isV2Format ? detail.name.split(' - ')[1] : detail.maturityStageName;
    
    // Determine if this is assessed (has status other than 'Not Assessed')
    const isAssessed = detail.status !== 'Not Assessed';
    
    // Calculate completion percentage based on status
    let completionPercentage = '0%';
    if (detail.status === 'Fully Implemented' || detail.status === 'Superseded') {
      completionPercentage = '100%';
    } else if (detail.status === 'Partially Implemented') {
      completionPercentage = '50%'; // Estimated
    }
    
    const row = [
      'Detail',
      pillar.pillar.name,
      func.functionCapability.name,
      displayName,
      func.overallMaturityStage,
      func.actualMaturityStage || '',
      '', // Has Sequential Gap (not applicable for individual items)
      '', // Sequential Gap Explanation
      isAssessed ? '1' : '0', // Assessed Items
      '1', // Total Items
      detail.status === 'Fully Implemented' || detail.status === 'Superseded' ? '1' : '0', // Completed
      detail.status === 'Partially Implemented' ? '1' : '0', // In Progress
      detail.status === 'Not Implemented' ? '1' : '0', // Not Started
      isAssessed ? '100%' : '0%', // Assessment Percentage (binary for individual items)
      completionPercentage,
      detail.type,
      detail.status,
      stageName,
      detail.description || '',
      detail.notes || ''
    ];

    return this.escapeCsvRow(row);
  }

  private escapeCsvRow(values: string[]): string {
    return values.map(value => this.escapeCsvValue(value)).join(',');
  }

  private escapeCsvValue(value: string): string {
    // If the value contains comma, quote, or newline, wrap it in quotes and escape internal quotes
    if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  downloadCsv(csvContent: string, filename = 'zero-trust-maturity-assessment'): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }
}
