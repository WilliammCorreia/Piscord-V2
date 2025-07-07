import { TestBed } from '@angular/core/testing';

import { Server } from './server';

describe('Server', () => {
  let service: Server;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Server);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
