import { Injectable, signal } from '@angular/core';

export type TenantUserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING';

export interface TenantUser {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roleId: string;
  status: TenantUserStatus;
  disabledPermissionIds: string[];
  isPrimary: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

const MOCK_USERS: TenantUser[] = [
  { id: 'tnu-001', tenantId: 'ten-001', firstName: 'Aryan', lastName: 'Sharma', email: 'aryan@nexustravels.com', phone: '+919876543210', roleId: 'role-6', status: 'ACTIVE', disabledPermissionIds: [], isPrimary: true, createdAt: '2025-02-10', lastLoginAt: '2026-11-19T10:30:00Z' },
  { id: 'tnu-002', tenantId: 'ten-001', firstName: 'Priya', lastName: 'Verma', email: 'priya@nexustravels.com', phone: '+919812345678', roleId: 'role-7', status: 'ACTIVE', disabledPermissionIds: ['perm-hotel-hotel-booking-delete', 'perm-flight-flight-booking-delete'], isPrimary: false, createdAt: '2025-03-15', lastLoginAt: '2026-11-18T14:00:00Z' },
  { id: 'tnu-003', tenantId: 'ten-002', firstName: 'Rahul', lastName: 'Mehta', email: 'rahul@horizontours.in', phone: '+918800001234', roleId: 'role-6', status: 'ACTIVE', disabledPermissionIds: [], isPrimary: true, createdAt: '2025-04-01', lastLoginAt: '2026-11-17T09:00:00Z' },
  { id: 'tnu-004', tenantId: 'ten-002', firstName: 'Sneha', lastName: 'Patel', email: 'sneha@horizontours.in', phone: '+918900002345', roleId: 'role-7', status: 'PENDING', disabledPermissionIds: [], isPrimary: false, createdAt: '2026-11-01', lastLoginAt: null },
  { id: 'tnu-005', tenantId: 'ten-003', firstName: 'Vivek', lastName: 'Nair', email: 'vivek@wanderlust.com', phone: '+917700003456', roleId: 'role-6', status: 'ACTIVE', disabledPermissionIds: [], isPrimary: true, createdAt: '2026-10-15', lastLoginAt: '2026-11-19T08:00:00Z' },
  { id: 'tnu-006', tenantId: 'ten-004', firstName: 'Anjali', lastName: 'Singh', email: 'anjali@skylinetravel.com', phone: '+916600004567', roleId: 'role-6', status: 'INACTIVE', disabledPermissionIds: [], isPrimary: true, createdAt: '2024-11-20', lastLoginAt: '2025-06-10T12:00:00Z' },
  { id: 'tnu-007', tenantId: 'ten-005', firstName: 'Deepak', lastName: 'Joshi', email: 'deepak@travelease.in', phone: '+915500005678', roleId: 'role-6', status: 'ACTIVE', disabledPermissionIds: ['perm-setting-setting-user-delete'], isPrimary: true, createdAt: '2025-07-05', lastLoginAt: '2026-11-16T11:00:00Z' },
];

const STORAGE_KEY = 'easyflys_tenant_users';

@Injectable({ providedIn: 'root' })
export class TenantUserService {
  readonly users = signal<TenantUser[]>(this._load());

  private _load(): TenantUser[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : MOCK_USERS;
    } catch {
      return MOCK_USERS;
    }
  }

  private _save(list: TenantUser[]): void {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { /* ignore */ }
    this.users.set(list);
  }

  add(payload: Omit<TenantUser, 'id' | 'createdAt' | 'lastLoginAt' | 'disabledPermissionIds'>): TenantUser {
    const item: TenantUser = { ...payload, id: `tnu-${Date.now()}`, disabledPermissionIds: [], createdAt: new Date().toISOString().split('T')[0], lastLoginAt: null };
    this._save([...this.users(), item]);
    return item;
  }

  update(id: string, payload: Partial<Omit<TenantUser, 'id' | 'createdAt' | 'lastLoginAt'>>): void {
    this._save(this.users().map(u => u.id === id ? { ...u, ...payload } : u));
  }

  updateDisabledPermissions(id: string, disabledPermissionIds: string[]): void {
    this._save(this.users().map(u => u.id === id ? { ...u, disabledPermissionIds } : u));
  }

  delete(id: string): void {
    this._save(this.users().filter(u => u.id !== id));
  }

  deleteMultiple(ids: string[]): void {
    const idSet = new Set(ids);
    this._save(this.users().filter(u => !idSet.has(u.id)));
  }
}
