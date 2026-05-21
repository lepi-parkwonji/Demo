import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ACCESS_TOKEN_KEY } from './auth.constants';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (authService.user()) return true;

  if (isPlatformBrowser(platformId)) {
    const hasToken = !!localStorage.getItem(ACCESS_TOKEN_KEY);
    if (hasToken) {
      const success = await authService.fetch();
      if (success) return true;
    }
  }

  return router.createUrlTree(['/customer-service/inquiry'], {
    queryParams: { login: '1' },
  });
};
