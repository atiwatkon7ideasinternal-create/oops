import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, Role } from './auth.service';

export const requireLogin: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  router.navigateByUrl('/login');
  return false;
};

export function requireRole(...roles: Role[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const role = auth.role();
    if (role && roles.includes(role)) return true;
    router.navigateByUrl('/login');
    return false;
  };
}
