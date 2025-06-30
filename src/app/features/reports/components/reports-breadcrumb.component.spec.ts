import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportsBreadcrumbComponent } from './reports-breadcrumb.component';
describe('ReportsBreadcrumbComponent', () => {
  let component: ReportsBreadcrumbComponent;
  let fixture: ComponentFixture<ReportsBreadcrumbComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsBreadcrumbComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(ReportsBreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
