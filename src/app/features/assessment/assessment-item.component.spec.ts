import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssessmentItemComponent } from './assessment-item.component';
describe('AssessmentItemComponent', () => {
  let component: AssessmentItemComponent;
  let fixture: ComponentFixture<AssessmentItemComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentItemComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(AssessmentItemComponent);
    component = fixture.componentInstance;
    // Provide required @Input()s to avoid undefined errors
    component.technologyProcess = { name: 'Test Tech', id: 1 } as any;
    component.itemNumber = 1;
    component.status = 'Not Implemented';
    component.statusOptions = ['Not Implemented', 'Partially Implemented', 'Fully Implemented', 'Superseded'] as any;
    component.functionCapabilities = [];
    component.maturityStages = [];
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
