import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTestingDeps } from '../../../../../testing/providers';

import { HomeLayoutComponent } from './home-layout.component';

describe('HomeLayout', () => {
  let component: HomeLayoutComponent;
  let fixture: ComponentFixture<HomeLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeLayoutComponent],
      providers: provideTestingDeps()
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
