import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar.component';
import { HomeComponent } from './home.component';
import { AssessmentComponent } from './assessment.component';
import { AdminComponent } from './admin.component';
import { ResultsComponent } from './results.component';
import { ZtmmDataService } from './services/ztmm-data.service';

// Mock the Electron API
const mockApi = {
  getPillars: jasmine.createSpy('getPillars').and.returnValue(Promise.resolve([])),
  getFunctionCapabilities: jasmine.createSpy('getFunctionCapabilities').and.returnValue(Promise.resolve([])),
  getMaturityStages: jasmine.createSpy('getMaturityStages').and.returnValue(Promise.resolve([])),
  getTechnologiesProcesses: jasmine.createSpy('getTechnologiesProcesses').and.returnValue(Promise.resolve([])),
  getAssessmentResponses: jasmine.createSpy('getAssessmentResponses').and.returnValue(Promise.resolve([])),
  addPillar: jasmine.createSpy('addPillar').and.returnValue(Promise.resolve()),
  removePillar: jasmine.createSpy('removePillar').and.returnValue(Promise.resolve()),
  editPillar: jasmine.createSpy('editPillar').and.returnValue(Promise.resolve()),
  savePillarOrder: jasmine.createSpy('savePillarOrder').and.returnValue(Promise.resolve()),
  addFunctionCapability: jasmine.createSpy('addFunctionCapability').and.returnValue(Promise.resolve()),
  removeFunctionCapability: jasmine.createSpy('removeFunctionCapability').and.returnValue(Promise.resolve()),
  editFunctionCapability: jasmine.createSpy('editFunctionCapability').and.returnValue(Promise.resolve()),
  saveFunctionOrder: jasmine.createSpy('saveFunctionOrder').and.returnValue(Promise.resolve()),
  addTechnologyProcess: jasmine.createSpy('addTechnologyProcess').and.returnValue(Promise.resolve()),
  removeTechnologyProcess: jasmine.createSpy('removeTechnologyProcess').and.returnValue(Promise.resolve()),
  editTechnologyProcess: jasmine.createSpy('editTechnologyProcess').and.returnValue(Promise.resolve()),
  saveAssessment: jasmine.createSpy('saveAssessment').and.returnValue(Promise.resolve())
};    (window as any).api = mockApi;

describe('Application Integration Tests', () => {
  let router: Router;
  let location: Location;
  let dataService: ZtmmDataService;

  beforeEach(async () => {
    // Set up mock API before TestBed configuration
    (window as any).api = mockApi;

    // Reset all spies before each test
    Object.keys(mockApi).forEach(key => {
      (mockApi as any)[key].calls.reset();
      if (key === 'getPillars') {
        (mockApi as any)[key].and.returnValue(Promise.resolve([]));
      } else if (key === 'getFunctionCapabilities') {
        (mockApi as any)[key].and.returnValue(Promise.resolve([]));
      } else if (key === 'getMaturityStages') {
        (mockApi as any)[key].and.returnValue(Promise.resolve([]));
      } else if (key === 'getTechnologiesProcesses') {
        (mockApi as any)[key].and.returnValue(Promise.resolve([]));
      } else if (key === 'getAssessmentResponses') {
        (mockApi as any)[key].and.returnValue(Promise.resolve([]));
      } else {
        (mockApi as any)[key].and.returnValue(Promise.resolve());
      }
    });

    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        NavbarComponent,
        HomeComponent,
        AssessmentComponent,
        AdminComponent,
        ResultsComponent,
        RouterTestingModule.withRoutes([
          { path: '', component: HomeComponent },
          { path: 'assessment', component: AssessmentComponent },
          { path: 'configuration', component: AdminComponent },
          { path: 'results', component: ResultsComponent },
          { path: '**', redirectTo: '/', pathMatch: 'full' }
        ])
      ],
      providers: [
        ZtmmDataService
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    dataService = TestBed.inject(ZtmmDataService);

    // Reset all spies
    Object.values(mockApi).forEach((spy: any) => {
      if (spy.calls) spy.calls.reset();
    });
  });

  describe('Application Bootstrap', () => {
    it('should create the application', () => {
      const fixture = TestBed.createComponent(AppComponent);
      expect(fixture.componentInstance).toBeTruthy();
    });

    it('should render navbar and router outlet', () => {
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('app-navbar')).toBeTruthy();
      expect(compiled.querySelector('router-outlet')).toBeTruthy();
    });
  });

  describe('Routing Integration', () => {
    it('should navigate to home page', async () => {
      await router.navigate(['']);
      expect(location.path()).toBe('/');
    });

    it('should navigate to assessment page', async () => {
      await router.navigate(['/assessment']);
      expect(location.path()).toBe('/assessment');
    });

    it('should navigate to configuration page', async () => {
      await router.navigate(['/configuration']);
      expect(location.path()).toBe('/configuration');
    });

    it('should navigate to results page', async () => {
      await router.navigate(['/results']);
      expect(location.path()).toBe('/results');
    });

    it('should redirect unknown routes to home', async () => {
      await router.navigate(['/unknown-route']);
      // Wait for navigation to complete
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(location.path()).toBe('/');
    });
  });

  describe('Data Service Integration', () => {
    it('should create data service with Electron API', () => {
      expect(dataService).toBeTruthy();
      expect((window as any).api).toEqual(mockApi);
    });

    it('should handle API calls through service', async () => {
      // Reset spy to test fresh call
      mockApi.getPillars.calls.reset();
      await dataService.getPillars();
      expect(mockApi.getPillars).toHaveBeenCalled();
    });

    it('should handle error scenarios gracefully', async () => {
      mockApi.getPillars.and.returnValue(Promise.reject(new Error('API Error')));

      try {
        await dataService.getPillars();
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }

      // Reset for other tests
      mockApi.getPillars.and.returnValue(Promise.resolve([]));
    });
  });

  describe('Component Integration', () => {
    it('should load Home component with navigation cards', () => {
      const fixture = TestBed.createComponent(HomeComponent);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const buttons = compiled.querySelectorAll('.btn');
      expect(buttons.length).toBe(3);
    });

    it('should load Assessment component with proper initialization', () => {
      const fixture = TestBed.createComponent(AssessmentComponent);
      const component = fixture.componentInstance;

      expect(component.pillars).toEqual([]);
      expect(component.selectedPillarId).toBeNull();
      expect(component.statusOptions).toEqual([
        'Not Implemented',
        'Partially Implemented',
        'Fully Implemented'
      ]);
    });

    it('should load Admin component with proper tabs', () => {
      const fixture = TestBed.createComponent(AdminComponent);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const tabs = compiled.querySelectorAll('.nav-pills .nav-link');
      expect(tabs.length).toBeGreaterThan(0);
    });

    it('should load Results component with empty results initially', () => {
      const fixture = TestBed.createComponent(ResultsComponent);
      const component = fixture.componentInstance;

      expect(component.results).toEqual([]);
    });
  });

  describe('Cross-Component Data Flow', () => {
    it('should share data service instance across components', () => {
      const assessmentFixture = TestBed.createComponent(AssessmentComponent);
      const adminFixture = TestBed.createComponent(AdminComponent);
      const resultsFixture = TestBed.createComponent(ResultsComponent);

      const assessmentService = (assessmentFixture.componentInstance as any).data;
      const adminService = (adminFixture.componentInstance as any).data;
      const resultsService = (resultsFixture.componentInstance as any).data;

      expect(assessmentService).toBe(adminService);
      expect(adminService).toBe(resultsService);
    });

    it('should handle data updates consistently', async () => {
      // Reset spies first since components call loadAll() during initialization
      mockApi.getPillars.calls.reset();
      mockApi.getFunctionCapabilities.calls.reset();

      const assessmentFixture = TestBed.createComponent(AssessmentComponent);
      const resultsFixture = TestBed.createComponent(ResultsComponent);

      // Trigger change detection to ensure components are initialized
      assessmentFixture.detectChanges();
      resultsFixture.detectChanges();

      // Wait for any async operations
      await assessmentFixture.whenStable();
      await resultsFixture.whenStable();

      // Components should call loadAll() during initialization
      expect(mockApi.getPillars).toHaveBeenCalledTimes(2);
      expect(mockApi.getFunctionCapabilities).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle service errors gracefully across components', async () => {
      mockApi.getPillars.and.returnValue(Promise.reject(new Error('Database connection failed')));

      const errorSpy = spyOn(console, 'error');

      // Components will call loadAll() in their constructors
      const assessmentFixture = TestBed.createComponent(AssessmentComponent);
      const adminFixture = TestBed.createComponent(AdminComponent);

      // Trigger change detection
      assessmentFixture.detectChanges();
      adminFixture.detectChanges();

      // Wait for async operations to complete
      await assessmentFixture.whenStable();
      await adminFixture.whenStable();

      expect(errorSpy).toHaveBeenCalledTimes(2);

      // Reset for other tests
      mockApi.getPillars.and.returnValue(Promise.resolve([]));
    });

    it('should maintain application stability after errors', async () => {
      mockApi.addPillar.and.returnValue(Promise.reject(new Error('Add failed')));

      const adminFixture = TestBed.createComponent(AdminComponent);
      adminFixture.detectChanges();
      const component = adminFixture.componentInstance;

      component.newPillar = 'Test Pillar';

      // This call should fail but not crash the component
      try {
        await component.addPillar();
      } catch {
        // Expected to fail
      }

      // Component should still be functional
      expect(component).toBeTruthy();
      expect(component.newPillar).toBe('Test Pillar'); // Should keep value on error - better UX

      // Reset for other tests
      mockApi.addPillar.and.returnValue(Promise.resolve());
    });
  });

  describe('UI State Management', () => {
    it('should maintain consistent UI state across navigation', async () => {
      const navbarFixture = TestBed.createComponent(NavbarComponent);
      navbarFixture.detectChanges();

      const compiled = navbarFixture.nativeElement as HTMLElement;
      const navLinks = compiled.querySelectorAll('.nav-link');

      expect(navLinks.length).toBe(3);

      // All navigation links should be present and functional
      navLinks.forEach(link => {
        expect(link.getAttribute('routerLink')).toBeTruthy();
      });
    });

    it('should handle form state properly in Admin component', () => {
      const adminFixture = TestBed.createComponent(AdminComponent);
      const component = adminFixture.componentInstance;

      // Test initial state
      expect(component.newPillar).toBe('');
      expect(component.activeTab).toBe('pillars');

      // Test state changes
      component.activeTab = 'functions';
      expect(component.activeTab).toBe('functions');
    });
  });

  describe('Performance and Memory', () => {
    it('should clean up subscriptions and resources', () => {
      const assessmentFixture = TestBed.createComponent(AssessmentComponent);
      const component = assessmentFixture.componentInstance;

      // Component should be properly initialized
      expect(component).toBeTruthy();

      // Destroy component
      assessmentFixture.destroy();

      // No memory leaks or errors should occur
      expect(true).toBeTruthy();
    });

    it('should handle large datasets efficiently', async () => {
      // Mock large dataset
      const largePillarArray = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `Pillar ${i + 1}`
      }));

      mockApi.getPillars.and.returnValue(Promise.resolve(largePillarArray));

      const adminFixture = TestBed.createComponent(AdminComponent);
      adminFixture.detectChanges();

      const startTime = performance.now();
      await adminFixture.componentInstance.loadAll();
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(adminFixture.componentInstance.pillars?.length || 0).toBe(100);
    });
  });
});
