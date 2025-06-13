import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Define the expected assessment data interface for PDF export
interface AssessmentReportItem {
  pillarName: string;
  functionCapabilityName: string;
  functionCapabilityType: string;
  description: string;
  type: string;
  maturityStageName: string;
  status: string;
  notes: string;
}

export interface PDFExportOptions {
  filename?: string;
  quality?: number;
  scale?: number;
  useCORS?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {

  // Empty constructor is necessary for dependency injection
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() { }

  /**
   * Exports HTML element to PDF
   * @param element - The HTML element to convert to PDF
   * @param options - Configuration options for PDF export
   */
  async exportElementToPDF(element: HTMLElement, options: PDFExportOptions = {}): Promise<void> {
    const {
      filename = 'assessment-results.pdf',
      quality = 1.0,
      scale = 2,
      useCORS = true
    } = options;

    try {
      // Show loading state (could be enhanced with a loading spinner)
      console.log('Generating PDF...');

      // Configure html2canvas options
      const canvas = await html2canvas(element, {
        scale: scale,
        useCORS: useCORS,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        height: element.scrollHeight,
        width: element.scrollWidth
      });

      const imgData = canvas.toDataURL('image/png', quality);

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      // Create PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      pdf.save(filename);
      console.log('PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF. Please try again.');
    }
  }

  /**
   * Exports custom content to PDF with header and footer
   * @param title - Title for the PDF
   * @param content - HTML content to include
   * @param options - Configuration options
   */
  async exportCustomContentToPDF(
    title: string,
    content: string,
    options: PDFExportOptions = {}
  ): Promise<void> {
    const {
      filename = 'assessment-results.pdf'
    } = options;

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Add header
      pdf.setFontSize(20);
      pdf.text(title, 20, 30);

      // Add generation date
      pdf.setFontSize(10);
      const date = new Date().toLocaleDateString();
      pdf.text(`Generated on: ${date}`, 20, 40);

      // Add content (this is a simplified version - for complex HTML, use html2canvas)
      pdf.setFontSize(12);
      const lines = pdf.splitTextToSize(content, 170);
      pdf.text(lines, 20, 60);

      // Save the PDF
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating custom PDF:', error);
      throw new Error('Failed to generate PDF. Please try again.');
    }
  }

  /**
   * Creates a formatted assessment report PDF
   * @param assessmentData - The assessment data to include in the PDF
   * @param options - Configuration options
   */
  async exportAssessmentReport(assessmentData: AssessmentReportItem[], options: PDFExportOptions = {}): Promise<void> {
    const {
      filename = 'ztmm-assessment-report.pdf'
    } = options;

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      let yPosition = 30;

      // Header
      pdf.setFontSize(24);
      pdf.setTextColor(40, 40, 40);
      pdf.text('ZTMM Assessment Report', 20, yPosition);

      yPosition += 15;
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition);

      yPosition += 20;

      // Summary section
      pdf.setFontSize(16);
      pdf.setTextColor(40, 40, 40);
      pdf.text('Assessment Summary', 20, yPosition);

      yPosition += 10;
      pdf.setFontSize(10);        // Add assessment data (this would need to be customized based on your data structure)
        if (assessmentData && assessmentData.length > 0) {
          assessmentData.forEach((item: AssessmentReportItem, index: number) => {
            if (yPosition > 280) { // Check if we need a new page
              pdf.addPage();
              yPosition = 30;
            }

          const text = `${index + 1}. ${item.pillarName} - ${item.functionCapabilityName}: ${item.status}`;
          pdf.text(text, 20, yPosition);
          yPosition += 6;
        });
      }

      pdf.save(filename);
    } catch (error) {
      console.error('Error generating assessment report:', error);
      throw new Error('Failed to generate assessment report. Please try again.');
    }
  }
}
