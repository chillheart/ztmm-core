import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PillarDetailComponent } from './pillar-detail.component';
describe('PillarDetailComponent', () => {
  let component: PillarDetailComponent;
  let fixture: ComponentFixture<PillarDetailComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PillarDetailComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(PillarDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
