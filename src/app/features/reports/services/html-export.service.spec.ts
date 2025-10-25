import { TestBed } from '@angular/core/testing';
import { HtmlExportService } from './html-export.service';
import { PillarSummary, DetailedAssessmentItem } from '../models/report.models';
import { MaturityCalculationService } from './maturity-calculation.service';

describe('HtmlExportService', () => {
  let service: HtmlExportService;
  let maturityCalc: MaturityCalculationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MaturityCalculationService]
    });
    maturityCalc = TestBed.inject(MaturityCalculationService);
    service = new HtmlExportService(maturityCalc);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate HTML report with cover and overview', () => {
    const pillarSummaries: PillarSummary[] = [
      {
        pillar: { id: 1, name: 'Identity' },
        functions: [],
        assessedItems: 0,
        totalItems: 0,
        assessmentPercentage: 0,
        overallMaturityStage: 'Initial',
        actualMaturityStage: 'Initial',
        maturityStageBreakdown: [],
        sequentialMaturityExplanation: '',
        hasSequentialMaturityGap: false
      }
    ];
    const details = new Map<number, DetailedAssessmentItem[]>();
    const html = service.generateHtmlReport(pillarSummaries, details);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Zero Trust Maturity Assessment');
    expect(html).toContain('Pillar Overview');
    expect(html).toContain('Identity');
  });

  it('should include function and detail sections in HTML', () => {
    const pillarSummaries: PillarSummary[] = [
      {
        pillar: { id: 1, name: 'Identity' },
        functions: [
          {
            functionCapability: { id: 10, name: 'Authentication', type: 'Function', pillar_id: 1 },
            assessedItems: 1,
            totalItems: 1,
            assessmentPercentage: 100,
            overallMaturityStage: 'Optimal',
            actualMaturityStage: 'Optimal',
            maturityStageBreakdown: [
              { stageName: 'Optimal', assessedItems: 1, totalItems: 1, completedItems: 1, inProgressItems: 0, notStartedItems: 0, percentage: 100, completionPercentage: 100, status: 'completed' }
            ],
            sequentialMaturityExplanation: '',
            hasSequentialMaturityGap: false
          }
        ],
        assessedItems: 1,
        totalItems: 1,
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
    const html = service.generateHtmlReport(pillarSummaries, details);
    expect(html).toContain('Authentication');
    expect(html).toContain('MFA');
    expect(html).toContain('Multi-factor authentication');
  });

  it('should handle empty input gracefully', () => {
    const html = service.generateHtmlReport([], new Map());
    expect(html).toContain('Zero Trust Maturity Assessment');
    expect(html).toContain('Pillar Overview');
  });

  // V2 Model Tests
  describe('V2 Model Support', () => {
    it('should detect V2 format items with stage in name', () => {
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
              maturityStageBreakdown: [
                { stageName: 'Initial', assessedItems: 1, totalItems: 1, completedItems: 1, inProgressItems: 0, notStartedItems: 0, percentage: 100, completionPercentage: 100, status: 'completed' }
              ],
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
          description: 'Multi-factor authentication at Initial stage',
          type: 'Technology',
          maturityStageName: 'Initial',
          status: 'Fully Implemented',
          notes: 'All users'
        }
      ]);
      const html = service.generateHtmlReport(pillarSummaries, details);
      
      // Should detect V2 format and show base name
      expect(html).toContain('MFA');
      // Should include V2 indicator
      expect(html).toContain('V2 Model');
      // Should show achieved badge
      expect(html).toContain('Achieved');
    });

    it('should display V2 items with achieved status correctly', () => {
      const pillarSummaries: PillarSummary[] = [
        {
          pillar: { id: 1, name: 'Data' },
          functions: [
            {
              functionCapability: { id: 20, name: 'Encryption', type: 'Function', pillar_id: 1 },
              assessedItems: 2,
              totalItems: 2,
              assessmentPercentage: 100,
              overallMaturityStage: 'Advanced',
              actualMaturityStage: 'Advanced',
              maturityStageBreakdown: [
                { stageName: 'Traditional', assessedItems: 1, totalItems: 1, completedItems: 1, inProgressItems: 0, notStartedItems: 0, percentage: 100, completionPercentage: 100, status: 'completed' },
                { stageName: 'Advanced', assessedItems: 1, totalItems: 1, completedItems: 1, inProgressItems: 0, notStartedItems: 0, percentage: 100, completionPercentage: 100, status: 'completed' }
              ],
              sequentialMaturityExplanation: '',
              hasSequentialMaturityGap: false
            }
          ],
          assessedItems: 2,
          totalItems: 2,
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
          description: 'Traditional TLS implementation',
          type: 'Process',
          maturityStageName: 'Traditional',
          status: 'Fully Implemented',
          notes: 'Completed'
        },
        {
          pillarName: 'Data',
          functionCapabilityName: 'Encryption',
          functionCapabilityType: 'Function',
          name: 'TLS - Advanced',
          description: 'Advanced TLS with perfect forward secrecy',
          type: 'Process',
          maturityStageName: 'Advanced',
          status: 'Fully Implemented',
          notes: 'Recently deployed'
        }
      ]);
      const html = service.generateHtmlReport(pillarSummaries, details);
      
      // Should show base name only once
      expect(html).toContain('TLS');
      // Should show both stages
      expect(html).toContain('Traditional');
      expect(html).toContain('Advanced');
      // Should show achieved badges for completed items
      const achievedMatches = html.match(/Achieved/g);
      expect(achievedMatches).toBeTruthy();
      expect(achievedMatches!.length).toBeGreaterThanOrEqual(2);
    });

    it('should show completion counts in stage headers for V2 items', () => {
      const pillarSummaries: PillarSummary[] = [
        {
          pillar: { id: 1, name: 'Networks' },
          functions: [
            {
              functionCapability: { id: 30, name: 'Segmentation', type: 'Function', pillar_id: 1 },
              assessedItems: 3,
              totalItems: 3,
              assessmentPercentage: 100,
              overallMaturityStage: 'Initial',
              actualMaturityStage: 'Initial',
              maturityStageBreakdown: [
                { stageName: 'Initial', assessedItems: 3, totalItems: 3, completedItems: 2, inProgressItems: 1, notStartedItems: 0, percentage: 100, completionPercentage: 67, status: 'in-progress' }
              ],
              sequentialMaturityExplanation: '',
              hasSequentialMaturityGap: false
            }
          ],
          assessedItems: 3,
          totalItems: 3,
          assessmentPercentage: 100,
          overallMaturityStage: 'Initial',
          actualMaturityStage: 'Initial',
          maturityStageBreakdown: [],
          sequentialMaturityExplanation: '',
          hasSequentialMaturityGap: false
        }
      ];
      const details = new Map<number, DetailedAssessmentItem[]>();
      details.set(30, [
        {
          pillarName: 'Networks',
          functionCapabilityName: 'Segmentation',
          functionCapabilityType: 'Function',
          name: 'VLANs - Initial',
          description: 'VLAN segmentation',
          type: 'Technology',
          maturityStageName: 'Initial',
          status: 'Fully Implemented',
          notes: ''
        },
        {
          pillarName: 'Networks',
          functionCapabilityName: 'Segmentation',
          functionCapabilityType: 'Function',
          name: 'Microsegmentation - Initial',
          description: 'Microsegmentation implementation',
          type: 'Technology',
          maturityStageName: 'Initial',
          status: 'Fully Implemented',
          notes: ''
        },
        {
          pillarName: 'Networks',
          functionCapabilityName: 'Segmentation',
          functionCapabilityType: 'Function',
          name: 'SDN - Initial',
          description: 'Software-defined networking',
          type: 'Technology',
          maturityStageName: 'Initial',
          status: 'Partially Implemented',
          notes: 'In progress'
        }
      ]);
      const html = service.generateHtmlReport(pillarSummaries, details);
      
      // Should show completion counts in badges
      expect(html).toContain('Initial');
      // Check for count indicators
      expect(html).toMatch(/2.*completed/i);
      expect(html).toMatch(/1.*in\s*progress/i);
    });

    it('should handle mixed V1 and V2 items in same report', () => {
      const pillarSummaries: PillarSummary[] = [
        {
          pillar: { id: 1, name: 'Identity' },
          functions: [
            {
              functionCapability: { id: 10, name: 'Authentication', type: 'Function', pillar_id: 1 },
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
          functionCapabilityName: 'Authentication',
          functionCapabilityType: 'Function',
          name: 'Password Policy', // V1 style - no stage in name
          description: 'Strong password requirements',
          type: 'Process',
          maturityStageName: 'Traditional',
          status: 'Fully Implemented',
          notes: ''
        },
        {
          pillarName: 'Identity',
          functionCapabilityName: 'Authentication',
          functionCapabilityType: 'Function',
          name: 'MFA - Initial', // V2 style - has stage in name
          description: 'Multi-factor authentication',
          type: 'Technology',
          maturityStageName: 'Initial',
          status: 'Fully Implemented',
          notes: ''
        }
      ]);
      const html = service.generateHtmlReport(pillarSummaries, details);
      
      // HTML should be generated
      expect(html).toBeTruthy();
      expect(html.length).toBeGreaterThan(0);
      // Both items should be included (testing mixed scenario works)
      expect(html).toContain('Authentication');
    });
  });
});
