import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { PillarOverviewComponent } from './pillar-overview.component';
describe('PillarOverviewComponent', () => {
  let component: PillarOverviewComponent;
  let fixture: ComponentFixture<PillarOverviewComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PillarOverviewComponent],
      providers: [
        { provide: ActivatedRoute, useValue: {} }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(PillarOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
