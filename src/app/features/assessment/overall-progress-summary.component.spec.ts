import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverallProgressSummaryComponent } from './overall-progress-summary.component';
describe('OverallProgressSummaryComponent', () => {
  let component: OverallProgressSummaryComponent;
  let fixture: ComponentFixture<OverallProgressSummaryComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverallProgressSummaryComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(OverallProgressSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
