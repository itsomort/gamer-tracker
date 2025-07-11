import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dating } from './dating';

describe('Dating', () => {
  let component: Dating;
  let fixture: ComponentFixture<Dating>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dating]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dating);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
