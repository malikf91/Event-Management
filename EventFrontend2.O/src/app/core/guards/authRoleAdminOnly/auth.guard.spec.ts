import { TestBed } from '@angular/core/testing';

import { AuthGuardRoleAdmin } from './auth.guard';

describe('AuthGuardRoleAdmin', () => {
  let guard: AuthGuardRoleAdmin;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AuthGuardRoleAdmin);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
