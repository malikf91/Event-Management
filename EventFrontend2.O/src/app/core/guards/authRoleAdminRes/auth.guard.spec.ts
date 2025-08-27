import { TestBed } from '@angular/core/testing';

import { AuthGuardRoleAdminRes } from './auth.guard';

describe('AuthGuardRoleAdminRes', () => {
  let guard: AuthGuardRoleAdminRes;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AuthGuardRoleAdminRes);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
