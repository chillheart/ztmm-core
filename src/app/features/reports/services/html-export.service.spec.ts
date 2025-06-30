import { TestBed } from '@angular/core/testing';
import { HtmlExportService } from './html-export.service';
import { PillarSummary, FunctionSummary, DetailedAssessmentItem } from '../models/report.models';
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
});
