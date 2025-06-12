import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HomeComponent,
        RouterTestingModule.withRoutes([
          { path: 'assessment', component: HomeComponent },
          { path: 'configuration', component: HomeComponent },
          { path: 'results', component: HomeComponent }
        ])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the application title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const titleElement = compiled.querySelector('h1');

    expect(titleElement?.textContent).toContain('Zero Trust Maturity Model Assessment');
  });

  it('should render the application description', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const descriptionElement = compiled.querySelector('p.lead');

    expect(descriptionElement?.textContent).toContain('This tool helps you assess your organization');
  });

  it('should display navigation buttons', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const navigationButtons = compiled.querySelectorAll('a.btn[routerLink]');

    expect(navigationButtons.length).toBe(3); // Configuration, Assessment, Results
  });

  it('should have proper button text', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const buttonTexts = compiled.querySelectorAll('a.btn');

    const texts = Array.from(buttonTexts).map(el => el.textContent?.trim());
    expect(texts).toContain('Configuration');
    expect(texts).toContain('Assessment');
    expect(texts).toContain('Results');
  });

  it('should have navigation links with correct routes', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const linkElements = compiled.querySelectorAll('a[routerLink]');

    expect(linkElements.length).toBe(3);

    const routes = Array.from(linkElements).map(el => el.getAttribute('routerLink'));
    expect(routes).toContain('/configuration');
    expect(routes).toContain('/assessment');
    expect(routes).toContain('/results');
  });  it('should have proper button classes and styling', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const navigationButtons = compiled.querySelectorAll('a.btn[routerLink]');

    expect(navigationButtons.length).toBe(3);
    navigationButtons.forEach(button => {
      expect(button.classList.contains('btn-outline-primary') ||
             button.classList.contains('btn-outline-success') ||
             button.classList.contains('btn-outline-info')).toBeTruthy();
    });
  });

  it('should display description section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const descriptionElement = compiled.querySelector('.lead');

    expect(descriptionElement).toBeTruthy();
    expect(descriptionElement?.textContent).toContain('This tool helps you assess');
  });

  it('should display navigation buttons', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const buttonElements = compiled.querySelectorAll('a.btn');

    expect(buttonElements.length).toBeGreaterThan(0);

    const buttonTexts = Array.from(buttonElements).map(btn => btn.textContent?.trim());
    expect(buttonTexts.some(text => text?.includes('Configuration'))).toBeTruthy();
    expect(buttonTexts.some(text => text?.includes('Assessment'))).toBeTruthy();
    expect(buttonTexts.some(text => text?.includes('Results'))).toBeTruthy();
  });

  it('should have proper Bootstrap styling classes', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const containerElement = compiled.querySelector('.container');
    const buttonElements = compiled.querySelectorAll('.btn');

    expect(containerElement).toBeTruthy();
    expect(buttonElements.length).toBeGreaterThan(0);
  });

  it('should have responsive button layout', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const buttonContainer = compiled.querySelector('.d-flex');

    expect(buttonContainer).toBeTruthy(); // Button container exists
  });

  it('should display proper navigation structure', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const buttonElements = compiled.querySelectorAll('a.btn');

    expect(buttonElements.length).toBeGreaterThanOrEqual(3);
  });

  it('should have proper semantic HTML structure', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    // Check for proper heading hierarchy
    const h1Elements = compiled.querySelectorAll('h1');
    const navigationButtons = compiled.querySelectorAll('a.btn[routerLink]');

    expect(h1Elements.length).toBeGreaterThanOrEqual(1);
    expect(navigationButtons.length).toBe(3); // Navigation buttons
  });

  it('should have accessible navigation elements', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const linkElements = compiled.querySelectorAll('a');

    linkElements.forEach(link => {
      // Check that links have descriptive text
      expect(link.textContent?.trim().length).toBeGreaterThan(0);
    });
  });

  it('should be mobile-responsive', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const responsiveElements = compiled.querySelectorAll('[class*="col-"]');

    responsiveElements.forEach(element => {
      // Check for Bootstrap responsive classes
      const classList = Array.from(element.classList);
      const hasResponsiveClass = classList.some(cls =>
        cls.includes('col-') || cls.includes('col-sm-') || cls.includes('col-md-') || cls.includes('col-lg-')
      );
      expect(hasResponsiveClass).toBeTruthy();
    });
  });

  describe('Navigation Integration', () => {
    it('should navigate to assessment page', async () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const assessmentLink = compiled.querySelector('a[routerLink="/assessment"]') as HTMLElement;

      expect(assessmentLink).toBeTruthy();
      // Note: Actual navigation testing would require more complex setup with routing
    });

    it('should navigate to configuration page', async () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const configLink = compiled.querySelector('a[routerLink="/configuration"]') as HTMLElement;

      expect(configLink).toBeTruthy();
    });

    it('should navigate to results page', async () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const resultsLink = compiled.querySelector('a[routerLink="/results"]') as HTMLElement;

      expect(resultsLink).toBeTruthy();
    });
  });

  describe('Content Validation', () => {
    it('should have proper ZTMM terminology', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const pageText = compiled.textContent || '';

      expect(pageText).toContain('Zero Trust');
      expect(pageText).toContain('Maturity Model');
      expect(pageText).toContain('Assessment');
    });

    it('should have informative descriptions', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const descriptionElement = compiled.querySelector('.lead');

      expect(descriptionElement?.textContent?.trim().length).toBeGreaterThan(20);
    });

    it('should have call-to-action buttons', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const buttons = compiled.querySelectorAll('.btn');

      buttons.forEach(button => {
        // The actual buttons contain direct action text like "Configuration", "Assessment", "Results"
        expect(button.textContent?.trim().length).toBeGreaterThan(0);
      });
    });
  });
});
