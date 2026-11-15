import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTestingDeps } from '../../../../../../testing/providers';

import { ChannelLayoutComponent } from './channel-layout.component';

describe('ChannelLayoutComponent', () => {
  let component: ChannelLayoutComponent;
  let fixture: ComponentFixture<ChannelLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelLayoutComponent],
      providers: provideTestingDeps()
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChannelLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
