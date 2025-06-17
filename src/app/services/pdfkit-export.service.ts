import { Injectable } from '@angular/core';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';

interface AssessmentDetailItem {
  pillarName: string;
  functionCapabilityName: string;
  functionCapabilityType: string;
  description: string;
  type: string;
  maturityStageName: string;
  status: string;
  notes: string;
}

@Injectable({ providedIn: 'root' })
export class PdfkitExportService {
  // PDF page constants with proper margins
  static readonly PAGE_MARGIN = 36; // 0.5 inch margins
  static readonly PAGE_WIDTH = 612; // 8.5 inches
  static readonly PAGE_HEIGHT = 792; // 11 inches
  static readonly LEFT_MARGIN = PdfkitExportService.PAGE_MARGIN;
  static readonly RIGHT_MARGIN = PdfkitExportService.PAGE_WIDTH - PdfkitExportService.PAGE_MARGIN;
  static readonly TOP_MARGIN = PdfkitExportService.PAGE_MARGIN;
  static readonly BOTTOM_MARGIN = PdfkitExportService.PAGE_HEIGHT - PdfkitExportService.PAGE_MARGIN;
  static readonly CONTENT_WIDTH = PdfkitExportService.RIGHT_MARGIN - PdfkitExportService.LEFT_MARGIN;
  static readonly CONTENT_HEIGHT = PdfkitExportService.BOTTOM_MARGIN - PdfkitExportService.TOP_MARGIN;

  constructor() { }

  /**
   * Create a simple, clean assessment report PDF
   */
  async createDetailedAssessmentReport(
    reportData: AssessmentDetailItem[],
    reportTitle: string = 'ZTMM Assessment Report'
  ): Promise<void> {
    try {
      const pdfDoc = await PDFDocument.create();
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      let currentPage = pdfDoc.addPage([PdfkitExportService.PAGE_WIDTH, PdfkitExportService.PAGE_HEIGHT]);
      let currentY = PdfkitExportService.PAGE_HEIGHT - PdfkitExportService.TOP_MARGIN;

      // Document header
      currentPage.drawText(reportTitle, {
        x: PdfkitExportService.LEFT_MARGIN,
        y: currentY,
        size: 20,
        font: helveticaBoldFont,
        color: rgb(0.1, 0.2, 0.4),
      });
      currentY -= 30;

      currentPage.drawText(`Generated on: ${new Date().toLocaleDateString()}`, {
        x: PdfkitExportService.LEFT_MARGIN,
        y: currentY,
        size: 10,
        font: helveticaFont,
        color: rgb(0.5, 0.5, 0.5),
      });
      currentY -= 50;

      // Group data by pillar
      const groupedData = this.groupDataByPillar(reportData);

      for (const [pillarName, pillarItems] of Object.entries(groupedData)) {
        // Check if we need a new page
        if (currentY < PdfkitExportService.BOTTOM_MARGIN + 100) {
          currentPage = pdfDoc.addPage([PdfkitExportService.PAGE_WIDTH, PdfkitExportService.PAGE_HEIGHT]);
          currentY = PdfkitExportService.PAGE_HEIGHT - PdfkitExportService.TOP_MARGIN;
        }

        // Pillar header
        currentPage.drawText(`Pillar: ${pillarName}`, {
          x: PdfkitExportService.LEFT_MARGIN,
          y: currentY,
          size: 16,
          font: helveticaBoldFont,
          color: rgb(0.1, 0.2, 0.4),
        });
        currentY -= 25;

        // Simple list of items
        for (const item of pillarItems) {
          // Check if we need a new page
          if (currentY < PdfkitExportService.BOTTOM_MARGIN + 40) {
            currentPage = pdfDoc.addPage([PdfkitExportService.PAGE_WIDTH, PdfkitExportService.PAGE_HEIGHT]);
            currentY = PdfkitExportService.PAGE_HEIGHT - PdfkitExportService.TOP_MARGIN;
          }

          // Item description
          const description = this.truncateText(item.description, 80);
          currentPage.drawText(`• ${description}`, {
            x: PdfkitExportService.LEFT_MARGIN + 20,
            y: currentY,
            size: 10,
            font: helveticaFont,
            color: rgb(0.2, 0.2, 0.2),
          });
          currentY -= 15;

          // Status and stage on same line
          const statusText = `Status: ${item.status} | Stage: ${item.maturityStageName}`;
          currentPage.drawText(statusText, {
            x: PdfkitExportService.LEFT_MARGIN + 40,
            y: currentY,
            size: 9,
            font: helveticaFont,
            color: rgb(0.4, 0.4, 0.4),
          });
          currentY -= 20;
        }

        currentY -= 20; // Extra spacing between pillars
      }

      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      saveAs(blob, `${reportTitle.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (error) {
      console.error('Error creating PDF report:', error);
      throw new Error('Failed to generate PDF report. Please try again.');
    }
  }

  /**
   * Export enhanced assessment report - simplified version
   */
  async exportEnhancedAssessmentReport(
    allResults: any[],
    enhancedPillarData: any[],
    options: {
      includeDetailedResults?: boolean;
      includeRecommendations?: boolean;
      companyName?: string;
      reportDate?: Date;
      assessorName?: string;
      completeReportsData?: any;
    } = {}
  ): Promise<void> {
    try {
      const {
        companyName = 'ZTMM Assessment Report',
        reportDate = new Date(),
        assessorName = 'ZTMM Assessment Tool'
      } = options;

      // Convert the data to our simple format
      const reportData: AssessmentDetailItem[] = allResults.map(result => ({
        pillarName: result.pillarName || '',
        functionCapabilityName: result.functionCapabilityName || '',
        functionCapabilityType: result.functionCapabilityType || '',
        description: result.description || '',
        type: result.type || '',
        maturityStageName: result.maturityStageName || '',
        status: result.status || 'Not Assessed',
        notes: result.notes || ''
      }));

      // Use the simple report method
      await this.createDetailedAssessmentReport(reportData, companyName);

    } catch (error) {
      console.error('Error creating enhanced assessment report:', error);
      throw new Error('Failed to generate enhanced assessment report. Please try again.');
    }
  }

  /**
   * Helper method to group data by pillar
   */
  private groupDataByPillar(data: AssessmentDetailItem[]): Record<string, AssessmentDetailItem[]> {
    return data.reduce((groups, item) => {
      const pillarName = item.pillarName || 'Unknown Pillar';
      if (!groups[pillarName]) {
        groups[pillarName] = [];
      }
      groups[pillarName].push(item);
      return groups;
    }, {} as Record<string, AssessmentDetailItem[]>);
  }

  /**
   * Helper method to truncate text
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 3) + '...';
  }
}
