import { TestBed } from '@angular/core/testing';

import { Channel } from './channel';

describe('Channel', () => {
  let service: Channel;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Channel);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
