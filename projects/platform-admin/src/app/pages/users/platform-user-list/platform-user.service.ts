import { Injectable, signal } from '@angular/core';

export type PlatformUserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING';

export interface PlatformUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roleId: string;
  status: PlatformUserStatus;
  disabledPermissionIds: string[];  // Hybrid RBAC: perms disabled from their role
  isPrimary: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

const STORAGE_KEY = 'easyflys_platform_users';

const INITIAL_USERS: PlatformUser[] = [
  {
    id: 'puser-1',
    firstName: 'Arnav',
    lastName: 'Mehta',
    email: 'arnav.mehta@easyflys.com',
    phone: '+91 98001 12345',
    roleId: 'role-1',
    status: 'ACTIVE',
    disabledPermissionIds: [],
    isPrimary: true,
    createdAt: '01 Jan 2025 / 10:00 AM',
    lastLoginAt: '20 Nov 2026 / 8:30 AM',
  },
  {
    id: 'puser-2',
    firstName: 'Preethi',
    lastName: 'Sundaram',
    email: 'preethi.s@easyflys.com',
    phone: '+91 97002 23456',
    roleId: 'role-2',
    status: 'ACTIVE',
    disabledPermissionIds: [],
    isPrimary: false,
    createdAt: '15 Jan 2025 / 11:00 AM',
    lastLoginAt: '19 Nov 2026 / 3:15 PM',
  },
  {
    id: 'puser-3',
    firstName: 'Rahul',
    lastName: 'Kapoor',
    email: 'rahul.k@easyflys.com',
    phone: '+91 96003 34567',
    roleId: 'role-3',
    status: 'ACTIVE',
    disabledPermissionIds: ['perm-hotel-markup-delete', 'perm-hotel-discount-delete'],
    isPrimary: false,
    createdAt: '10 Feb 2025 / 9:00 AM',
    lastLoginAt: '18 Nov 2026 / 11:45 AM',
  },
  {
    id: 'puser-4',
    firstName: 'Sneha',
    lastName: 'Iyer',
    email: 'sneha.i@easyflys.com',
    phone: '+91 95004 45678',
    roleId: 'role-4',
    status: 'ACTIVE',
    disabledPermissionIds: [],
    isPrimary: false,
    createdAt: '20 Feb 2025 / 2:30 PM',
    lastLoginAt: '17 Nov 2026 / 4:00 PM',
  },
  {
    id: 'puser-5',
    firstName: 'Vikram',
    lastName: 'Nair',
    email: 'vikram.n@easyflys.com',
    phone: '+91 94005 56789',
    roleId: 'role-5',
    status: 'ACTIVE',
    disabledPermissionIds: [],
    isPrimary: false,
    createdAt: '01 Mar 2025 / 10:00 AM',
    lastLoginAt: '15 Nov 2026 / 9:00 AM',
  },
  {
    id: 'puser-6',
    firstName: 'Meena',
    lastName: 'Pillai',
    email: 'meena.p@easyflys.com',
    phone: '+91 93006 67890',
    roleId: 'role-2',
    status: 'INACTIVE',
    disabledPermissionIds: ['perm-tenant-company-delete', 'perm-tenant-user-delete'],
    isPrimary: false,
    createdAt: '15 Mar 2025 / 1:00 PM',
    lastLoginAt: '10 Oct 2026 / 10:30 AM',
  },
  {
    id: 'puser-7',
    firstName: 'Deepak',
    lastName: 'Reddy',
    email: 'deepak.r@easyflys.com',
    phone: '+91 92007 78901',
    roleId: 'role-3',
    status: 'BLOCKED',
    disabledPermissionIds: [],
    isPrimary: false,
    createdAt: '01 Apr 2025 / 9:30 AM',
    lastLoginAt: '05 Sep 2026 / 3:45 PM',
  },
];

@Injectable({ providedIn: 'root' })
export class PlatformUserService {
  private readonly usersSignal = signal<PlatformUser[]>(this.loadFromSession());
  readonly users = this.usersSignal.asReadonly();

  private loadFromSession(): PlatformUser[] {
    if (typeof window === 'undefined') return INITIAL_USERS;
    try {
      const data = sessionStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch { /* fall through */ }
    this.saveToSession(INITIAL_USERS);
    return INITIAL_USERS;
  }

  private saveToSession(items: PlatformUser[]): void {
    if (typeof window === 'undefined') return;
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* noop */ }
  }

  private formatNow(): string {
    const now = new Date();
    return `${now.getDate().toString().padStart(2, '0')} ${now.toLocaleString('en-US', { month: 'short' })} ${now.getFullYear()} / ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  }

  add(data: Omit<PlatformUser, 'id' | 'createdAt' | 'lastLoginAt' | 'disabledPermissionIds' | 'isPrimary'>): PlatformUser {
    const item: PlatformUser = { ...data, id: `puser-${Date.now()}`, disabledPermissionIds: [], isPrimary: false, createdAt: this.formatNow(), lastLoginAt: null };
    const updated = [item, ...this.usersSignal()];
    this.usersSignal.set(updated);
    this.saveToSession(updated);
    return item;
  }

  update(id: string, data: Partial<Omit<PlatformUser, 'id' | 'createdAt' | 'lastLoginAt' | 'disabledPermissionIds' | 'isPrimary'>>): void {
    const list = this.usersSignal();
    const idx = list.findIndex(u => u.id === id);
    if (idx === -1) return;
    const next = [...list];
    next[idx] = { ...next[idx], ...data };
    this.usersSignal.set(next);
    this.saveToSession(next);
  }

  updateDisabledPermissions(id: string, disabledPermissionIds: string[]): void {
    const list = this.usersSignal();
    const idx = list.findIndex(u => u.id === id);
    if (idx === -1) return;
    const next = [...list];
    next[idx] = { ...next[idx], disabledPermissionIds };
    this.usersSignal.set(next);
    this.saveToSession(next);
  }

  delete(id: string): void {
    const filtered = this.usersSignal().filter(u => u.id !== id);
    this.usersSignal.set(filtered);
    this.saveToSession(filtered);
  }

  deleteMultiple(ids: string[]): void {
    const filtered = this.usersSignal().filter(u => !ids.includes(u.id));
    this.usersSignal.set(filtered);
    this.saveToSession(filtered);
  }
}
