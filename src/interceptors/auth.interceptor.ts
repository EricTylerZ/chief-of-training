import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Auth interceptor for Chief of Training.
 *
 * Uses EZ Merit SSO cookies scoped to .ericzosso.com.
 * Login at ezmerit.ericzosso.com works across all subdomains.
 *
 * For bank/financial institution projects, extend this to:
 * - Inject JWT bearer tokens from a token store
 * - Refresh expired tokens and retry queued requests
 * - Add XSRF tokens for state-changing requests
 * - Log request metadata for compliance audit trails
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const currentPath = window.location.pathname;
        router.navigate(['/login'], {
          queryParams: { redirect: currentPath },
        });
      }
      return throwError(() => error);
    })
  );
};
