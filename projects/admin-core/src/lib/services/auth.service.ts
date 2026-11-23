import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'platform_admin' | 'tenant_admin' | 'operator';
  avatar?: string;
}

const AUTH_STORAGE_KEY = 'easyflys_auth_user';
const AUTH_TOKEN_KEY = 'easyflys_auth_token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly currentUserSignal = signal<AuthUser | null>(this.loadUser());
  private readonly tokenSignal = signal<string | null>(this.loadToken());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly token = this.tokenSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly userRole = computed(() => this.currentUserSignal()?.role ?? null);

  private loadUser(): AuthUser | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const data = sessionStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem(AUTH_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // ignore
    }
    return null;
  }

  private loadToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      return sessionStorage.getItem(AUTH_TOKEN_KEY) ?? localStorage.getItem(AUTH_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  login(user: AuthUser, token: string | null = null, remember = false): void {
    this.currentUserSignal.set(user);
    this.tokenSignal.set(token);
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      if (token) storage.setItem(AUTH_TOKEN_KEY, token);
    } catch {
      // ignore
    }
  }

  logout(): void {
    this.currentUserSignal.set(null);
    this.tokenSignal.set(null);
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      [localStorage, sessionStorage].forEach(s => {
        s.removeItem(AUTH_STORAGE_KEY);
        s.removeItem(AUTH_TOKEN_KEY);
      });
    } catch {
      // ignore
    }
  }

  hasRole(allowedRoles: string[]): boolean {
    const role = this.userRole();
    if (!role) return false;
    return allowedRoles.includes(role);
  }
}
