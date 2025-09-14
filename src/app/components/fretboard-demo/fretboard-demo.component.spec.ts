import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FretboardDemoComponent } from './fretboard-demo.component';

describe('FretboardDemoComponent', () => {
  let component: FretboardDemoComponent;
  let fixture: ComponentFixture<FretboardDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FretboardDemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FretboardDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
