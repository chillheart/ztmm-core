import { Injectable } from '@angular/core';
import { PillarSummary, FunctionSummary, DetailedAssessmentItem } from '../models/report.models';
import { MaturityCalculationService } from './maturity-calculation.service';

@Injectable({
  providedIn: 'root'
})
export class HtmlExportService {

  constructor(private maturityCalc: MaturityCalculationService) {}

  generateHtmlReport(
    pillarSummaries: PillarSummary[],
    allFunctionDetails: Map<number, DetailedAssessmentItem[]>
  ): string {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zero Trust Maturity Assessment Report</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <style>
        ${this.getCssStyles()}
    </style>
</head>
<body>
    ${this.generateCoverPage()}
    ${this.generatePillarOverview(pillarSummaries)}
    ${pillarSummaries.map(pillar => this.generatePillarSection(pillar, allFunctionDetails)).join('')}
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

    return html;
  }

  private getCssStyles(): string {
    return `
        @page {
            size: A4;
            margin: 0.75in;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.4;
            color: #333;
            font-size: 12px;
        }

        .cover-page {
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            page-break-after: always;
        }

        .cover-logo {
            width: 80px;
            height: 80px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.5rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .cover-logo i {
            font-size: 2rem;
            color: #667eea;
        }

        .cover-title {
            font-size: 2.5rem;
            font-weight: 300;
            margin-bottom: 0.5rem;
        }

        .cover-subtitle {
            font-size: 1.1rem;
            opacity: 0.9;
            margin-bottom: 2rem;
        }

        .cover-date {
            font-size: 1rem;
            opacity: 0.8;
        }

        .section-page {
            page-break-before: always;
            margin: 2rem 1rem;
        }

        .section-header {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            border-left: 4px solid #007bff;
        }

        .alert {
            padding: 0.75rem;
            margin-bottom: 1rem;
            border: 1px solid transparent;
            border-radius: 0.375rem;
        }

        .alert-warning {
            color: #856404;
            background-color: #fff3cd;
            border-color: #ffeaa7;
        }

        .card {
            border: 1px solid #dee2e6;
            border-radius: 0.375rem;
            margin-bottom: 1rem;
            page-break-inside: avoid;
        }

        .card-header {
            padding: 0.75rem;
            background-color: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
        }

        .card-body {
            padding: 0.75rem;
        }

        .table {
            font-size: 0.9rem;
            margin-bottom: 0;
        }

        .table th,
        .table td {
            padding: 0.5rem;
            vertical-align: top;
            border-top: 1px solid #dee2e6;
        }

        .badge {
            font-size: 0.75rem;
            padding: 0.25rem 0.5rem;
        }

        .text-primary { color: #007bff !important; }
        .text-warning { color: #ffc107 !important; }
        .text-muted { color: #6c757d !important; }
        .bg-warning { background-color: #ffc107 !important; }
        .bg-primary { background-color: #007bff !important; }
        .bg-success { background-color: #28a745 !important; }
        .bg-danger { background-color: #dc3545 !important; }
        .bg-secondary { background-color: #6c757d !important; }
        .bg-info { background-color: #17a2b8 !important; }
        .text-white { color: #fff !important; }
        .text-dark { color: #212529 !important; }

        @media print {
            body { font-size: 10px; }
            .section-page { page-break-before: always; }
            .card { page-break-inside: avoid; }
        }
    `;
  }

  private generateCoverPage(): string {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
    <div class="cover-page">
        <div class="cover-logo">
            <i class="bi bi-shield-check-fill"></i>
        </div>
        <h1 class="cover-title">Zero Trust Maturity Assessment</h1>
        <p class="cover-subtitle">Comprehensive Security Posture Report</p>
        <p class="cover-date">Generated on ${currentDate}</p>
    </div>`;
  }

  private generatePillarOverview(pillarSummaries: PillarSummary[]): string {
    const pillarCards = pillarSummaries.map(pillar => `
        <div class="col-md-6 col-lg-4 mb-3">
            <div class="card h-100">
                <div class="card-header">
                    <h5 class="mb-1"><i class="bi bi-diagram-3-fill text-primary me-2"></i>${pillar.pillar.name}</h5>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="badge ${this.maturityCalc.getMaturityStageColor(pillar.overallMaturityStage)} text-white">
                            ${pillar.overallMaturityStage}
                        </span>
                        ${pillar.hasSequentialMaturityGap ? `
                        <span class="badge bg-warning text-dark">Potential: ${pillar.actualMaturityStage}</span>
                        ` : ''}
                    </div>
                </div>
                <div class="card-body">
                    <div class="text-center">
                        <div>Functions: ${pillar.functions.length}</div>
                        <div>Assessment: ${pillar.assessmentPercentage}%</div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    return `
    <div class="section-page">
        <div class="section-header">
            <h1><i class="bi bi-diagram-3-fill me-3"></i>Pillar Overview</h1>
        </div>
        <div class="row">
            ${pillarCards}
        </div>
    </div>`;
  }

  private generatePillarSection(pillarSummary: PillarSummary, allFunctionDetails: Map<number, DetailedAssessmentItem[]>): string {
    const functionSections = pillarSummary.functions.map(func =>
      this.generateFunctionSection(func, allFunctionDetails.get(func.functionCapability.id) || [])
    ).join('');

    return `
    <div class="section-page">
        <div class="section-header">
            <h1><i class="bi bi-diagram-3-fill text-primary me-3"></i>${pillarSummary.pillar.name}</h1>
            <div class="d-flex gap-3 align-items-center mt-2">
                <span class="badge ${this.maturityCalc.getMaturityStageColor(pillarSummary.overallMaturityStage)} text-white">
                    Current: ${pillarSummary.overallMaturityStage}
                </span>
                ${pillarSummary.hasSequentialMaturityGap ? `
                <span class="badge bg-warning text-dark">
                    Potential: ${pillarSummary.actualMaturityStage}
                </span>
                ` : ''}
            </div>
        </div>

        ${pillarSummary.hasSequentialMaturityGap ? `
        <div class="alert alert-warning d-flex align-items-start mb-3">
            <i class="bi bi-exclamation-triangle-fill me-2 mt-1"></i>
            <div>
                <h6 class="alert-heading mb-2">Sequential Maturity Requirement</h6>
                <p class="mb-1">${pillarSummary.sequentialMaturityExplanation}</p>
                <small><strong>Note:</strong> Zero Trust maturity requires completing all technologies and processes from previous stages before advancing.</small>
            </div>
        </div>
        ` : ''}

        ${functionSections}
    </div>`;
  }

  private generateFunctionSection(functionSummary: FunctionSummary, functionDetails: DetailedAssessmentItem[]): string {
    const tables = functionSummary.maturityStageBreakdown.map(breakdown =>
      this.generateStageTable(breakdown, functionDetails)
    ).join('');

    return `
    <div class="mb-4">
        <div class="card">
            <div class="card-header">
                <h4 class="mb-1"><i class="bi bi-gear-fill text-primary me-2"></i>${functionSummary.functionCapability.name}</h4>
                <div class="d-flex gap-3 align-items-center">
                    <span class="badge ${functionSummary.functionCapability.type === 'Function' ? 'bg-primary' : 'bg-info'}">
                        ${functionSummary.functionCapability.type}
                    </span>
                    <span class="badge ${this.maturityCalc.getMaturityStageColor(functionSummary.overallMaturityStage)} text-white">
                        Current: ${functionSummary.overallMaturityStage}
                    </span>
                    ${functionSummary.hasSequentialMaturityGap ? `
                    <span class="badge bg-warning text-dark">Potential: ${functionSummary.actualMaturityStage}</span>
                    ` : ''}
                </div>
            </div>

            ${functionSummary.hasSequentialMaturityGap ? `
            <div class="alert alert-warning d-flex align-items-start m-3" style="margin-bottom: 0.5rem !important;">
                <i class="bi bi-exclamation-triangle-fill me-2 mt-1"></i>
                <div>
                    <h6 class="alert-heading mb-2">Sequential Maturity Requirement</h6>
                    <p class="mb-1">${functionSummary.sequentialMaturityExplanation}</p>
                    <small><strong>Note:</strong> Complete all previous stage requirements before advancing.</small>
                </div>
            </div>
            ` : ''}
        </div>

        ${tables}
    </div>`;
  }

  private generateStageTable(breakdown: any, functionDetails: DetailedAssessmentItem[]): string {
    const stageItems = functionDetails.filter(item => item.maturityStageName === breakdown.stageName);

    const rows = stageItems.length > 0 ? stageItems.map(item => `
        <tr>
            <td>
                <div class="fw-bold">${item.name}</div>
                <div class="text-muted small">${item.description}</div>
            </td>
            <td class="text-center">
                <span class="badge ${item.type === 'Technology' ? 'bg-info' : 'bg-secondary'}">${item.type}</span>
            </td>
            <td class="text-center">
                <span class="badge ${this.maturityCalc.getAssessmentStatusClass(item.status)}">${item.status}</span>
            </td>
            <td><small class="text-muted">${item.notes || 'No notes'}</small></td>
        </tr>
    `).join('') : `
        <tr>
            <td colspan="4" class="text-center text-muted py-3">
                <i class="bi bi-info-circle me-2"></i>No technologies defined for this stage
            </td>
        </tr>
    `;

    return `
    <div class="card mb-3">
        <div class="card-header">
            <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                    <i class="bi ${this.maturityCalc.getStatusIcon(breakdown.status)} me-2"></i>
                    ${breakdown.stageName} Stage
                </h5>
                <span class="badge ${this.maturityCalc.getStatusClass(breakdown.status)}">
                    ${breakdown.completionPercentage}% Complete
                </span>
            </div>
            ${!breakdown.canAdvanceToThisStage && breakdown.blockedByPreviousStages?.length > 0 ? `
            <div class="mt-2 p-2 border border-warning rounded bg-light">
                <div class="d-flex align-items-start">
                    <i class="bi bi-lock-fill text-warning me-2 mt-1"></i>
                    <div>
                        <div class="small text-warning fw-bold">Blocked by Prerequisites</div>
                        <div class="small text-muted">Complete ${breakdown.blockedByPreviousStages.join(', ')} stage first</div>
                    </div>
                </div>
            </div>
            ` : ''}
        </div>
        <div class="card-body p-0">
            <table class="table table-hover mb-0">
                <thead class="table-light">
                    <tr>
                        <th>Technology/Process</th>
                        <th class="text-center">Type</th>
                        <th class="text-center">Status</th>
                        <th>Notes</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    </div>`;
  }

  downloadHtmlReport(htmlContent: string, filename = 'zero-trust-assessment-report.html'): void {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
