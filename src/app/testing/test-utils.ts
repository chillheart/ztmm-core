import { ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Pillar, FunctionCapability, MaturityStage, TechnologyProcess, AssessmentResponse } from '../models/ztmm.models';

/**
 * Test utilities for ZTMM Assessment application
 */
export class TestUtils {

  /**
   * Creates mock data for testing
   */
  static createMockData() {
    const mockPillars: Pillar[] = [
      { id: 1, name: 'Identity' },
      { id: 2, name: 'Device' },
      { id: 3, name: 'Network' },
      { id: 4, name: 'Application' },
      { id: 5, name: 'Data' }
    ];

    const mockFunctionCapabilities: FunctionCapability[] = [
      { id: 1, name: 'User Identity Management', type: 'Function', pillar_id: 1 },
      { id: 2, name: 'Multi-factor Authentication', type: 'Capability', pillar_id: 1 },
      { id: 3, name: 'Device Registration', type: 'Function', pillar_id: 2 },
      { id: 4, name: 'Device Compliance', type: 'Capability', pillar_id: 2 },
      { id: 5, name: 'Network Segmentation', type: 'Function', pillar_id: 3 }
    ];

    const mockMaturityStages: MaturityStage[] = [
      { id: 1, name: 'Traditional' },
      { id: 2, name: 'Initial' },
      { id: 3, name: 'Advanced' },
      { id: 4, name: 'Optimal' }
    ];

    const mockTechnologiesProcesses: TechnologyProcess[] = [
      { id: 1, name: 'Azure AD', description: 'Azure Active Directory', type: 'Technology', function_capability_id: 1, maturity_stage_id: 2 },
      { id: 2, name: 'Identity Lifecycle', description: 'Identity Lifecycle Management', type: 'Process', function_capability_id: 1, maturity_stage_id: 3 },
      { id: 3, name: 'MS Authenticator', description: 'Microsoft Authenticator', type: 'Technology', function_capability_id: 2, maturity_stage_id: 2 },
      { id: 4, name: 'Intune', description: 'Microsoft Intune', type: 'Technology', function_capability_id: 3, maturity_stage_id: 3 },
      { id: 5, name: 'Compliance Policies', description: 'Device Compliance Policies', type: 'Process', function_capability_id: 4, maturity_stage_id: 4 }
    ];

    const mockAssessmentResponses: AssessmentResponse[] = [
      { id: 1, tech_process_id: 1, status: 'Fully Implemented', notes: 'Complete implementation with SSO' },
      { id: 2, tech_process_id: 2, status: 'Partially Implemented', notes: 'Automated onboarding in progress' },
      { id: 3, tech_process_id: 3, status: 'Fully Implemented', notes: 'Deployed to all users' },
      { id: 4, tech_process_id: 4, status: 'Not Implemented' },
      { id: 5, tech_process_id: 5, status: 'Fully Implemented', notes: 'Compliance policies active' }
    ];

    return {
      mockPillars,
      mockFunctionCapabilities,
      mockMaturityStages,
      mockTechnologiesProcesses,
      mockAssessmentResponses
    };
  }

  /**
   * Creates a comprehensive mock Electron API
   */
  static createMockElectronApi() {
    const mockData = this.createMockData();

    return {
      getPillars: jasmine.createSpy('getPillars').and.returnValue(Promise.resolve(mockData.mockPillars)),
      addPillar: jasmine.createSpy('addPillar').and.returnValue(Promise.resolve()),
      removePillar: jasmine.createSpy('removePillar').and.returnValue(Promise.resolve()),
      editPillar: jasmine.createSpy('editPillar').and.returnValue(Promise.resolve()),
      savePillarOrder: jasmine.createSpy('savePillarOrder').and.returnValue(Promise.resolve()),

      getFunctionCapabilities: jasmine.createSpy('getFunctionCapabilities').and.returnValue(Promise.resolve(mockData.mockFunctionCapabilities)),
      addFunctionCapability: jasmine.createSpy('addFunctionCapability').and.returnValue(Promise.resolve()),
      removeFunctionCapability: jasmine.createSpy('removeFunctionCapability').and.returnValue(Promise.resolve()),
      editFunctionCapability: jasmine.createSpy('editFunctionCapability').and.returnValue(Promise.resolve()),
      saveFunctionOrder: jasmine.createSpy('saveFunctionOrder').and.returnValue(Promise.resolve()),

      getMaturityStages: jasmine.createSpy('getMaturityStages').and.returnValue(Promise.resolve(mockData.mockMaturityStages)),

      getTechnologiesProcesses: jasmine.createSpy('getTechnologiesProcesses').and.callFake((functionCapabilityId: number) => {
        const filtered = mockData.mockTechnologiesProcesses.filter(tp => tp.function_capability_id === functionCapabilityId);
        return Promise.resolve(filtered);
      }),
      addTechnologyProcess: jasmine.createSpy('addTechnologyProcess').and.returnValue(Promise.resolve()),
      removeTechnologyProcess: jasmine.createSpy('removeTechnologyProcess').and.returnValue(Promise.resolve()),
      editTechnologyProcess: jasmine.createSpy('editTechnologyProcess').and.returnValue(Promise.resolve()),

      saveAssessment: jasmine.createSpy('saveAssessment').and.returnValue(Promise.resolve()),
      getAssessmentResponses: jasmine.createSpy('getAssessmentResponses').and.returnValue(Promise.resolve(mockData.mockAssessmentResponses))
    };
  }

  /**
   * Sets up the global window.api mock
   */
  static setupGlobalApiMock() {
    const mockApi = this.createMockElectronApi();
    (window as any).api = mockApi;
    return mockApi;
  }

  /**
   * Resets all spy calls in the mock API
   */
  static resetApiSpies(mockApi: any) {
    Object.values(mockApi).forEach((spy: any) => {
      if (spy.calls) {
        spy.calls.reset();
      }
    });
  }

  /**
   * Finds element by data-testid attribute
   */
  static getByTestId(fixture: ComponentFixture<any>, testId: string): DebugElement | null {
    return fixture.debugElement.query(By.css(`[data-testid="${testId}"]`));
  }

  /**
   * Finds all elements by data-testid attribute
   */
  static getAllByTestId(fixture: ComponentFixture<any>, testId: string): DebugElement[] {
    return fixture.debugElement.queryAll(By.css(`[data-testid="${testId}"]`));
  }

  /**
   * Finds element by CSS selector
   */
  static getBySelector(fixture: ComponentFixture<any>, selector: string): DebugElement | null {
    return fixture.debugElement.query(By.css(selector));
  }

  /**
   * Finds all elements by CSS selector
   */
  static getAllBySelector(fixture: ComponentFixture<any>, selector: string): DebugElement[] {
    return fixture.debugElement.queryAll(By.css(selector));
  }

  /**
   * Simulates user input on an input element
   */
  static setInputValue(fixture: ComponentFixture<any>, selector: string, value: string) {
    const input = fixture.debugElement.query(By.css(selector));
    if (input) {
      input.nativeElement.value = value;
      input.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    }
  }

  /**
   * Simulates a click event
   */
  static clickElement(fixture: ComponentFixture<any>, selector: string) {
    const element = fixture.debugElement.query(By.css(selector));
    if (element) {
      element.nativeElement.click();
      fixture.detectChanges();
    }
  }

  /**
   * Waits for component to stabilize after async operations
   */
  static async waitForAsync(fixture: ComponentFixture<any>) {
    await fixture.whenStable();
    fixture.detectChanges();
  }

  /**
   * Creates a spy object with common return values
   */
  static createServiceSpy<T>(serviceName: string, methods: (keyof T)[]): jasmine.SpyObj<T> {
    const spy = jasmine.createSpyObj(serviceName, methods);

    // Set default return values for common methods
    if (spy.getPillars) {
      spy.getPillars.and.returnValue(Promise.resolve(this.createMockData().mockPillars));
    }
    if (spy.getFunctionCapabilities) {
      spy.getFunctionCapabilities.and.returnValue(Promise.resolve(this.createMockData().mockFunctionCapabilities));
    }
    if (spy.getMaturityStages) {
      spy.getMaturityStages.and.returnValue(Promise.resolve(this.createMockData().mockMaturityStages));
    }
    if (spy.getTechnologiesProcesses) {
      spy.getTechnologiesProcesses.and.returnValue(Promise.resolve(this.createMockData().mockTechnologiesProcesses));
    }
    if (spy.getAssessmentResponses) {
      spy.getAssessmentResponses.and.returnValue(Promise.resolve(this.createMockData().mockAssessmentResponses));
    }

    return spy;
  }

  /**
   * Validates form field requirements
   */
  static validateFormField(fixture: ComponentFixture<any>, fieldSelector: string, expectedRequired = true) {
    const field = fixture.debugElement.query(By.css(fieldSelector));
    expect(field).toBeTruthy();

    if (expectedRequired) {
      expect(field.nativeElement.hasAttribute('required')).toBeTruthy();
    }
  }

  /**
   * Validates Bootstrap component classes
   */
  static validateBootstrapClasses(fixture: ComponentFixture<any>, selector: string, expectedClasses: string[]) {
    const element = fixture.debugElement.query(By.css(selector));
    expect(element).toBeTruthy();

    expectedClasses.forEach(className => {
      expect(element.nativeElement.classList.contains(className)).toBeTruthy();
    });
  }

  /**
   * Tests component error handling
   */
  static async testErrorHandling(component: any, methodName: string, errorMessage = 'Test error') {
    const originalConsoleError = console.error;
    console.error = jasmine.createSpy('console.error');

    try {
      // Force the method to throw an error
      if (component[methodName]) {
        const originalMethod = component[methodName];
        component[methodName] = jasmine.createSpy(methodName).and.throwError(errorMessage);

        await component[methodName]();

        expect(console.error).toHaveBeenCalled();

        // Restore original method
        component[methodName] = originalMethod;
      }
    } finally {
      console.error = originalConsoleError;
    }
  }

  /**
   * Creates mock DOM event
   */
  static createMockEvent(type: string, eventInit: any = {}): Event {
    return new Event(type, eventInit);
  }

  /**
   * Validates accessibility attributes
   */
  static validateAccessibility(fixture: ComponentFixture<any>, selector: string) {
    const elements = fixture.debugElement.queryAll(By.css(selector));

    if (elements.length === 0) {
      // If no elements found, that's okay - just return
      return;
    }

    // Check the first element for basic accessibility attributes
    const element = elements[0];
    const nativeElement = element.nativeElement;

    if (nativeElement.tagName === 'BUTTON') {
      // Buttons should have text or aria-label
      const hasText = nativeElement.textContent?.trim().length > 0;
      const hasAriaLabel = nativeElement.hasAttribute('aria-label');
      expect(hasText || hasAriaLabel).toBeTruthy();
    }

    if (nativeElement.tagName === 'INPUT') {
      // Inputs should have labels or aria-label
      const hasLabel = document.querySelector(`label[for="${nativeElement.id}"]`) !== null;
      const hasAriaLabel = nativeElement.hasAttribute('aria-label');
      const hasAriaLabelledby = nativeElement.hasAttribute('aria-labelledby');
      expect(hasLabel || hasAriaLabel || hasAriaLabelledby).toBeTruthy();
    }
  }

  /**
   * Tests component loading states
   */
  static testLoadingState(fixture: ComponentFixture<any>, loadingSelector = '.loading') {
    // Component should show loading state initially
    const loadingElement = fixture.debugElement.query(By.css(loadingSelector));
    return loadingElement !== null;
  }

  /**
   * Validates pagination or list functionality
   */
  static validateListFunctionality(fixture: ComponentFixture<any>, listSelector: string, expectedMinItems = 1) {
    const listItems = fixture.debugElement.queryAll(By.css(listSelector));
    expect(listItems.length).toBeGreaterThanOrEqual(expectedMinItems);

    return listItems;
  }


}
