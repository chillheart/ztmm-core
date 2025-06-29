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
      'Reserved Field 1',
      'Reserved Field 2',
      'Assessment Percentage',
      'Description'
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
      '', // Advanced Count (not applicable at pillar level)
      '', // Optimal Count (not applicable at pillar level)
      `${pillar.assessmentPercentage.toFixed(1)}%`,
      pillar.pillar.name // Using name as description
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
      '', // Advanced Count (not applicable at function level)
      '', // Optimal Count (not applicable at function level)
      `${func.assessmentPercentage.toFixed(1)}%`,
      func.functionCapability.name // Using name as description
    ];

    return this.escapeCsvRow(row);
  }

  private generateDetailRow(pillar: PillarSummary, func: FunctionSummary, detail: DetailedAssessmentItem): string {
    const row = [
      'Detail',
      pillar.pillar.name,
      func.functionCapability.name,
      detail.name,
      detail.maturityStageName,
      '', // Actual Maturity Stage (not applicable for individual items)
      '', // Has Sequential Gap (not applicable for individual items)
      '', // Sequential Gap Explanation (not applicable for individual items)
      '', // Traditional Count (not applicable for individual items)
      '', // Advanced Count (not applicable for individual items)
      '', // Optimal Count (not applicable for individual items)
      '1', // Total Items (always 1 for individual items)
      detail.status === 'Not Implemented' ? '0%' : '100%',
      detail.description || ''
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

  downloadCsv(csvContent: string, filename: string = 'zero-trust-maturity-assessment'): void {
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
