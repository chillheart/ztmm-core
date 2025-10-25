import { TestBed } from '@angular/core/testing';
import { CsvExportService } from './csv-export.service';
import { PillarSummary, DetailedAssessmentItem } from '../models/report.models';

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

  // V2 Model Tests
  describe('V2 Model Support', () => {
    it('should include V2-specific columns in header', () => {
      const header = service['generateCsvHeader']();
      expect(header).toContain('Completed Items');
      expect(header).toContain('In Progress Items');
      expect(header).toContain('Not Started Items');
      expect(header).toContain('Completion Percentage');
      expect(header).toContain('Item Type');
      expect(header).toContain('Implementation Status');
      expect(header).toContain('Stage Name');
      expect(header).toContain('Notes');
      // Should have 20 columns
      expect(header.split(',').length).toBe(20);
    });

    it('should detect V2 format items and extract stage from name', () => {
      const pillarSummaries: PillarSummary[] = [
        {
          pillar: { id: 1, name: 'Identity' },
          functions: [
            {
              functionCapability: { id: 10, name: 'Authentication', type: 'Function', pillar_id: 1 },
              assessedItems: 1,
              totalItems: 1,
              assessmentPercentage: 100,
              overallMaturityStage: 'Initial',
              actualMaturityStage: 'Initial',
              maturityStageBreakdown: [],
              sequentialMaturityExplanation: '',
              hasSequentialMaturityGap: false
            }
          ],
          assessedItems: 1,
          totalItems: 1,
          assessmentPercentage: 100,
          overallMaturityStage: 'Initial',
          actualMaturityStage: 'Initial',
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
          name: 'MFA - Initial',
          description: 'Multi-factor authentication',
          type: 'Technology',
          maturityStageName: 'Initial',
          status: 'Fully Implemented',
          notes: 'All users enrolled'
        }
      ]);
      const csv = service.generateCsvReport(pillarSummaries, details);

      // Should extract base name
      expect(csv).toContain('MFA');
      // Should include stage separately
      expect(csv).toContain('Initial');
      // Should show implementation status
      expect(csv).toContain('Fully Implemented');
      // Should include notes
      expect(csv).toContain('All users enrolled');
    });

    it('should calculate completion percentage for V2 detail rows', () => {
      const pillarSummaries: PillarSummary[] = [
        {
          pillar: { id: 1, name: 'Data' },
          functions: [
            {
              functionCapability: { id: 20, name: 'Encryption', type: 'Function', pillar_id: 1 },
              assessedItems: 3,
              totalItems: 3,
              assessmentPercentage: 100,
              overallMaturityStage: 'Advanced',
              actualMaturityStage: 'Advanced',
              maturityStageBreakdown: [],
              sequentialMaturityExplanation: '',
              hasSequentialMaturityGap: false
            }
          ],
          assessedItems: 3,
          totalItems: 3,
          assessmentPercentage: 100,
          overallMaturityStage: 'Advanced',
          actualMaturityStage: 'Advanced',
          maturityStageBreakdown: [],
          sequentialMaturityExplanation: '',
          hasSequentialMaturityGap: false
        }
      ];
      const details = new Map<number, DetailedAssessmentItem[]>();
      details.set(20, [
        {
          pillarName: 'Data',
          functionCapabilityName: 'Encryption',
          functionCapabilityType: 'Function',
          name: 'TLS - Traditional',
          description: 'TLS 1.2',
          type: 'Technology',
          maturityStageName: 'Traditional',
          status: 'Fully Implemented',
          notes: ''
        },
        {
          pillarName: 'Data',
          functionCapabilityName: 'Encryption',
          functionCapabilityType: 'Function',
          name: 'TLS - Advanced',
          description: 'TLS 1.3 with PFS',
          type: 'Technology',
          maturityStageName: 'Advanced',
          status: 'Partially Implemented',
          notes: ''
        },
        {
          pillarName: 'Data',
          functionCapabilityName: 'Encryption',
          functionCapabilityType: 'Function',
          name: 'Quantum-safe - Optimal',
          description: 'Post-quantum cryptography',
          type: 'Technology',
          maturityStageName: 'Optimal',
          status: 'Not Implemented',
          notes: ''
        }
      ]);
      const csv = service.generateCsvReport(pillarSummaries, details);

      // Should have completion percentages
      expect(csv).toContain('100%'); // Fully Implemented
      expect(csv).toContain('50%'); // Partially Implemented
      expect(csv).toContain('0%'); // Not Implemented
    });

    it('should include item type in V2 detail rows', () => {
      const pillarSummaries: PillarSummary[] = [
        {
          pillar: { id: 1, name: 'Identity' },
          functions: [
            {
              functionCapability: { id: 10, name: 'Auth', type: 'Function', pillar_id: 1 },
              assessedItems: 2,
              totalItems: 2,
              assessmentPercentage: 100,
              overallMaturityStage: 'Initial',
              actualMaturityStage: 'Initial',
              maturityStageBreakdown: [],
              sequentialMaturityExplanation: '',
              hasSequentialMaturityGap: false
            }
          ],
          assessedItems: 2,
          totalItems: 2,
          assessmentPercentage: 100,
          overallMaturityStage: 'Initial',
          actualMaturityStage: 'Initial',
          maturityStageBreakdown: [],
          sequentialMaturityExplanation: '',
          hasSequentialMaturityGap: false
        }
      ];
      const details = new Map<number, DetailedAssessmentItem[]>();
      details.set(10, [
        {
          pillarName: 'Identity',
          functionCapabilityName: 'Auth',
          functionCapabilityType: 'Function',
          name: 'MFA - Initial',
          description: 'Multi-factor',
          type: 'Technology',
          maturityStageName: 'Initial',
          status: 'Fully Implemented',
          notes: ''
        },
        {
          pillarName: 'Identity',
          functionCapabilityName: 'Auth',
          functionCapabilityType: 'Function',
          name: 'Policy - Traditional',
          description: 'Auth policy',
          type: 'Process',
          maturityStageName: 'Traditional',
          status: 'Fully Implemented',
          notes: ''
        }
      ]);
      const csv = service.generateCsvReport(pillarSummaries, details);

      // Should include type
      expect(csv).toContain('Technology');
      expect(csv).toContain('Process');
    });

    it('should properly populate all 20 columns for V2 rows', () => {
      const pillarSummaries: PillarSummary[] = [
        {
          pillar: { id: 1, name: 'Identity' },
          functions: [
            {
              functionCapability: { id: 10, name: 'Auth', type: 'Function', pillar_id: 1 },
              assessedItems: 1,
              totalItems: 1,
              assessmentPercentage: 100,
              overallMaturityStage: 'Initial',
              actualMaturityStage: 'Initial',
              maturityStageBreakdown: [],
              sequentialMaturityExplanation: '',
              hasSequentialMaturityGap: false
            }
          ],
          assessedItems: 1,
          totalItems: 1,
          assessmentPercentage: 100,
          overallMaturityStage: 'Initial',
          actualMaturityStage: 'Initial',
          maturityStageBreakdown: [],
          sequentialMaturityExplanation: '',
          hasSequentialMaturityGap: false
        }
      ];
      const details = new Map<number, DetailedAssessmentItem[]>();
      details.set(10, [
        {
          pillarName: 'Identity',
          functionCapabilityName: 'Auth',
          functionCapabilityType: 'Function',
          name: 'MFA - Initial',
          description: 'Multi-factor authentication',
          type: 'Technology',
          maturityStageName: 'Initial',
          status: 'Fully Implemented',
          notes: 'Deployed company-wide'
        }
      ]);
      const csv = service.generateCsvReport(pillarSummaries, details);

      const lines = csv.split('\n');
      expect(lines.length).toBeGreaterThan(3); // Header + Pillar + Function + Detail

      // Each line should have 20 fields
      lines.forEach((line, index) => {
        if (line.trim()) {
          const fields = line.split(',').length;
          expect(fields).toBe(20);
        }
      });
    });

    it('should handle V2 items with special characters in notes', () => {
      const pillarSummaries: PillarSummary[] = [
        {
          pillar: { id: 1, name: 'Identity' },
          functions: [
            {
              functionCapability: { id: 10, name: 'Auth', type: 'Function', pillar_id: 1 },
              assessedItems: 1,
              totalItems: 1,
              assessmentPercentage: 100,
              overallMaturityStage: 'Initial',
              actualMaturityStage: 'Initial',
              maturityStageBreakdown: [],
              sequentialMaturityExplanation: '',
              hasSequentialMaturityGap: false
            }
          ],
          assessedItems: 1,
          totalItems: 1,
          assessmentPercentage: 100,
          overallMaturityStage: 'Initial',
          actualMaturityStage: 'Initial',
          maturityStageBreakdown: [],
          sequentialMaturityExplanation: '',
          hasSequentialMaturityGap: false
        }
      ];
      const details = new Map<number, DetailedAssessmentItem[]>();
      details.set(10, [
        {
          pillarName: 'Identity',
          functionCapabilityName: 'Auth',
          functionCapabilityType: 'Function',
          name: 'MFA - Initial',
          description: 'Multi-factor, using "tokens"',
          type: 'Technology',
          maturityStageName: 'Initial',
          status: 'Fully Implemented',
          notes: 'Deployed to all users,\nincluding contractors'
        }
      ]);
      const csv = service.generateCsvReport(pillarSummaries, details);

      // Should properly escape special characters
      expect(csv).toContain('"Multi-factor, using ""tokens"""');
      expect(csv).toContain('"Deployed to all users,\nincluding contractors"');
    });

    it('should separate notes from description in V2 rows', () => {
      const pillarSummaries: PillarSummary[] = [
        {
          pillar: { id: 1, name: 'Identity' },
          functions: [
            {
              functionCapability: { id: 10, name: 'Auth', type: 'Function', pillar_id: 1 },
              assessedItems: 1,
              totalItems: 1,
              assessmentPercentage: 100,
              overallMaturityStage: 'Initial',
              actualMaturityStage: 'Initial',
              maturityStageBreakdown: [],
              sequentialMaturityExplanation: '',
              hasSequentialMaturityGap: false
            }
          ],
          assessedItems: 1,
          totalItems: 1,
          assessmentPercentage: 100,
          overallMaturityStage: 'Initial',
          actualMaturityStage: 'Initial',
          maturityStageBreakdown: [],
          sequentialMaturityExplanation: '',
          hasSequentialMaturityGap: false
        }
      ];
      const details = new Map<number, DetailedAssessmentItem[]>();
      details.set(10, [
        {
          pillarName: 'Identity',
          functionCapabilityName: 'Auth',
          functionCapabilityType: 'Function',
          name: 'MFA - Initial',
          description: 'Multi-factor authentication requirement',
          type: 'Technology',
          maturityStageName: 'Initial',
          status: 'Fully Implemented',
          notes: 'Implementation notes go here'
        }
      ]);
      const csv = service.generateCsvReport(pillarSummaries, details);

      const lines = csv.split('\n');
      const detailLine = lines.find(line => line.startsWith('Detail'));
      expect(detailLine).toBeTruthy();

      // Should have description and notes as separate fields
      expect(detailLine).toContain('Multi-factor authentication requirement');
      expect(detailLine).toContain('Implementation notes go here');
    });
  });
});
