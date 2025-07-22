import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrevEntries } from './prev-entries';

describe('PrevEntries', () => {
  let component: PrevEntries;
  let fixture: ComponentFixture<PrevEntries>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrevEntries]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrevEntries);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
