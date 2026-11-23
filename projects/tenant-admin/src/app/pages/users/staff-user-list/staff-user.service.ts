import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

export type PlatformUserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING';

export interface PlatformUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roleId: string;
  status: PlatformUserStatus;
  disabledPermissionIds: string[];
  isPrimary: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

const STORAGE_KEY = 'tenant_admin_staff_users';

const INITIAL_STAFF_USERS: PlatformUser[] = [
  {
    id: 'staff-1',
    firstName: 'Super',
    lastName: 'Admin',
    email: 'superadmin@easyflys.com',
    phone: '+91 90000 00001',
    roleId: 'role-super-admin',
    status: 'ACTIVE',
    disabledPermissionIds: [],
    isPrimary: true,
    createdAt: '2026-01-01 / 10:00 AM',
    lastLoginAt: '2026-11-23 / 11:30 AM',
  },
  {
    id: 'staff-2',
    firstName: 'Amit',
    lastName: 'Kumar',
    email: 'amit.kumar@easyflys.com',
    phone: '+91 90000 00002',
    roleId: 'role-tenant-admin',
    status: 'ACTIVE',
    disabledPermissionIds: [],
    isPrimary: false,
    createdAt: '2026-01-10 / 02:15 PM',
    lastLoginAt: '2026-11-23 / 09:12 AM',
  },
  {
    id: 'staff-3',
    firstName: 'Sneha',
    lastName: 'Reddy',
    email: 'sneha.r@easyflys.com',
    phone: '+91 90000 00003',
    roleId: 'role-hotel-ops',
    status: 'ACTIVE',
    disabledPermissionIds: [],
    isPrimary: false,
    createdAt: '2026-01-15 / 11:45 AM',
    lastLoginAt: '2026-11-22 / 05:40 PM',
  },
  {
    id: 'staff-4',
    firstName: 'Vikram',
    lastName: 'Malhotra',
    email: 'vikram.m@easyflys.com',
    phone: '+91 90000 00004',
    roleId: 'role-finance-mgr',
    status: 'ACTIVE',
    disabledPermissionIds: [],
    isPrimary: false,
    createdAt: '2026-02-01 / 10:20 AM',
    lastLoginAt: '2026-11-23 / 01:10 PM',
  },
  {
    id: 'staff-5',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.s@easyflys.com',
    phone: '+91 90000 00005',
    roleId: 'role-support-exec',
    status: 'ACTIVE',
    disabledPermissionIds: [],
    isPrimary: false,
    createdAt: '2026-02-15 / 03:00 PM',
    lastLoginAt: '2026-11-23 / 02:05 PM',
  },
  {
    id: 'staff-6',
    firstName: 'Rohan',
    lastName: 'Gupta',
    email: 'rohan.gupta@easyflys.com',
    phone: '+91 90000 00006',
    roleId: 'role-support-exec',
    status: 'INACTIVE',
    disabledPermissionIds: [],
    isPrimary: false,
    createdAt: '2026-03-01 / 12:30 PM',
    lastLoginAt: '2026-10-15 / 04:15 PM',
  },
];

@Injectable({ providedIn: 'root' })
export class PlatformUserService {
  private readonly _items = signal<PlatformUser[]>(this.loadFromStorage());
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly users = this.items;
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  private loadFromStorage(): PlatformUser[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as PlatformUser[];
    } catch { /* ignore */ }
    this.persist(INITIAL_STAFF_USERS);
    return INITIAL_STAFF_USERS;
  }

  private persist(items: PlatformUser[]): void {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }

  private formatNow(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${y}-${m}-${d} / ${time}`;
  }

  load(): void {
    this._items.set(this.loadFromStorage());
  }

  add(payload: Partial<PlatformUser>): Observable<PlatformUser> {
    const newItem: PlatformUser = {
      id: `staff-${Date.now()}`,
      firstName: payload.firstName || '',
      lastName: payload.lastName || '',
      email: payload.email || '',
      phone: payload.phone || '',
      roleId: payload.roleId || 'role-support-exec',
      status: payload.status || 'ACTIVE',
      disabledPermissionIds: [],
      isPrimary: payload.isPrimary ?? false,
      createdAt: this.formatNow(),
      lastLoginAt: null,
    };
    const updated = [newItem, ...this._items()];
    this._items.set(updated);
    this.persist(updated);
    return of(newItem);
  }

  update(id: string, payload: Partial<PlatformUser>): Observable<PlatformUser> {
    const list = this._items();
    const idx = list.findIndex(u => u.id === id);
    if (idx !== -1) {
      const updatedItem = { ...list[idx], ...payload };
      const updated = [...list];
      updated[idx] = updatedItem;
      this._items.set(updated);
      this.persist(updated);
      return of(updatedItem);
    }
    return of(list[0]);
  }

  updateDisabledPermissions(id: string, disabledPermissionIds: string[]): Observable<PlatformUser> {
    return this.update(id, { disabledPermissionIds });
  }

  delete(id: string): Observable<void> {
    const updated = this._items().filter(u => u.id !== id);
    this._items.set(updated);
    this.persist(updated);
    return of(void 0);
  }

  deleteMultiple(ids: string[]): Observable<void> {
    const set = new Set(ids);
    const updated = this._items().filter(u => !set.has(u.id));
    this._items.set(updated);
    this.persist(updated);
    return of(void 0);
  }
}
