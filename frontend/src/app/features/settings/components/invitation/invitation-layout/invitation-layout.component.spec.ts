import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTestingDeps } from '../../../../../../testing/providers';

import { InvitationLayoutComponent } from './invitation-layout.component';

describe('InvitationLayoutComponent', () => {
  let component: InvitationLayoutComponent;
  let fixture: ComponentFixture<InvitationLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvitationLayoutComponent],
      providers: provideTestingDeps()
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvitationLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
