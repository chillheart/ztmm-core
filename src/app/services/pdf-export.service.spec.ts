import { TestBed } from '@angular/core/testing';
import { PdfExportService } from './pdf-export.service';

describe('PdfExportService', () => {
  let service: PdfExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PdfExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have exportElementToPDF method', () => {
    expect(service.exportElementToPDF).toBeDefined();
    expect(typeof service.exportElementToPDF).toBe('function');
  });

  it('should have exportCustomContentToPDF method', () => {
    expect(service.exportCustomContentToPDF).toBeDefined();
    expect(typeof service.exportCustomContentToPDF).toBe('function');
  });

  it('should have exportAssessmentReport method', () => {
    expect(service.exportAssessmentReport).toBeDefined();
    expect(typeof service.exportAssessmentReport).toBe('function');
  });

  // Note: Full integration tests would require mocking jsPDF and html2canvas
  // which is complex and might be better handled in e2e tests
});
