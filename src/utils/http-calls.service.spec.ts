import { TestBed } from '@angular/core/testing';

import { HttpCallsService } from './http-calls.service';

describe('HttpCallsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HttpCallsService = TestBed.get(HttpCallsService);
    expect(service).toBeTruthy();
  });
});
