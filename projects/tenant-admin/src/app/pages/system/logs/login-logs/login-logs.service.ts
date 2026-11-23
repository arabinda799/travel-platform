import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface LoginLog {
  id: string;
  userName: string;
  email: string;
  role: string;
  ipAddress: string;
  device: string;
  browser: string;
  status: 'Success' | 'Failed' | 'Blocked';
  createdAt: string;
}

const STORAGE_KEY = 'tenant_admin_login_logs';

const INITIAL_LOGIN_LOGS: LoginLog[] = [
  {
    id: 'log-1',
    userName: 'Super Admin',
    email: 'superadmin@easyflys.com',
    role: 'Super Admin',
    ipAddress: '103.21.58.12',
    device: 'Desktop',
    browser: 'Chrome 130',
    status: 'Success',
    createdAt: '2026-11-23 / 11:30 AM',
  },
  {
    id: 'log-2',
    userName: 'Amit Kumar',
    email: 'amit.kumar@easyflys.com',
    role: 'Tenant Admin',
    ipAddress: '117.96.47.33',
    device: 'Desktop',
    browser: 'Chrome 130',
    status: 'Success',
    createdAt: '2026-11-23 / 09:12 AM',
  },
  {
    id: 'log-3',
    userName: 'Priya Sharma',
    email: 'priya.s@easyflys.com',
    role: 'Support Desk',
    ipAddress: '182.72.65.10',
    device: 'Mobile',
    browser: 'Safari 18',
    status: 'Success',
    createdAt: '2026-11-23 / 08:45 AM',
  },
  {
    id: 'log-4',
    userName: 'Unknown Account',
    email: 'security.probe@unknown-host.net',
    role: 'Unknown',
    ipAddress: '198.51.100.44',
    device: 'Desktop',
    browser: 'Firefox 125',
    status: 'Blocked',
    createdAt: '2026-11-22 / 11:15 PM',
  },
  {
    id: 'log-5',
    userName: 'Vikram Malhotra',
    email: 'vikram.m@easyflys.com',
    role: 'Finance Lead',
    ipAddress: '49.207.180.92',
    device: 'Desktop',
    browser: 'Edge 128',
    status: 'Failed',
    createdAt: '2026-11-22 / 09:30 AM',
  },
];

@Injectable({ providedIn: 'root' })
export class LoginLogsService {
  private readonly _logs = signal<LoginLog[]>(this.loadFromStorage());
  private readonly _loading = signal<boolean>(false);

  readonly logs = this._logs.asReadonly();
  readonly loading = this._loading.asReadonly();

  private loadFromStorage(): LoginLog[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as LoginLog[];
    } catch { /* ignore */ }
    this.persist(INITIAL_LOGIN_LOGS);
    return INITIAL_LOGIN_LOGS;
  }

  private persist(items: LoginLog[]): void {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }

  load(): void {
    this._logs.set(this.loadFromStorage());
  }

  delete(id: string): Observable<void> {
    const updated = this._logs().filter(l => l.id !== id);
    this._logs.set(updated);
    this.persist(updated);
    return of(void 0);
  }

  bulkDelete(ids: string[]): Observable<void> {
    const set = new Set(ids);
    const updated = this._logs().filter(l => !set.has(l.id));
    this._logs.set(updated);
    this.persist(updated);
    return of(void 0);
  }
}
