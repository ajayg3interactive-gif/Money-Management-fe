import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const API_ORIGIN = 'http://localhost:3000';
const AUTH_FLOW_ENDPOINTS = ['/api/auth/login', '/api/auth/register', '/api/auth/me'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(API_ORIGIN)) {
    return next(req);
  }

  const authService = inject(AuthService);
  const authedReq = req.clone({ withCredentials: true });

  return next(authedReq).pipe(
    catchError((err: unknown) => {
      const isAuthFlowRequest = AUTH_FLOW_ENDPOINTS.some(path => req.url.endsWith(path));
      if (err instanceof HttpErrorResponse && err.status === 401 && !isAuthFlowRequest) {
        authService.handleUnauthorized();
      }
      return throwError(() => err);
    })
  );
};
