import { TestBed } from '@angular/core/testing';
import { CsvExportService } from './csv-export.service';
import { PillarSummary, FunctionSummary, DetailedAssessmentItem } from '../models/report.models';

describe('CsvExportService', () => {
  let service: CsvExportService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CsvExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate CSV header', () => {
    const header = service['generateCsvHeader']();
    expect(header).toContain('Type');
    expect(header).toContain('Pillar Name');
    expect(header.split(',').length).toBeGreaterThan(10);
  });

  it('should generate CSV with pillar, function, and detail rows', () => {
    const pillarSummaries: PillarSummary[] = [
      {
        pillar: { id: 1, name: 'Identity' },
        functions: [
          {
            functionCapability: { id: 10, name: 'Authentication', type: 'Function', pillar_id: 1 },
            assessedItems: 2,
            totalItems: 2,
            assessmentPercentage: 100,
            overallMaturityStage: 'Optimal',
            actualMaturityStage: 'Optimal',
            maturityStageBreakdown: [],
            sequentialMaturityExplanation: '',
            hasSequentialMaturityGap: false
          }
        ],
        assessedItems: 2,
        totalItems: 2,
        assessmentPercentage: 100,
        overallMaturityStage: 'Optimal',
        actualMaturityStage: 'Optimal',
        maturityStageBreakdown: [],
        sequentialMaturityExplanation: '',
        hasSequentialMaturityGap: false
      }
    ];
    const details = new Map<number, DetailedAssessmentItem[]>();
    details.set(10, [
      {
        pillarName: 'Identity',
        functionCapabilityName: 'Authentication',
        functionCapabilityType: 'Function',
        name: 'MFA',
        description: 'Multi-factor authentication',
        type: 'Technology',
        maturityStageName: 'Optimal',
        status: 'Fully Implemented',
        notes: 'All users'
      }
    ]);
    const csv = service.generateCsvReport(pillarSummaries, details);
    expect(csv).toContain('Pillar,Identity');
    expect(csv).toContain('Function,Identity,Authentication');
    expect(csv).toContain('Detail,Identity,Authentication,MFA');
    expect(csv).toContain('Multi-factor authentication');
  });

  it('should handle empty input gracefully', () => {
    const csv = service.generateCsvReport([], new Map());
    expect(csv).toContain('Type');
    expect(csv.split('\n').length).toBe(1); // Only header
  });

  it('should escape commas, quotes, and newlines in CSV values', () => {
    const row = service['escapeCsvRow'](['a,b', 'c"d', 'e\nf']);
    expect(row).toContain('"a,b"');
    expect(row).toContain('"c""d"');
    expect(row).toContain('"e\nf"');
  });
});
