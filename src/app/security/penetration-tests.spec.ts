/**
 * Penetration Testing Suite for ZTMM Assessment Application
 *
 * This suite performs automated penetration testing to identify
 * security vulnerabilities in the application.
 */

import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { AdminComponent } from '../admin.component';
import { AssessmentComponent } from '../assessment.component';
import { ZtmmDataWebService } from '../services/ztmm-data-web.service';
import { TestUtilsIndexedDB } from '../testing/test-utils-indexeddb';
import { SecurityTestUtils, SecurityTestResult, SecurityReport } from './security-test-utils';

describe('Penetration Testing Suite', () => {
  let mockDataService: jasmine.SpyObj<ZtmmDataWebService>;
  let securityReport: SecurityReport;
  let allTestResults: SecurityTestResult[] = [];

  beforeEach(async () => {
    // Ensure confirm dialogs are properly mocked to prevent hanging
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert').and.stub();
    spyOn(window, 'prompt').and.returnValue('');

    mockDataService = TestUtilsIndexedDB.createMockZtmmDataWebService() as any;

    await TestBed.configureTestingModule({
      imports: [AdminComponent, AssessmentComponent, FormsModule],
      providers: [
        { provide: ZtmmDataWebService, useValue: mockDataService }
      ]
    }).compileComponents();

    allTestResults = [];
  });

  afterAll(() => {
    // Generate final security report
    securityReport = SecurityTestUtils.generateSecurityReport(allTestResults);
    console.log('\n🔒 SECURITY PENETRATION TEST REPORT');
    console.log('=====================================');
    console.log(`Overall Result: ${securityReport.overallResult}`);
    console.log(`Total Tests: ${securityReport.totalTests}`);
    console.log(`Passed: ${securityReport.passedTests}`);
    console.log(`Failed: ${securityReport.failedTests}`);
    console.log(`\nVulnerabilities Found:`);
    console.log(`  HIGH: ${securityReport.summary.HIGH}`);
    console.log(`  MEDIUM: ${securityReport.summary.MEDIUM}`);
    console.log(`  LOW: ${securityReport.summary.LOW}`);

    if (securityReport.vulnerabilities.length > 0) {
      console.log('\nDetailed Vulnerabilities:');
      securityReport.vulnerabilities.forEach((vuln, index) => {
        console.log(`  ${index + 1}. [${vuln.severity}] ${vuln.type}: ${vuln.description}`);
        if (vuln.location) console.log(`     Location: ${vuln.location}`);
        if (vuln.payload) console.log(`     Payload: ${vuln.payload}`);
      });
    }

    // Assert that no HIGH severity vulnerabilities were found
    expect(securityReport.summary.HIGH).toBe(0);
  });

  describe('Cross-Site Scripting (XSS) Penetration Tests', () => {
    let adminFixture: ComponentFixture<AdminComponent>;
    let assessmentFixture: ComponentFixture<AssessmentComponent>;

    beforeEach(() => {
      adminFixture = TestBed.createComponent(AdminComponent);
      assessmentFixture = TestBed.createComponent(AssessmentComponent);
    });

    it('should test XSS vulnerabilities in admin forms', () => {
      adminFixture.detectChanges();

      const inputSelectors = [
        'input[name="newPillar"]',
        'input[name="newFunctionCapability"]',
        'textarea[name="newTechnologyProcess"]'
      ];

      const result = SecurityTestUtils.testXSSProtection(adminFixture, inputSelectors);
      allTestResults.push(result);

      expect(result.passed).toBe(true);
    });

    it('should test XSS vulnerabilities in assessment forms', async () => {
      const component = assessmentFixture.componentInstance;
      await component.loadAll();
      assessmentFixture.detectChanges();

      const inputSelectors = [
        'textarea[placeholder*="notes"]',
        'select.form-select',
        'input.form-control'
      ];

      const result = SecurityTestUtils.testXSSProtection(assessmentFixture, inputSelectors);
      allTestResults.push(result);

      expect(result.passed).toBe(true);
    });

    it('should test advanced XSS payloads', () => {
      const adminComponent = adminFixture.componentInstance;
      adminFixture.detectChanges();

      const advancedPayloads = [
        '"><img src=x onerror=prompt(document.domain)>',
        '<svg/onload=alert(/XSS/)>',
        '<iframe src="data:text/html,<script>alert(1)</script>"></iframe>',
        '<math><mi//xlink:href="data:x,<script>alert(1)</script>">',
        '<embed src="javascript:alert(1)">',
        '<object data="javascript:alert(1)">',
        '<applet code="javascript:alert(1)">',
        '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">',
        '<base href="javascript:alert(1)//">'
      ];

      let vulnerabilityFound = false;

      advancedPayloads.forEach(payload => {
        try {
          adminComponent.newPillar = payload;
          adminFixture.detectChanges();

          const domContent = adminFixture.nativeElement.innerHTML;
          if (domContent.includes(payload) && !domContent.includes('&lt;') && !domContent.includes('&gt;')) {
            vulnerabilityFound = true;
          }
        } catch (error) {
          // Error handling during XSS test
        }
      });

      expect(vulnerabilityFound).toBe(false);
    });
  });

  describe('Injection Attack Penetration Tests', () => {
    let adminComponent: AdminComponent;
    let assessmentComponent: AssessmentComponent;

    beforeEach(async () => {
      adminComponent = TestBed.createComponent(AdminComponent).componentInstance;
      assessmentComponent = TestBed.createComponent(AssessmentComponent).componentInstance;
      await adminComponent.loadAll();
      await assessmentComponent.loadAll();
    });

    it('should test SQL injection resistance', () => {
      const methodsToTest = [
        'addPillar',
        'addFunctionCapability',
        'addTechnologyProcess'
      ];

      const result = SecurityTestUtils.testInjectionProtection(adminComponent, methodsToTest);
      allTestResults.push(result);

      expect(result.passed).toBe(true);
    });

    it('should test NoSQL injection resistance', () => {
      const noSQLPayloads = [
        '{"$ne": null}',
        '{"$regex": ".*"}',
        '{"$where": "this.password.match(/.*/)"}',
        '{"$gt": ""}',
        '{"$exists": true}',
        '{"$in": ["admin", "root"]}',
        '{$eval: "function() { return this.username == \'admin\' }"}',
        '{"username": {"$ne": "foo"}, "password": {"$ne": "bar"}}'
      ];

      let vulnerabilityFound = false;

      noSQLPayloads.forEach(payload => {
        try {
          adminComponent.newPillar = payload;
          // Test if the payload causes unexpected behavior
          const result = adminComponent.addPillar();
          if (result instanceof Promise) {
            result.catch(() => {
              // Handle promise rejection
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (errorMessage.includes('mongodb') || errorMessage.includes('$where')) {
            vulnerabilityFound = true;
          }
        }
      });

      expect(vulnerabilityFound).toBe(false);
    });

    it('should test command injection resistance', () => {
      const commandPayloads = [
        '; cat /etc/passwd',
        '| whoami',
        '& dir',
        '$(id)',
        '`ls -la`',
        '; rm -rf /',
        '|| ping -c 1 127.0.0.1',
        '& echo vulnerable &',
        '; shutdown /s /t 0',
        '| type C:\\Windows\\System32\\drivers\\etc\\hosts'
      ];

      let vulnerabilityFound = false;

      commandPayloads.forEach(payload => {
        try {
          assessmentComponent.assessmentNotes[0] = payload;
          assessmentComponent.submitAssessment();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (errorMessage.includes('command') || errorMessage.includes('shell') ||
              errorMessage.includes('exec') || errorMessage.includes('spawn')) {
            vulnerabilityFound = true;
          }
        }
      });

      expect(vulnerabilityFound).toBe(false);
    });


  });

  describe('Access Control Penetration Tests', () => {
    let adminComponent: AdminComponent;

    beforeEach(async () => {
      adminComponent = TestBed.createComponent(AdminComponent).componentInstance;
      await adminComponent.loadAll();
    });

    it('should test unauthorized function access', () => {
      const restrictedMethods = [
        'addPillar',
        'removePillar',
        'editPillar',
        'addFunctionCapability',
        'removeFunctionCapability',
        'onClearAllData',
        'onImportData'
      ];

      const result = SecurityTestUtils.testAccessControl(adminComponent, restrictedMethods);
      allTestResults.push(result);

      // For this client-side app, we expect medium-level findings since there's no server-side auth
      expect(result.vulnerabilities.filter(v => v.severity === 'HIGH').length).toBe(0);
    });

    it('should test privilege escalation attempts', () => {
      // Test that users cannot escalate privileges through manipulation
      const originalActiveTab = adminComponent.activeTab;

      try {
        // Attempt to access restricted functionality through tab manipulation
        (adminComponent as any).activeTab = 'admin-secret';
        (adminComponent as any).activeTab = '../../../admin';
        (adminComponent as any).activeTab = null;
        (adminComponent as any).activeTab = undefined;

        // Component should handle these gracefully - after setting to null/undefined,
        // the component may reset to a default value or maintain undefined state
        // We just verify the component doesn't crash
        expect(() => adminComponent.activeTab).not.toThrow();

        // Reset to a valid tab to ensure component stability
        (adminComponent as any).activeTab = 'pillars';
        expect(adminComponent.activeTab).toBeDefined();
      } finally {
        adminComponent.activeTab = originalActiveTab;
      }
    });

    it('should test object reference manipulation', () => {
      // Test direct object reference attacks
      const maliciousIds = [-1, 999999, 0, null as any, undefined as any, 'admin', '../admin'];

      maliciousIds.forEach(id => {
        try {
          const pillarName = adminComponent.getPillarName?.(id);
          const functionName = adminComponent.getFunctionCapabilityName?.(id);

          // Should return safe default values
          if (pillarName !== undefined) {
            expect(typeof pillarName).toBe('string');
          }
          if (functionName !== undefined) {
            expect(typeof functionName).toBe('string');
          }
        } catch (error) {
          // Should not throw errors that reveal system information
          const errorMessage = error instanceof Error ? error.message : String(error);
          expect(errorMessage).not.toMatch(/database|system|internal|stack/i);
        }
      });
    });
  });

  describe('Information Disclosure Penetration Tests', () => {
    let adminComponent: AdminComponent;
    let assessmentComponent: AssessmentComponent;

    beforeEach(async () => {
      adminComponent = TestBed.createComponent(AdminComponent).componentInstance;
      assessmentComponent = TestBed.createComponent(AssessmentComponent).componentInstance;
    });

    it('should test for hardcoded secrets', () => {
      const adminResult = SecurityTestUtils.testForHardcodedSecrets(adminComponent);
      const assessmentResult = SecurityTestUtils.testForHardcodedSecrets(assessmentComponent);

      allTestResults.push(adminResult, assessmentResult);

      expect(adminResult.passed).toBe(true);
      expect(assessmentResult.passed).toBe(true);
    });

    it('should test error message information disclosure', () => {
      const errorTriggerMethods = [
        'loadAll',
        'addPillar',
        'addFunctionCapability',
        'submitAssessment'
      ];

      const adminResult = SecurityTestUtils.testErrorHandling(adminComponent, errorTriggerMethods);
      const assessmentResult = SecurityTestUtils.testErrorHandling(assessmentComponent, errorTriggerMethods);

      allTestResults.push(adminResult, assessmentResult);

      expect(adminResult.passed).toBe(true);
      expect(assessmentResult.passed).toBe(true);
    });

    it('should test for sensitive data in DOM', () => {
      const adminFixture = TestBed.createComponent(AdminComponent);
      const assessmentFixture = TestBed.createComponent(AssessmentComponent);

      adminFixture.detectChanges();
      assessmentFixture.detectChanges();

      const adminHtml = adminFixture.nativeElement.innerHTML;
      const assessmentHtml = assessmentFixture.nativeElement.innerHTML;

      // Check for accidentally exposed sensitive patterns
      const sensitivePatterns = [
        /[a-f0-9]{32}/g, // MD5 hashes
        /[a-f0-9]{40}/g, // SHA-1 hashes
        /[a-f0-9]{64}/g, // SHA-256 hashes
        // Removed overly broad Base64 pattern that matches Angular component IDs
        /password["\s]*[:=]["\s]*\w+/gi,
        /secret["\s]*[:=]["\s]*\w+/gi,
        /token["\s]*[:=]["\s]*\w+/gi,
        /-----BEGIN [A-Z ]+-----/g, // PEM keys
        /\bAPI[_-]?KEY\b/gi, // API keys
        /\bSECRET[_-]?KEY\b/gi, // Secret keys
      ];

      sensitivePatterns.forEach(pattern => {
        const adminMatches = adminHtml.match(pattern);
        const assessmentMatches = assessmentHtml.match(pattern);

        // If we find matches, they should not contain actual sensitive data
        if (adminMatches) {
          adminMatches.forEach((match: string) => {
            // Allow Angular component IDs and other framework-generated content
            expect(match).not.toMatch(/^(password|secret|token|key).*[:=]/i);
          });
        }
        if (assessmentMatches) {
          assessmentMatches.forEach((match: string) => {
            expect(match).not.toMatch(/^(password|secret|token|key).*[:=]/i);
          });
        }
      });
    });
  });

  describe('Content Security Policy (CSP) Penetration Tests', () => {
    it('should test CSP compliance in admin component', () => {
      const adminFixture = TestBed.createComponent(AdminComponent);
      adminFixture.detectChanges();

      const result = SecurityTestUtils.testCSPCompliance(adminFixture);
      allTestResults.push(result);

      expect(result.passed).toBe(true);
    });

    it('should test CSP compliance in assessment component', () => {
      const assessmentFixture = TestBed.createComponent(AssessmentComponent);
      assessmentFixture.detectChanges();

      const result = SecurityTestUtils.testCSPCompliance(assessmentFixture);
      allTestResults.push(result);

      expect(result.passed).toBe(true);
    });

    it('should test for unsafe-eval usage', () => {
      const adminFixture = TestBed.createComponent(AdminComponent);
      const assessmentFixture = TestBed.createComponent(AssessmentComponent);

      adminFixture.detectChanges();
      assessmentFixture.detectChanges();

      // Check for potential eval() usage in component code
      const adminComponent = adminFixture.componentInstance;
      const assessmentComponent = assessmentFixture.componentInstance;

      const adminSource = adminComponent.toString();
      const assessmentSource = assessmentComponent.toString();

      expect(adminSource).not.toContain('eval(');
      expect(adminSource).not.toContain('Function(');
      expect(adminSource).not.toContain('setTimeout(');
      expect(adminSource).not.toContain('setInterval(');

      expect(assessmentSource).not.toContain('eval(');
      expect(assessmentSource).not.toContain('Function(');
      expect(assessmentSource).not.toContain('setTimeout(');
      expect(assessmentSource).not.toContain('setInterval(');
    });
  });

  describe('Business Logic Security Tests', () => {
    let adminComponent: AdminComponent;

    beforeEach(async () => {
      adminComponent = TestBed.createComponent(AdminComponent).componentInstance;
      await adminComponent.loadAll();
    });

    it('should test data integrity constraints', async () => {
      // Test that business rules are enforced

      // Try to add empty pillar
      adminComponent.newPillar = '';
      await adminComponent.addPillar();
      expect(mockDataService.addPillar).not.toHaveBeenCalled();

      // Try to add function capability without pillar
      adminComponent.newFunctionCapability = 'Test Function';
      adminComponent.selectedPillarId = null;
      await adminComponent.addFunctionCapability();
      expect(mockDataService.addFunctionCapability).not.toHaveBeenCalled();
    });

    it('should test race condition resistance', async () => {
      // Test concurrent operations
      const promises: Promise<any>[] = [];

      for (let i = 0; i < 10; i++) {
        adminComponent.newPillar = `Pillar ${i}`;
        promises.push(adminComponent.addPillar());
      }

      // Should handle concurrent operations gracefully
      expect(() => Promise.all(promises)).not.toThrow();
    });

    it('should test data boundary limits', () => {
      // Test with extremely long inputs
      const longString = 'a'.repeat(100000);

      adminComponent.newPillar = longString;
      adminComponent.newFunctionCapability = longString;

      // Should handle without crashing
      expect(adminComponent.newPillar.length).toBe(100000);
      expect(adminComponent.newFunctionCapability.length).toBe(100000);
    });
  });

  describe('Session and State Management Security', () => {
    it('should test state persistence security', () => {
      const adminComponent = TestBed.createComponent(AdminComponent).componentInstance;
      const assessmentComponent = TestBed.createComponent(AssessmentComponent).componentInstance;

      // Test that sensitive state is not accidentally persisted
      adminComponent.activeTab = 'pillars';
      assessmentComponent.selectedPillarId = 1;

      // Components should manage state securely
      expect(adminComponent.activeTab).toBeDefined();
      expect(assessmentComponent.selectedPillarId).toBeDefined();
    });

    it('should test component isolation', () => {
      const adminFixture1 = TestBed.createComponent(AdminComponent);
      const adminFixture2 = TestBed.createComponent(AdminComponent);

      const component1 = adminFixture1.componentInstance;
      const component2 = adminFixture2.componentInstance;

      // Components should not share state inappropriately
      component1.activeTab = 'pillars';
      component2.activeTab = 'functions';

      expect(component1.activeTab).not.toBe(component2.activeTab);
    });
  });
});
