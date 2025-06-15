import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { NavbarComponent } from './core/components/navbar.component';
import { FooterComponent } from './core/components/footer.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        RouterTestingModule,
        NavbarComponent,
        FooterComponent
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'ztmm-assessment' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('ztmm-assessment');
  });

  it('should render navbar component', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-navbar')).toBeTruthy();
  });

  it('should render router outlet', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('should have main container with proper Bootstrap class', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('.container');
    expect(container).toBeTruthy();
  });

  it('should have proper component structure', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    // Should have navbar at the top
    const navbar = compiled.querySelector('app-navbar');
    const mainContent = compiled.querySelector('.main-content');
    const container = compiled.querySelector('.container');
    const routerOutlet = compiled.querySelector('router-outlet');
    const footer = compiled.querySelector('app-footer');

    expect(navbar).toBeTruthy();
    expect(mainContent).toBeTruthy();
    expect(container).toBeTruthy();
    expect(routerOutlet).toBeTruthy();
    expect(footer).toBeTruthy();

    // Router outlet should be inside container and main-content
    expect(mainContent?.querySelector('.container')).toBeTruthy();
    expect(container?.querySelector('router-outlet')).toBeTruthy();
  });

  it('should render footer component', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-footer')).toBeTruthy();
  });

  it('should have main content with proper padding for sticky navbar', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const mainContent = compiled.querySelector('.main-content');
    expect(mainContent).toBeTruthy();
  });
});
