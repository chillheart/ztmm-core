import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display current year', () => {
    const currentYear = new Date().getFullYear();
    expect(component.currentYear).toBe(currentYear);
  });

  it('should render copyright information', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const copyrightText = compiled.querySelector('.copyright');

    expect(copyrightText).toBeTruthy();
    expect(copyrightText?.textContent).toContain('Cameron McCormick');
    expect(copyrightText?.textContent).toContain(component.currentYear.toString());
  });  it('should have GPL v3 license link', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const licenseLink = compiled.querySelector('a[href="https://www.gnu.org/licenses/gpl-3.0.html"]');

    expect(licenseLink).toBeTruthy();
    expect(licenseLink?.textContent?.trim()).toBe('GNU GPL v3 License');
  });

  it('should display privacy notice', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const privacyText = compiled.textContent;

    expect(privacyText).toContain('Your data is stored locally');
  });

  it('should have proper footer styling classes', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const footer = compiled.querySelector('footer');

    expect(footer?.classList.contains('footer')).toBeTruthy();
    expect(footer?.classList.contains('bg-dark')).toBeTruthy();
    expect(footer?.classList.contains('text-light')).toBeTruthy();
  });

  it('should be responsive', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const responsiveColumns = compiled.querySelectorAll('.col-md-6');

    expect(responsiveColumns.length).toBe(2);
  });
});
