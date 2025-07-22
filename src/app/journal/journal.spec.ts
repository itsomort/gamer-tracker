import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Journal } from './journal';

describe('Journal', () => {
  let component: Journal;
  let fixture: ComponentFixture<Journal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Journal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Journal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not submit if journalEntry is empty and should show error', () => {
    spyOn(window, 'alert');
    component.journalEntry = '';
    component.username = 'testuser';
    component.onSubmit(new Event('click'), true);
    expect(window.alert).toHaveBeenCalledWith('Please enter a journal entry before submitting.');
  });

  it('should submit if journalEntry is not empty', () => {
    spyOn(component.http, 'post').and.returnValue(of({}));
    component.journalEntry = 'Test entry';
    component.username = 'testuser';
    component.onSubmit(new Event('click'), true);
    expect(component.http.post).toHaveBeenCalled();
  });
});
