import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiCrudService } from 'admin-core';

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
export class PlatformUserService extends BaseApiCrudService<PlatformUser> {
  protected readonly endpoint = '/tenant-users';
  readonly users = this.items;

  constructor() {
    super();
    this.load();
  }

  override add(payload: Partial<PlatformUser>): Observable<PlatformUser> {
    return super.add({ ...payload, tenantId: 'easyfly' });
  }

  override update(id: string, payload: Partial<PlatformUser>): Observable<PlatformUser> {
    return super.update(id, payload);
  }

  updateDisabledPermissions(id: string, disabledPermissionIds: string[]): Observable<PlatformUser> {
    return this.update(id, { disabledPermissionIds });
  }

  override delete(id: string): Observable<void> {
    return super.delete(id);
  }

  override deleteMultiple(ids: string[]): Observable<void> {
    return super.deleteMultiple(ids);
  }
}
