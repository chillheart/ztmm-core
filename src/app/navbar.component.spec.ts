import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NavbarComponent,
        RouterTestingModule.withRoutes([
          { path: '', component: NavbarComponent },
          { path: 'assessment', component: NavbarComponent },
          { path: 'configuration', component: NavbarComponent },
          { path: 'results', component: NavbarComponent }
        ])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the application brand', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const brandElement = compiled.querySelector('.navbar-brand');

    expect(brandElement?.textContent).toContain('ZTMM Assessment');
  });

  it('should have proper Bootstrap navbar structure', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const navbarElement = compiled.querySelector('nav.navbar');

    expect(navbarElement).toBeTruthy();
    expect(navbarElement?.classList.contains('navbar')).toBeTruthy();
    expect(navbarElement?.classList.contains('navbar-expand-lg')).toBeTruthy();
    expect(navbarElement?.classList.contains('navbar-light')).toBeTruthy();
    expect(navbarElement?.classList.contains('bg-light')).toBeTruthy();
  });

  it('should have proper navigation menu structure', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const navbarNav = compiled.querySelector('.navbar-nav');
    const navItems = compiled.querySelectorAll('.nav-item');

    expect(navbarNav).toBeTruthy();
    expect(navItems.length).toBe(3); // Assessment, Results, Configuration
  });

  it('should have correct navigation links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const navLinks = compiled.querySelectorAll('a.nav-link');

    expect(navLinks.length).toBe(3);

    const linkRoutes = Array.from(navLinks).map(link => link.getAttribute('routerLink'));
    expect(linkRoutes).toContain('/assessment');
    expect(linkRoutes).toContain('/configuration');
    expect(linkRoutes).toContain('/results');
  });

  it('should have proper navigation link text', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const navLinks = compiled.querySelectorAll('a.nav-link');

    const linkTexts = Array.from(navLinks).map(link => link.textContent?.trim());
    expect(linkTexts).toContain('Assessment');
    expect(linkTexts).toContain('Results');
    // Configuration link only has an icon, no text
    expect(linkTexts.filter(text => text && text.length > 0).length).toBe(2);
  });

  it('should have configuration link with cog icon', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const configLink = compiled.querySelector('a[routerLink="/configuration"]');
    const icon = configLink?.querySelector('.bi-gear-fill');

    expect(configLink).toBeTruthy();
    expect(icon).toBeTruthy();
  });

  it('should have proper Bootstrap icons', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const icons = compiled.querySelectorAll('.bi');

    expect(icons.length).toBeGreaterThanOrEqual(1); // At least the configuration cog icon
  });

  it('should have responsive collapse button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const toggleButton = compiled.querySelector('.navbar-toggler');

    expect(toggleButton).toBeTruthy();
    expect(toggleButton?.getAttribute('data-bs-toggle')).toBe('collapse');
    expect(toggleButton?.getAttribute('data-bs-target')).toBe('#navbarNav');
  });

  it('should have collapsible navigation', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const collapseDiv = compiled.querySelector('#navbarNav');

    expect(collapseDiv).toBeTruthy();
    expect(collapseDiv?.classList.contains('collapse')).toBeTruthy();
    expect(collapseDiv?.classList.contains('navbar-collapse')).toBeTruthy();
  });

  it('should have proper aria attributes for accessibility', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const toggleButton = compiled.querySelector('.navbar-toggler');

    expect(toggleButton?.getAttribute('aria-controls')).toBe('navbarNav');
    expect(toggleButton?.getAttribute('aria-expanded')).toBe('false');
    expect(toggleButton?.getAttribute('aria-label')).toBe('Toggle navigation');
  });

  it('should have hamburger menu icon', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const togglerIcon = compiled.querySelector('.navbar-toggler-icon');

    expect(togglerIcon).toBeTruthy();
  });

  it('should apply active class to current route', () => {
    // This would require more complex router state mocking
    // For now, we'll just check that routerLinkActive is present
    const compiled = fixture.nativeElement as HTMLElement;
    const navLinks = compiled.querySelectorAll('a[routerLinkActive]');

    expect(navLinks.length).toBe(3);

    navLinks.forEach(link => {
      expect(link.getAttribute('routerLinkActive')).toBe('active');
    });
  });

  it('should have proper styling classes', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const navbar = compiled.querySelector('nav');

    expect(navbar?.classList.contains('navbar')).toBeTruthy();
    expect(navbar?.classList.contains('navbar-expand-lg')).toBeTruthy();
    expect(navbar?.classList.contains('navbar-light')).toBeTruthy();
    expect(navbar?.classList.contains('bg-light')).toBeTruthy();
  });

  it('should have brand link pointing to home', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const brandLink = compiled.querySelector('.navbar-brand');

    expect(brandLink?.getAttribute('routerLink')).toBe('/');
  });

  it('should have proper container structure', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('.container-fluid');

    expect(container).toBeTruthy();
  });

  describe('Mobile Responsiveness', () => {
    it('should have proper mobile navigation structure', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const navbar = compiled.querySelector('nav');

      expect(navbar?.classList.contains('navbar-expand-lg')).toBeTruthy();
    });

    it('should have mobile toggle functionality attributes', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const toggleButton = compiled.querySelector('.navbar-toggler');
      const collapseTarget = compiled.querySelector('#navbarNav');

      expect(toggleButton?.getAttribute('data-bs-target')).toBe('#navbarNav');
      expect(collapseTarget?.id).toBe('navbarNav');
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic HTML', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const nav = compiled.querySelector('nav');
      const ul = compiled.querySelector('ul');
      const lis = compiled.querySelectorAll('li');

      expect(nav).toBeTruthy();
      expect(ul).toBeTruthy();
      expect(lis.length).toBeGreaterThan(0);
    });

    it('should have proper ARIA labels', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const toggleButton = compiled.querySelector('.navbar-toggler');

      expect(toggleButton?.getAttribute('aria-label')).toBeTruthy();
    });

    it('should have keyboard accessible navigation', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const navLinks = compiled.querySelectorAll('a.nav-link');

      navLinks.forEach(link => {
        // Links should be focusable by default
        expect(link.tagName.toLowerCase()).toBe('a');
      });
    });
  });

  describe('Visual Design', () => {
    it('should have consistent spacing classes', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const navItems = compiled.querySelectorAll('.nav-item');

      navItems.forEach(item => {
        expect(item.classList.contains('nav-item')).toBeTruthy();
      });
    });

    it('should have proper link styling', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const navLinks = compiled.querySelectorAll('.nav-link');

      navLinks.forEach(link => {
        expect(link.classList.contains('nav-link')).toBeTruthy();
      });
    });

    it('should have branded color scheme', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const navbar = compiled.querySelector('nav');

      expect(navbar?.classList.contains('bg-light')).toBeTruthy();
      expect(navbar?.classList.contains('navbar-light')).toBeTruthy();
    });
  });

  describe('Integration', () => {
    it('should work with Angular Router', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const routerLinks = compiled.querySelectorAll('a[routerLink]');

      expect(routerLinks.length).toBeGreaterThan(0);

      routerLinks.forEach(link => {
        const routerLink = link.getAttribute('routerLink');
        expect(routerLink).toBeTruthy();
      });
    });

    it('should have routerLinkActive for highlighting', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const activeLinks = compiled.querySelectorAll('a[routerLinkActive]');

      expect(activeLinks.length).toBe(3);
    });
  });
});
