import { TestBed } from '@angular/core/testing';

import { AuthGuardRoleAdminStore } from './auth.guard';

describe('AuthGuardRoleAdminStore', () => {
  let guard: AuthGuardRoleAdminStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AuthGuardRoleAdminStore);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
