import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTestingDeps } from '../../../../../testing/providers';

import { AuthLayoutComponent } from './auth-layout.component';

describe('AuthLayout', () => {
  let component: AuthLayoutComponent;
  let fixture: ComponentFixture<AuthLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthLayoutComponent],
      providers: provideTestingDeps()
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
