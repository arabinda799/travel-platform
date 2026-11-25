import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, BehaviorSubject, catchError, filter, switchMap, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

function addAuthHeaders(
  req: HttpRequest<any>,
  token: string | null,
  tenantId?: string,
): HttpRequest<any> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (tenantId) headers['x-tenant-id'] = tenantId;
  return Object.keys(headers).length > 0 ? req.clone({ setHeaders: headers }) : req;
}

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn,
): Observable<HttpEvent<any>> => {
  const auth = inject(AuthService);
  const token = auth.token();
  const tenantId = auth.currentUser()?.tenantId;

  // Exclude auth endpoints from 401 interception and stale Bearer headers
  const isAuthEndpoint =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/refresh-token') ||
    req.url.includes('/auth/forgot-password') ||
    req.url.includes('/auth/reset-password');

  // Clone with current credentials (skip Authorization header on auth endpoints)
  const authReq = isAuthEndpoint
    ? (tenantId ? req.clone({ setHeaders: { 'x-tenant-id': tenantId } }) : req)
    : addAuthHeaders(req, token, tenantId);

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && !isAuthEndpoint) {
        return handle401Error(auth, req, next, tenantId);
      }
      return throwError(() => error);
    }),
  );
};

function handle401Error(
  auth: AuthService,
  req: HttpRequest<any>,
  next: HttpHandlerFn,
  tenantId?: string,
): Observable<HttpEvent<any>> {
  if (!auth.refreshToken()) {
    auth.logout();
    return throwError(() => new Error('Session expired. Please log in again.'));
  }

  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return auth.refreshSession().pipe(
      switchMap((newToken: string) => {
        isRefreshing = false;
        refreshTokenSubject.next(newToken);
        return next(addAuthHeaders(req, newToken, tenantId));
      }),
      catchError(refreshErr => {
        isRefreshing = false;
        refreshTokenSubject.next(null);
        auth.logout();
        return throwError(() => refreshErr);
      }),
    );
  } else {
    // If refresh is already in progress, wait until the new token is emitted
    return refreshTokenSubject.pipe(
      filter((newToken): newToken is string => newToken !== null),
      take(1),
      switchMap((newToken: string) => {
        return next(addAuthHeaders(req, newToken, tenantId));
      }),
    );
  }
}
