import { Injectable, signal } from '@angular/core';

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

const STORAGE_KEY = 'platform_login_logs';

const INITIAL_LOGS: LoginLog[] = [
  { id: 'll-1', userName: 'Arabinda Jena', email: 'arabinda.jena@finqy.ai', role: 'Super Admin', ipAddress: '103.145.72.11', device: 'Windows', browser: 'Chrome', status: 'Success', createdAt: '19 Nov 2026 / 09:45 AM' },
  { id: 'll-2', userName: 'Carlton Dsouza', email: 'Carlton@easyflys.com', role: 'Admin', ipAddress: '103.21.45.88', device: 'macOS', browser: 'Safari', status: 'Success', createdAt: '19 Nov 2026 / 09:12 AM' },
  { id: 'll-3', userName: 'Tawanna Reeves', email: 'Tawanna@easyflys.com', role: 'Manager', ipAddress: '192.168.1.45', device: 'Windows', browser: 'Edge', status: 'Success', createdAt: '19 Nov 2026 / 08:50 AM' },
  { id: 'll-4', userName: 'Kenny Mathews', email: 'Kenny@easyflys.com', role: 'Staff', ipAddress: '103.56.78.201', device: 'Android', browser: 'Chrome', status: 'Success', createdAt: '18 Nov 2026 / 06:30 PM' },
  { id: 'll-5', userName: 'Dustin Clarke', email: 'Dustin@easyflys.com', role: 'Staff', ipAddress: '103.56.78.202', device: 'iPhone', browser: 'Safari', status: 'Success', createdAt: '18 Nov 2026 / 05:15 PM' },
  { id: 'll-6', userName: 'Jerri Collins', email: 'Jerri@easyflys.com', role: 'Staff', ipAddress: '192.168.1.60', device: 'Windows', browser: 'Firefox', status: 'Failed', createdAt: '18 Nov 2026 / 04:40 PM' },
  { id: 'll-7', userName: 'Jerri Collins', email: 'Jerri@easyflys.com', role: 'Staff', ipAddress: '192.168.1.60', device: 'Windows', browser: 'Firefox', status: 'Failed', createdAt: '18 Nov 2026 / 04:41 PM' },
  { id: 'll-8', userName: 'Nichole Gosling', email: 'Sales@gosling.bangeshop.com', role: 'Manager', ipAddress: '45.33.22.187', device: 'macOS', browser: 'Chrome', status: 'Failed', createdAt: '17 Nov 2026 / 02:20 PM' },
  { id: 'll-9', userName: 'Unknown', email: 'admin@easyflys.com', role: '-', ipAddress: '185.220.101.44', device: 'Linux', browser: 'curl', status: 'Blocked', createdAt: '17 Nov 2026 / 11:05 AM' },
  { id: 'll-10', userName: 'Unknown', email: 'root@easyflys.com', role: '-', ipAddress: '185.220.101.44', device: 'Linux', browser: 'curl', status: 'Blocked', createdAt: '17 Nov 2026 / 11:06 AM' },
  { id: 'll-11', userName: 'Arabinda Jena', email: 'arabinda.jena@finqy.ai', role: 'Super Admin', ipAddress: '103.145.72.11', device: 'Windows', browser: 'Chrome', status: 'Success', createdAt: '17 Nov 2026 / 09:30 AM' },
  { id: 'll-12', userName: 'Carlton Dsouza', email: 'Carlton@easyflys.com', role: 'Admin', ipAddress: '103.21.45.88', device: 'macOS', browser: 'Safari', status: 'Success', createdAt: '16 Nov 2026 / 10:00 AM' },
  { id: 'll-13', userName: 'Tawanna Reeves', email: 'Tawanna@easyflys.com', role: 'Manager', ipAddress: '192.168.1.45', device: 'Android', browser: 'Chrome', status: 'Success', createdAt: '15 Nov 2026 / 03:45 PM' },
  { id: 'll-14', userName: 'Kenny Mathews', email: 'Kenny@easyflys.com', role: 'Staff', ipAddress: '103.56.78.201', device: 'Windows', browser: 'Edge', status: 'Failed', createdAt: '14 Nov 2026 / 09:10 AM' },
  { id: 'll-15', userName: 'Dustin Clarke', email: 'Dustin@easyflys.com', role: 'Staff', ipAddress: '103.56.78.202', device: 'iPhone', browser: 'Safari', status: 'Success', createdAt: '13 Nov 2026 / 11:20 AM' },
];

@Injectable({ providedIn: 'root' })
export class LoginLogsService {
  private readonly _logs = signal<LoginLog[]>(this.load());
  readonly logs = this._logs.asReadonly();

  private load(): LoginLog[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as LoginLog[];
    } catch { /* ignore */ }
    this.persist(INITIAL_LOGS);
    return INITIAL_LOGS;
  }

  private persist(items: LoginLog[]): void {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }

  delete(id: string): void {
    const updated = this._logs().filter(l => l.id !== id);
    this._logs.set(updated);
    this.persist(updated);
  }

  bulkDelete(ids: string[]): void {
    const set = new Set(ids);
    const updated = this._logs().filter(l => !set.has(l.id));
    this._logs.set(updated);
    this.persist(updated);
  }
}
