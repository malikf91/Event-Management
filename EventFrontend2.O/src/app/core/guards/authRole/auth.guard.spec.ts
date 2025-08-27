import { TestBed } from '@angular/core/testing';

import { AuthGuardRole } from './auth.guard';

describe('AuthGuardRole', () => {
  let guard: AuthGuardRole;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AuthGuardRole);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
