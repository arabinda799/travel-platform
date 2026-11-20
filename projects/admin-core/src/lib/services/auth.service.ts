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

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly currentUserSignal = signal<AuthUser | null>(this.loadUser());

  readonly currentUser = this.currentUserSignal.asReadonly();
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
    // Default mock platform admin user during development
    return {
      id: 'usr-1',
      name: 'Arabinda Jena',
      email: 'admin@easyflys.com',
      role: 'platform_admin',
    };
  }

  login(user: AuthUser, remember = false): void {
    this.currentUserSignal.set(user);
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const serialized = JSON.stringify(user);
      if (remember) {
        localStorage.setItem(AUTH_STORAGE_KEY, serialized);
      } else {
        sessionStorage.setItem(AUTH_STORAGE_KEY, serialized);
      }
    } catch {
      // ignore
    }
  }

  logout(): void {
    this.currentUserSignal.set(null);
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
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
