import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataManagementTabComponent } from './data-management-tab.component';
describe('DataManagementTabComponent', () => {
  let component: DataManagementTabComponent;
  let fixture: ComponentFixture<DataManagementTabComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataManagementTabComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(DataManagementTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
