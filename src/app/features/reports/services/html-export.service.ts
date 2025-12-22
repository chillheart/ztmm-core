import { Injectable } from '@angular/core';
import { PillarSummary, FunctionSummary, DetailedAssessmentItem, MaturityStageBreakdown } from '../models/report.models';
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
            border: 3px solid #667eea;
            color: #333;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            page-break-after: always;
        }

        .cover-logo {
          width: 128px;
          height: 128px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .cover-logo img {
          width: 128px;
          height: 128px;
          object-fit: contain;
        }

        .cover-title {
            font-size: 2.5rem;
            font-weight: 300;
            margin-bottom: 0.5rem;
            color: #333;
        }

        .cover-subtitle {
            font-size: 1.1rem;
            color: #666;
            margin-bottom: 2rem;
        }

        .cover-date {
            font-size: 1rem;
            color: #666;
        }

        .section-page {
            page-break-before: always;
            margin: 2rem 1rem;
        }

        .section-header {
            border: 2px solid #007bff;
            border-left: 6px solid #007bff;
            padding: 1rem;
            border-radius: 4px;
            margin-bottom: 1rem;
        }

        .alert {
            padding: 0.75rem;
            margin-bottom: 1rem;
            border: 1px solid transparent;
            border-radius: 0.375rem;
            page-break-inside: avoid;
        }

        .alert-warning {
            color: #856404;
            border: 2px solid #ffc107;
            background-color: transparent;
        }

        .card {
            border: 1px solid #dee2e6;
            border-radius: 0.375rem;
            margin-bottom: 1rem;
            page-break-inside: auto;
        }

        .card-header {
            padding: 0.75rem;
            border-bottom: 2px solid #dee2e6;
            page-break-inside: avoid;
            page-break-after: avoid;
        }

        .card-body {
            padding: 0.75rem;
        }

        .table {
            font-size: 0.9rem;
            margin-bottom: 0;
            page-break-inside: auto;
        }

        .table th,
        .table td {
            padding: 0.5rem;
            vertical-align: top;
            border-top: 1px solid #dee2e6;
        }

        .table thead {
            page-break-inside: avoid;
            page-break-after: avoid;
        }

        .table tbody tr {
            page-break-inside: avoid;
            page-break-after: auto;
        }

        .badge {
            font-size: 0.75rem;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-weight: 600;
        }

        /* Print-friendly badge styles with borders instead of backgrounds */
        .badge-outline-primary {
            color: #007bff;
            border: 1px solid #007bff;
            background-color: transparent;
        }
        .badge-outline-success {
            color: #28a745;
            border: 1px solid #28a745;
            background-color: transparent;
        }
        .badge-outline-warning {
            color: #ffc107;
            border: 1px solid #ffc107;
            background-color: transparent;
        }
        .badge-outline-danger {
            color: #dc3545;
            border: 1px solid #dc3545;
            background-color: transparent;
        }
        .badge-outline-info {
            color: #17a2b8;
            border: 1px solid #17a2b8;
            background-color: transparent;
        }
        .badge-outline-secondary {
            color: #6c757d;
            border: 1px solid #6c757d;
            background-color: transparent;
        }

        .text-primary { color: #007bff !important; }
        .text-success { color: #28a745 !important; }
        .text-warning { color: #ffc107 !important; }
        .text-danger { color: #dc3545 !important; }
        .text-info { color: #17a2b8 !important; }
        .text-secondary { color: #6c757d !important; }
        .text-muted { color: #6c757d !important; }
        .text-dark { color: #212529 !important; }

        @media print {
            body {
                font-size: 10px;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                color-adjust: exact;
            }
            .section-page {
                page-break-before: always;
            }
            .card {
                page-break-inside: auto;
            }
            .card-header {
                page-break-inside: avoid;
                page-break-after: avoid;
            }
            .table {
                page-break-inside: auto;
            }
            .table thead {
                page-break-inside: avoid;
                page-break-after: avoid;
            }
            .table tbody tr {
                page-break-inside: avoid;
                page-break-after: auto;
            }
            .alert {
                page-break-inside: avoid;
            }
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
            <img src="data:image/png;base64,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" alt="Zero Trust Logo" />
        </div>
        <h1 class="cover-title">Zero Trust Maturity Assessment</h1>
        <p class="cover-subtitle">Comprehensive Security Posture Report</p>
        <p class="cover-date">Generated on ${currentDate}</p>
    </div>`;
  }

  private generatePillarOverview(pillarSummaries: PillarSummary[]): string {
    const pillarSections = pillarSummaries.map(pillar => {
      const functionRows = pillar.functions.map(func => `
        <tr>
          <td>${func.functionCapability.name}</td>
          <td class="text-center">
            <span class="badge ${func.functionCapability.type === 'Function' ? 'badge-outline-primary' : 'badge-outline-info'}">
              ${func.functionCapability.type}
            </span>
          </td>
          <td class="text-center">
            <strong class="${this.maturityCalc.getMaturityStageTextColor(func.overallMaturityStage)}">
              ${func.overallMaturityStage}
            </strong>
          </td>
        </tr>
      `).join('');

      return `
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-1">
              <i class="bi bi-diagram-3-fill text-primary me-2"></i>${pillar.pillar.name}
            </h5>
            <div>
              <strong class="${this.maturityCalc.getMaturityStageTextColor(pillar.overallMaturityStage)}">
                Overall Maturity: ${pillar.overallMaturityStage}
              </strong>
              ${pillar.hasSequentialMaturityGap ? `
                <span class="badge badge-outline-warning ms-2">Potential: ${pillar.actualMaturityStage}</span>
              ` : ''}
            </div>
          </div>
          <div class="card-body p-0">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Function/Capability</th>
                  <th class="text-center">Type</th>
                  <th class="text-center">Current Maturity</th>
                </tr>
              </thead>
              <tbody>
                ${functionRows}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }).join('');

    return `
    <div class="section-page">
        <div class="section-header">
            <h1><i class="bi bi-diagram-3-fill me-3"></i>Pillar Overview</h1>
            <p class="mb-0 mt-2">Summary of all Zero Trust pillars, functions, and their current maturity levels</p>
        </div>
        ${pillarSections}
    </div>`;
  }

  private generatePillarSection(pillarSummary: PillarSummary, allFunctionDetails: Map<number, DetailedAssessmentItem[]>): string {
    // Generate the pillar header page with function summary
    const functionRows = pillarSummary.functions.map(func => `
      <tr>
        <td>${func.functionCapability.name}</td>
        <td class="text-center">
          <span class="badge ${func.functionCapability.type === 'Function' ? 'badge-outline-primary' : 'badge-outline-info'}">
            ${func.functionCapability.type}
          </span>
        </td>
        <td class="text-center">
          <strong class="${this.maturityCalc.getMaturityStageTextColor(func.overallMaturityStage)}">
            ${func.overallMaturityStage}
          </strong>
        </td>
      </tr>
    `).join('');

    const pillarHeaderPage = `
    <div class="section-page">
        <div class="section-header">
            <h1><i class="bi bi-diagram-3-fill text-primary me-3"></i>${pillarSummary.pillar.name}</h1>
            <div class="d-flex gap-3 align-items-center mt-2">
                <strong class="${this.maturityCalc.getMaturityStageTextColor(pillarSummary.overallMaturityStage)}">
                    Current Maturity: ${pillarSummary.overallMaturityStage}
                </strong>
                ${pillarSummary.hasSequentialMaturityGap ? `
                <span class="badge badge-outline-warning">
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

        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Functions & Capabilities</h5>
          </div>
          <div class="card-body p-0">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Function/Capability</th>
                  <th class="text-center">Type</th>
                  <th class="text-center">Current Maturity</th>
                </tr>
              </thead>
              <tbody>
                ${functionRows}
              </tbody>
            </table>
          </div>
        </div>
    </div>`;

    // Generate detailed sections for each function
    const functionSections = pillarSummary.functions.map(func =>
      this.generateFunctionSection(func, allFunctionDetails.get(func.functionCapability.id) || [])
    ).join('');

    return pillarHeaderPage + functionSections;
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
                    <span class="badge ${functionSummary.functionCapability.type === 'Function' ? 'badge-outline-primary' : 'badge-outline-info'}">
                        ${functionSummary.functionCapability.type}
                    </span>
                    <strong class="${this.maturityCalc.getMaturityStageTextColor(functionSummary.overallMaturityStage)}">
                        Current: ${functionSummary.overallMaturityStage}
                    </strong>
                    ${functionSummary.hasSequentialMaturityGap ? `
                    <span class="badge badge-outline-warning">Potential: ${functionSummary.actualMaturityStage}</span>
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

  private generateStageTable(breakdown: MaturityStageBreakdown, functionDetails: DetailedAssessmentItem[]): string {
    const stageItems = functionDetails.filter(item => item.maturityStageName === breakdown.stageName);

    const rows = stageItems.length > 0 ? stageItems.map(item => {
      // Enhanced V2 detection: check if the item name contains stage info (V2 format)
      const isV2Format = item.name.includes(' - ') &&
        (item.name.includes('Traditional') || item.name.includes('Initial') ||
         item.name.includes('Advanced') || item.name.includes('Optimal'));

      // For V2, extract the base name (before the " - Stage" part)
      const displayName = isV2Format ? item.name.split(' - ')[0] : item.name;

      // Get status text color
      const getStatusColor = (status: string): string => {
        switch (status) {
          case 'Fully Implemented': return 'text-success';
          case 'Partially Implemented': return 'text-warning';
          case 'Not Implemented': return 'text-danger';
          case 'Not Assessed': return 'text-secondary';
          case 'Superseded': return 'text-info';
          default: return 'text-secondary';
        }
      };

      return `
        <tr>
            <td>
                <div class="fw-bold">${displayName}</div>
                <div class="text-muted small">${item.description}</div>
            </td>
            <td class="text-center">
                <span class="badge ${item.type === 'Technology' ? 'badge-outline-info' : 'badge-outline-secondary'}">${item.type}</span>
            </td>
            <td class="text-center">
                <strong class="${getStatusColor(item.status)}">${item.status}</strong>
            </td>
            <td><small class="text-muted">${item.notes || 'No notes'}</small></td>
        </tr>
    `;
    }).join('') : `
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
                <div class="d-flex gap-2 align-items-center">
                    <span class="badge badge-outline-${this.maturityCalc.getStatusColorName(breakdown.status)}">
                        ${breakdown.completionPercentage}% Complete
                    </span>
                    ${breakdown.completedItems > 0 ? `
                    <span class="badge badge-outline-success" title="Items fully implemented at this stage">
                        <i class="bi bi-check-circle-fill me-1"></i>${breakdown.completedItems} Completed
                    </span>
                    ` : ''}
                    ${breakdown.inProgressItems > 0 ? `
                    <span class="badge badge-outline-warning" title="Items partially implemented">
                        <i class="bi bi-hourglass-split me-1"></i>${breakdown.inProgressItems} In Progress
                    </span>
                    ` : ''}
                </div>
            </div>
            ${breakdown.status === 'completed' && !breakdown.canAdvanceToThisStage && breakdown.blockedByPreviousStages && breakdown.blockedByPreviousStages.length > 0 ? `
            <div class="mt-2 p-2 border border-warning rounded bg-light">
                <div class="d-flex align-items-start">
                    <i class="bi bi-lock-fill text-warning me-2 mt-1"></i>
                    <div>
                        <div class="small text-warning fw-bold">Blocked by Prerequisites</div>
                        <div class="small text-muted">Complete ${breakdown.blockedByPreviousStages?.join(', ') || ''} stage first</div>
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
