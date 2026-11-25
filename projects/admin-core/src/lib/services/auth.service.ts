import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, throwError, map } from 'rxjs';
import { getCookie, setCookie, deleteCookie } from '../utils/cookie.util';
import { API_BASE_URL } from './api.service';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'platform_admin' | 'tenant_admin' | 'operator';
  avatar?: string;
  tenantId?: string;
  refreshToken?: string;
}

const AUTH_COOKIE_USER = 'easyflys_auth_user';
const AUTH_COOKIE_TOKEN = 'easyflys_auth_token';
const AUTH_COOKIE_REFRESH = 'easyflys_auth_refresh';

// Legacy keys for seamless migration from localStorage/sessionStorage to secure cookies
const LEGACY_STORAGE_USER = 'easyflys_auth_user';
const LEGACY_STORAGE_TOKEN = 'easyflys_auth_token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = inject(API_BASE_URL);

  private readonly currentUserSignal = signal<AuthUser | null>(this.loadUser());
  private readonly tokenSignal = signal<string | null>(this.loadToken());
  private readonly refreshTokenSignal = signal<string | null>(this.loadRefreshToken());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly token = this.tokenSignal.asReadonly();
  readonly refreshToken = this.refreshTokenSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly userRole = computed(() => this.currentUserSignal()?.role ?? null);

  private loadUser(): AuthUser | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      // 1. Check secure cookie first
      const cookieData = getCookie(AUTH_COOKIE_USER);
      if (cookieData) {
        return JSON.parse(cookieData);
      }

      // 2. Fallback to localStorage/sessionStorage and migrate to cookies
      const legacyData =
        sessionStorage.getItem(LEGACY_STORAGE_USER) || localStorage.getItem(LEGACY_STORAGE_USER);
      if (legacyData) {
        const parsed = JSON.parse(legacyData);
        setCookie(AUTH_COOKIE_USER, legacyData, { days: 30 });
        sessionStorage.removeItem(LEGACY_STORAGE_USER);
        localStorage.removeItem(LEGACY_STORAGE_USER);
        return parsed;
      }
    } catch {
      // ignore
    }
    return null;
  }

  private loadToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      // 1. Check secure cookie first
      const cookieToken = getCookie(AUTH_COOKIE_TOKEN);
      if (cookieToken) return cookieToken;

      // 2. Migration fallback
      const legacyToken =
        sessionStorage.getItem(LEGACY_STORAGE_TOKEN) ?? localStorage.getItem(LEGACY_STORAGE_TOKEN);
      if (legacyToken) {
        setCookie(AUTH_COOKIE_TOKEN, legacyToken, { days: 30 });
        sessionStorage.removeItem(LEGACY_STORAGE_TOKEN);
        localStorage.removeItem(LEGACY_STORAGE_TOKEN);
        return legacyToken;
      }
    } catch {
      // ignore
    }
    return null;
  }

  private loadRefreshToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const cookieRefresh = getCookie(AUTH_COOKIE_REFRESH);
      if (cookieRefresh) return cookieRefresh;

      const user = this.loadUser();
      if (user?.refreshToken) {
        setCookie(AUTH_COOKIE_REFRESH, user.refreshToken, { days: 30 });
        return user.refreshToken;
      }
    } catch {
      // ignore
    }
    return null;
  }

  login(
    user: AuthUser,
    token: string | null = null,
    remember = false,
    refreshToken?: string,
  ): void {
    const rfToken = refreshToken || user.refreshToken || null;
    if (rfToken && !user.refreshToken) {
      user.refreshToken = rfToken;
    }

    this.currentUserSignal.set(user);
    this.tokenSignal.set(token);
    this.refreshTokenSignal.set(rfToken);

    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const days = remember ? 30 : 1;
      const userStr = JSON.stringify(user);

      // Save into secure cookies (SameSite=Strict, Secure)
      setCookie(AUTH_COOKIE_USER, userStr, { days });
      if (token) setCookie(AUTH_COOKIE_TOKEN, token, { days });
      if (rfToken) setCookie(AUTH_COOKIE_REFRESH, rfToken, { days: 30 });

      // Clean up legacy localStorage/sessionStorage keys
      [localStorage, sessionStorage].forEach(s => {
        try {
          s.removeItem(LEGACY_STORAGE_USER);
          s.removeItem(LEGACY_STORAGE_TOKEN);
        } catch {
          // ignore
        }
      });
    } catch {
      // ignore
    }
  }

  logout(): void {
    this.currentUserSignal.set(null);
    this.tokenSignal.set(null);
    this.refreshTokenSignal.set(null);

    if (isPlatformBrowser(this.platformId)) {
      try {
        deleteCookie(AUTH_COOKIE_USER);
        deleteCookie(AUTH_COOKIE_TOKEN);
        deleteCookie(AUTH_COOKIE_REFRESH);

        [localStorage, sessionStorage].forEach(s => {
          try {
            s.removeItem(LEGACY_STORAGE_USER);
            s.removeItem(LEGACY_STORAGE_TOKEN);
          } catch {
            // ignore
          }
        });
      } catch {
        // ignore
      }
    }

    try {
      this.router.navigate(['/auth/login']);
    } catch {
      // ignore
    }
  }

  refreshSession(): Observable<string> {
    const rfToken = this.refreshTokenSignal();
    if (!rfToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    const user = this.currentUserSignal();
    const isTenant = user?.role === 'tenant_admin' || !!user?.tenantId;
    const endpoint = isTenant ? '/tenant/auth/refresh-token' : '/platform/auth/refresh-token';
    const url = `${this.baseUrl}${endpoint}`;

    return this.http.post<any>(url, { refreshToken: rfToken }).pipe(
      map(res => {
        const data = res?.data ?? res;
        const newAccessToken = data?.accessToken;
        const newRefreshToken = data?.refreshToken || rfToken;

        if (!newAccessToken) {
          throw new Error('Refresh token response did not contain an accessToken');
        }

        this.updateTokens(newAccessToken, newRefreshToken);
        return newAccessToken;
      }),
      tap({
        error: () => {
          this.logout();
        },
      }),
    );
  }

  updateTokens(accessToken: string, refreshToken?: string): void {
    this.tokenSignal.set(accessToken);
    setCookie(AUTH_COOKIE_TOKEN, accessToken, { days: 30 });

    if (refreshToken) {
      this.refreshTokenSignal.set(refreshToken);
      setCookie(AUTH_COOKIE_REFRESH, refreshToken, { days: 30 });

      const user = this.currentUserSignal();
      if (user) {
        const updatedUser = { ...user, refreshToken };
        this.currentUserSignal.set(updatedUser);
        setCookie(AUTH_COOKIE_USER, JSON.stringify(updatedUser), { days: 30 });
      }
    }
  }

  hasRole(allowedRoles: string[]): boolean {
    const role = this.userRole();
    if (!role) return false;
    return allowedRoles.includes(role);
  }
}
