import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { PillarSummaryComponent } from './pillar-summary.component';
describe('PillarSummaryComponent', () => {
  let component: PillarSummaryComponent;
  let fixture: ComponentFixture<PillarSummaryComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PillarSummaryComponent],
      providers: [
        { provide: ActivatedRoute, useValue: {} }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(PillarSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
