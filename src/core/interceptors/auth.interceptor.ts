import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const API_ORIGIN = 'http://localhost:3000';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(API_ORIGIN)) {
    return next(req);
  }

  const authService = inject(AuthService);
  const authedReq = req.clone({ withCredentials: true });

  return next(authedReq).pipe(
    catchError((err: unknown) => {
      const isAuthCheck = req.url.endsWith('/api/auth/me');
      if (err instanceof HttpErrorResponse && err.status === 401 && !isAuthCheck) {
        authService.handleUnauthorized();
      }
      return throwError(() => err);
    })
  );
};
