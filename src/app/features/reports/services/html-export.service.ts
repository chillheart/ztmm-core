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
            width: 80px;
            height: 80px;
            border: 3px solid #667eea;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.5rem;
        }

        .cover-logo i {
            font-size: 2rem;
            color: #667eea;
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
            <i class="bi bi-shield-check-fill"></i>
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
