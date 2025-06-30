import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';
describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should emit pageChange on onPageClick', () => {
    spyOn(component.pageChange, 'emit');
    component.onPageClick(3);
    expect(component.pageChange.emit).toHaveBeenCalledWith(3);
  });
  it('should emit previousPage on onPreviousClick', () => {
    spyOn(component.previousPage, 'emit');
    component.onPreviousClick();
    expect(component.previousPage.emit).toHaveBeenCalled();
  });
  it('should emit nextPage on onNextClick', () => {
    spyOn(component.nextPage, 'emit');
    component.onNextClick();
    expect(component.nextPage.emit).toHaveBeenCalled();
  });
  it('should emit saveCurrentPage on onSaveClick', () => {
    spyOn(component.saveCurrentPage, 'emit');
    component.onSaveClick();
    expect(component.saveCurrentPage.emit).toHaveBeenCalled();
  });
  it('should return correct page numbers when totalPages <= 5', () => {
    component.totalPages = 3;
    component.currentPage = 2;
    expect(component.getPageNumbers()).toEqual([1, 2, 3]);
  });
  it('should return correct page numbers when totalPages > 5', () => {
    component.totalPages = 10;
    component.currentPage = 6;
    expect(component.getPageNumbers()).toEqual([4, 5, 6, 7, 8]);
  });
  it('should return correct stage display name', () => {
    component.availableStages = ['A', 'B', 'C'];
    expect(component.getStageDisplayName(2)).toBe('B');
    expect(component.getStageDisplayName(4)).toBe('4');
  });
  it('should return correct stage color class', () => {
    expect(component.getStageColorClass('Traditional')).toBe('btn-secondary');
    expect(component.getStageColorClass('Initial')).toBe('btn-warning');
    expect(component.getStageColorClass('Advanced')).toBe('btn-info');
    expect(component.getStageColorClass('Optimal')).toBe('btn-success');
    expect(component.getStageColorClass('Other')).toBe('btn-outline-primary');
  });
  it('should return correct start and end item', () => {
    component.currentPage = 2;
    component.itemsPerPage = 10;
    component.totalItems = 25;
    expect(component.getStartItem()).toBe(11);
    expect(component.getEndItem()).toBe(20);
    component.currentPage = 3;
    expect(component.getEndItem()).toBe(25);
  });
});
