import { Injectable, signal } from '@angular/core';

export type RoleType = 'SYSTEM' | 'CUSTOM';
export type RoleScope = 'PLATFORM' | 'TENANT' | 'B2B' | 'B2C' | 'SUPPLIER' | 'VENDOR';
export type RoleStatus = 'ACTIVE' | 'INACTIVE';

export interface RolePerm {
  id: string;
  moduleKey: string;
  moduleTitle: string;
  parentKey: string | null;
  parentTitle: string | null;
  actionKey: string;
  actionTitle: string;
}

export interface Role {
  id: string;
  key: string;
  name: string;
  description: string | null;
  type: RoleType;
  scope: RoleScope;
  ownerType: 'PLATFORM' | 'TENANT';
  ownerId: string | null;
  status: RoleStatus;
  permissionIds: string[];
  createdAt: string;
}

// ─── Permission generation ───────────────────────────────────────────────────

function pid(mk: string, ak: string): string {
  return `perm-${mk.toLowerCase().replace(/_/g, '-')}-${ak.toLowerCase().replace(/_/g, '-')}`;
}

const ACTION_TITLES: Record<string, string> = {
  VIEW: 'View', ADD: 'Add', EDIT: 'Edit', DELETE: 'Delete', STATUS: 'Status',
  EXPORT: 'Export', CHANGE_PASSWORD: 'Change Pwd', IMPERSONATE: 'Impersonate',
  CREDIT: 'Credit', DEBIT: 'Debit', CREDIT_LIMIT: 'Credit Limit', RESEND: 'Resend',
};

export const MODULE_TITLES: Record<string, string> = {
  DASHBOARD: 'Dashboard',
  TENANT: 'Tenant', TENANT_COMPANY: 'Companies', TENANT_USER: 'Users', TENANT_WALLET: 'Wallet',
  SETTING: 'Setting', SETTING_COMPANY: 'Company Setting', SETTING_USER: 'User Management',
  SETTING_ROLE: 'Role Management', SETTING_CONVENIENCE_FEE: 'Convenience Fee',
  SETTING_BANK_ACCOUNT: 'Bank Account', SETTING_WALLET: 'My Wallet',
  SETTING_AIRPORT: 'Airport', SETTING_AIRLINES: 'Airlines',
  SETTING_FLIGHT_FARE_TYPE: 'Flight Fare Type', SETTING_PAYMENT_GATEWAY: 'Payment Gateway',
  SETTING_VENDOR: 'Vendor Setting', SETTING_CURRENCY: 'Currency Setting',
  SETTING_LANGUAGE: 'Language Setting',
  ACCOUNTS: 'Accounts', ACCOUNTS_PAYMENT_HISTORY: 'Payment History',
  REPORT: 'Reports', REPORT_FLIGHT: 'Flight Report', REPORT_HOTEL: 'Hotel Report', REPORT_VISA: 'Visa Report',
  FLIGHT: 'Flight', FLIGHT_BOOKING: 'Booking', FLIGHT_AMENDMENT: 'Amendment',
  FLIGHT_REFUND: 'Refund', FLIGHT_MARKUP: 'Markup', FLIGHT_DISCOUNT: 'Discount',
  FLIGHT_EXTRANET: 'Flight Extranet', FLIGHT_EXTRANET_PRIVATE_FARE: 'Private Fare',
  FLIGHT_EXTRANET_FARE_RULE: 'Fare Rule', FLIGHT_EXTRANET_RATE_PLANE: 'Rate Plane',
  FLIGHT_EXTRANET_SEAT_ALLOCATION: 'Seat Allocation', FLIGHT_POPULAR_ROUTES: 'Popular Routes',
  HOTEL: 'Hotel', HOTEL_BOOKING: 'Booking', HOTEL_AMENDMENT: 'Amendment',
  HOTEL_REFUND: 'Refund', HOTEL_MARKUP: 'Markup', HOTEL_DISCOUNT: 'Discount',
  HOTEL_EXTRANET: 'Hotel Extranet', HOTEL_EXTRANET_HOTEL: 'Hotel',
  HOTEL_EXTRANET_PROPERTY: 'Property', HOTEL_EXTRANET_AMENITY: 'Amenity',
  HOTEL_EXTRANET_ADDON: 'Addon', HOTEL_EXTRANET_ROOM: 'Room',
  HOTEL_EXTRANET_ROOM_GALLERY: 'Room Gallery', HOTEL_EXTRANET_ROOM_PRICE: 'Room Price',
  HOTEL_POPULAR: 'Popular Hotels',
  VISA: 'Visa', VISA_BOOKING: 'Booking', VISA_AMENDMENT: 'Amendment',
  VISA_REFUND: 'Refund', VISA_MARKUP: 'Markup', VISA_DISCOUNT: 'Discount',
  AGENT: 'Agent', AGENT_COMPANY: 'Agent Companies', AGENT_USER: 'Agent Users',
  AGENT_WALLET: 'Wallet', AGENT_CLASS: 'Agent Class',
  SUPPLIER: 'Supplier', SUPPLIER_COMPANY: 'Supplier Companies', SUPPLIER_USER: 'Supplier Users',
  SUPPLIER_WALLET: 'Wallet', SUPPLIER_CLASS: 'Supplier Class',
  CUSTOMER: 'Customer', CUSTOMER_MANAGE: 'Customer Management', CUSTOMER_WALLET: 'Wallet',
  SLIDER: 'Slider', OFFERS: 'Offers', NEWSLETTER: 'Newsletter', NOTIFICATION: 'Notifications',
  BLOG: 'Blog', BLOG_MANAGE: 'Blog Management', BLOG_CATEGORY: 'Blog Category',
  PAGE: 'Page', PAGE_MANAGE: 'Page Management', PAGE_MENU: 'Menu',
  LOGS: 'Logs', LOGS_ACTIVITY: 'Activity Logs', LOGS_SMS: 'SMS Logs',
  LOGS_LOGIN: 'Login Logs', LOGS_EMAIL: 'Email Logs', LOGS_WHATSAPP: 'Whatsapp Logs', LOGS_COUPON: 'Coupon Logs',
  COUPON: 'Coupon', COUPON_FLIGHT: 'Flight Coupon', COUPON_HOTEL: 'Hotel Coupon', COUPON_VISA: 'Visa Coupon',
};

export const PARENT_MAP: Record<string, string> = {
  TENANT_COMPANY: 'TENANT', TENANT_USER: 'TENANT', TENANT_WALLET: 'TENANT',
  SETTING_COMPANY: 'SETTING', SETTING_USER: 'SETTING', SETTING_ROLE: 'SETTING',
  SETTING_WALLET: 'SETTING', SETTING_BANK_ACCOUNT: 'SETTING', SETTING_AIRPORT: 'SETTING',
  SETTING_AIRLINES: 'SETTING', SETTING_FLIGHT_FARE_TYPE: 'SETTING',
  SETTING_PAYMENT_GATEWAY: 'SETTING', SETTING_VENDOR: 'SETTING',
  SETTING_CURRENCY: 'SETTING', SETTING_LANGUAGE: 'SETTING', SETTING_CONVENIENCE_FEE: 'SETTING',
  ACCOUNTS_PAYMENT_HISTORY: 'ACCOUNTS',
  REPORT_FLIGHT: 'REPORT', REPORT_HOTEL: 'REPORT', REPORT_VISA: 'REPORT',
  FLIGHT_BOOKING: 'FLIGHT', FLIGHT_AMENDMENT: 'FLIGHT', FLIGHT_REFUND: 'FLIGHT',
  FLIGHT_MARKUP: 'FLIGHT', FLIGHT_DISCOUNT: 'FLIGHT',
  FLIGHT_EXTRANET_PRIVATE_FARE: 'FLIGHT_EXTRANET', FLIGHT_EXTRANET_FARE_RULE: 'FLIGHT_EXTRANET',
  FLIGHT_EXTRANET_RATE_PLANE: 'FLIGHT_EXTRANET', FLIGHT_EXTRANET_SEAT_ALLOCATION: 'FLIGHT_EXTRANET',
  FLIGHT_POPULAR_ROUTES: 'FLIGHT_EXTRANET',
  HOTEL_BOOKING: 'HOTEL', HOTEL_AMENDMENT: 'HOTEL', HOTEL_REFUND: 'HOTEL',
  HOTEL_MARKUP: 'HOTEL', HOTEL_DISCOUNT: 'HOTEL',
  HOTEL_EXTRANET_HOTEL: 'HOTEL_EXTRANET', HOTEL_EXTRANET_PROPERTY: 'HOTEL_EXTRANET',
  HOTEL_EXTRANET_AMENITY: 'HOTEL_EXTRANET', HOTEL_EXTRANET_ADDON: 'HOTEL_EXTRANET',
  HOTEL_EXTRANET_ROOM: 'HOTEL_EXTRANET', HOTEL_EXTRANET_ROOM_GALLERY: 'HOTEL_EXTRANET',
  HOTEL_EXTRANET_ROOM_PRICE: 'HOTEL_EXTRANET', HOTEL_POPULAR: 'HOTEL_EXTRANET',
  VISA_BOOKING: 'VISA', VISA_AMENDMENT: 'VISA', VISA_REFUND: 'VISA',
  VISA_MARKUP: 'VISA', VISA_DISCOUNT: 'VISA',
  AGENT_COMPANY: 'AGENT', AGENT_USER: 'AGENT', AGENT_WALLET: 'AGENT', AGENT_CLASS: 'AGENT',
  SUPPLIER_COMPANY: 'SUPPLIER', SUPPLIER_USER: 'SUPPLIER', SUPPLIER_WALLET: 'SUPPLIER', SUPPLIER_CLASS: 'SUPPLIER',
  CUSTOMER_MANAGE: 'CUSTOMER', CUSTOMER_WALLET: 'CUSTOMER',
  BLOG_MANAGE: 'BLOG', BLOG_CATEGORY: 'BLOG',
  PAGE_MANAGE: 'PAGE', PAGE_MENU: 'PAGE',
  LOGS_ACTIVITY: 'LOGS', LOGS_SMS: 'LOGS', LOGS_LOGIN: 'LOGS',
  LOGS_EMAIL: 'LOGS', LOGS_WHATSAPP: 'LOGS', LOGS_COUPON: 'LOGS',
  COUPON_FLIGHT: 'COUPON', COUPON_HOTEL: 'COUPON', COUPON_VISA: 'COUPON',
};

const SEED_MAP: Record<string, string[]> = {
  DASHBOARD: ['VIEW'],
  TENANT: ['VIEW'], SETTING: ['VIEW'], ACCOUNTS: ['VIEW'], REPORT: ['VIEW'],
  FLIGHT: ['VIEW'], FLIGHT_EXTRANET: ['VIEW'], HOTEL: ['VIEW'], HOTEL_EXTRANET: ['VIEW'],
  VISA: ['VIEW'], AGENT: ['VIEW'], SUPPLIER: ['VIEW'], CUSTOMER: ['VIEW'],
  COUPON: ['VIEW'], BLOG: ['VIEW'], PAGE: ['VIEW'], LOGS: ['VIEW'],
  TENANT_COMPANY: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'EXPORT', 'STATUS'],
  TENANT_USER: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS', 'CHANGE_PASSWORD', 'IMPERSONATE', 'EXPORT'],
  TENANT_WALLET: ['VIEW', 'CREDIT', 'DEBIT', 'CREDIT_LIMIT', 'EXPORT'],
  SETTING_COMPANY: ['EDIT'],
  SETTING_USER: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS', 'CHANGE_PASSWORD'],
  SETTING_ROLE: ['VIEW', 'ADD', 'EDIT', 'DELETE'],
  SETTING_WALLET: ['VIEW', 'EXPORT'],
  SETTING_CONVENIENCE_FEE: ['VIEW', 'ADD', 'EDIT', 'DELETE'],
  SETTING_BANK_ACCOUNT: ['VIEW', 'ADD', 'EDIT', 'DELETE'],
  SETTING_AIRPORT: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'EXPORT'],
  SETTING_AIRLINES: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'EXPORT'],
  SETTING_FLIGHT_FARE_TYPE: ['VIEW', 'ADD', 'EDIT', 'DELETE'],
  SETTING_PAYMENT_GATEWAY: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'EXPORT', 'STATUS'],
  SETTING_VENDOR: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'EXPORT', 'STATUS'],
  SETTING_CURRENCY: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  SETTING_LANGUAGE: ['EDIT'],
  ACCOUNTS_PAYMENT_HISTORY: ['VIEW', 'EXPORT'],
  REPORT_FLIGHT: ['VIEW', 'EXPORT'],
  REPORT_HOTEL: ['VIEW', 'EXPORT'],
  REPORT_VISA: ['VIEW', 'EXPORT'],
  FLIGHT_BOOKING: ['VIEW', 'EDIT', 'EXPORT'],
  FLIGHT_AMENDMENT: ['VIEW', 'ADD', 'EDIT', 'EXPORT'],
  FLIGHT_REFUND: ['VIEW', 'ADD', 'EDIT', 'EXPORT'],
  FLIGHT_MARKUP: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  FLIGHT_DISCOUNT: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  FLIGHT_EXTRANET_PRIVATE_FARE: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  FLIGHT_EXTRANET_FARE_RULE: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  FLIGHT_EXTRANET_RATE_PLANE: ['VIEW', 'ADD', 'EDIT', 'DELETE'],
  FLIGHT_EXTRANET_SEAT_ALLOCATION: ['VIEW', 'ADD', 'EDIT', 'DELETE'],
  FLIGHT_POPULAR_ROUTES: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  HOTEL_BOOKING: ['VIEW', 'EDIT', 'EXPORT'],
  HOTEL_AMENDMENT: ['VIEW', 'ADD', 'EDIT', 'EXPORT'],
  HOTEL_REFUND: ['VIEW', 'ADD', 'EDIT', 'EXPORT'],
  HOTEL_MARKUP: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  HOTEL_DISCOUNT: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  HOTEL_EXTRANET_HOTEL: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  HOTEL_EXTRANET_PROPERTY: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  HOTEL_EXTRANET_AMENITY: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  HOTEL_EXTRANET_ADDON: ['VIEW', 'ADD', 'EDIT', 'DELETE'],
  HOTEL_EXTRANET_ROOM: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  HOTEL_EXTRANET_ROOM_GALLERY: ['VIEW', 'ADD', 'EDIT', 'DELETE'],
  HOTEL_EXTRANET_ROOM_PRICE: ['VIEW', 'ADD', 'EDIT', 'DELETE'],
  HOTEL_POPULAR: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  VISA_BOOKING: ['VIEW', 'EDIT', 'EXPORT'],
  VISA_AMENDMENT: ['VIEW', 'ADD', 'EDIT', 'EXPORT'],
  VISA_REFUND: ['VIEW', 'ADD', 'EDIT', 'EXPORT'],
  VISA_MARKUP: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  VISA_DISCOUNT: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  AGENT_COMPANY: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'EXPORT', 'STATUS'],
  AGENT_USER: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS', 'CHANGE_PASSWORD', 'IMPERSONATE', 'EXPORT'],
  AGENT_WALLET: ['VIEW', 'CREDIT', 'DEBIT', 'CREDIT_LIMIT', 'EXPORT'],
  AGENT_CLASS: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  SUPPLIER_COMPANY: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'EXPORT', 'STATUS'],
  SUPPLIER_USER: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS', 'CHANGE_PASSWORD', 'IMPERSONATE', 'EXPORT'],
  SUPPLIER_WALLET: ['VIEW', 'CREDIT', 'DEBIT', 'CREDIT_LIMIT', 'EXPORT'],
  SUPPLIER_CLASS: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  CUSTOMER_MANAGE: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  CUSTOMER_WALLET: ['VIEW', 'CREDIT', 'DEBIT', 'CREDIT_LIMIT', 'EXPORT'],
  SLIDER: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  OFFERS: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  NEWSLETTER: ['ADD', 'EDIT', 'DELETE', 'EXPORT'],
  NOTIFICATION: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  BLOG_MANAGE: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'EXPORT', 'STATUS'],
  BLOG_CATEGORY: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  PAGE_MANAGE: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  PAGE_MENU: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  LOGS_ACTIVITY: ['VIEW', 'EXPORT'],
  LOGS_LOGIN: ['VIEW', 'EXPORT'],
  LOGS_EMAIL: ['VIEW', 'EXPORT', 'RESEND'],
  LOGS_SMS: ['VIEW', 'EXPORT', 'RESEND'],
  LOGS_WHATSAPP: ['VIEW', 'EXPORT', 'RESEND'],
  LOGS_COUPON: ['VIEW', 'EXPORT'],
  COUPON_FLIGHT: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  COUPON_HOTEL: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  COUPON_VISA: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
};

// All permissions derived from seed map
export const ALL_PERMISSIONS: RolePerm[] = [];
for (const [moduleKey, actions] of Object.entries(SEED_MAP)) {
  const parentKey = PARENT_MAP[moduleKey] ?? null;
  for (const actionKey of actions) {
    ALL_PERMISSIONS.push({
      id: pid(moduleKey, actionKey),
      moduleKey,
      moduleTitle: MODULE_TITLES[moduleKey] ?? moduleKey,
      parentKey,
      parentTitle: parentKey ? (MODULE_TITLES[parentKey] ?? parentKey) : null,
      actionKey,
      actionTitle: ACTION_TITLES[actionKey] ?? actionKey,
    });
  }
}

const ALL_PERM_IDS = ALL_PERMISSIONS.map(p => p.id);

function permsFor(modules: string[] | null, actions?: string[]): string[] {
  return ALL_PERMISSIONS
    .filter(p =>
      (!modules || modules.includes(p.moduleKey)) &&
      (!actions || actions.includes(p.actionKey)),
    )
    .map(p => p.id);
}

// ─── Mock roles ────────────────────────────────────────────────────────────

const INITIAL_ROLES: Role[] = [
  {
    id: 'role-1',
    key: 'super_admin',
    name: 'Super Admin',
    description: 'Full access to all platform features and settings',
    type: 'SYSTEM',
    scope: 'PLATFORM',
    ownerType: 'PLATFORM',
    ownerId: null,
    status: 'ACTIVE',
    permissionIds: ALL_PERM_IDS,
    createdAt: '01 Jan 2025 / 10:00 AM',
  },
  {
    id: 'role-2',
    key: 'operations_manager',
    name: 'Operations Manager',
    description: 'Manages hotel, flight, visa bookings and amendments',
    type: 'SYSTEM',
    scope: 'PLATFORM',
    ownerType: 'PLATFORM',
    ownerId: null,
    status: 'ACTIVE',
    permissionIds: permsFor([
      'DASHBOARD', 'HOTEL', 'HOTEL_BOOKING', 'HOTEL_AMENDMENT', 'HOTEL_REFUND',
      'FLIGHT', 'FLIGHT_BOOKING', 'FLIGHT_AMENDMENT', 'FLIGHT_REFUND',
      'VISA', 'VISA_BOOKING', 'VISA_AMENDMENT', 'VISA_REFUND',
      'TENANT', 'TENANT_COMPANY', 'TENANT_USER',
    ]),
    createdAt: '15 Jan 2025 / 11:30 AM',
  },
  {
    id: 'role-3',
    key: 'finance_manager',
    name: 'Finance Manager',
    description: 'Manages markups, discounts, coupons and financial reports',
    type: 'SYSTEM',
    scope: 'PLATFORM',
    ownerType: 'PLATFORM',
    ownerId: null,
    status: 'ACTIVE',
    permissionIds: permsFor([
      'DASHBOARD', 'HOTEL', 'HOTEL_MARKUP', 'HOTEL_DISCOUNT',
      'FLIGHT', 'FLIGHT_MARKUP', 'FLIGHT_DISCOUNT',
      'VISA', 'VISA_MARKUP', 'VISA_DISCOUNT',
      'ACCOUNTS', 'ACCOUNTS_PAYMENT_HISTORY',
      'REPORT', 'REPORT_FLIGHT', 'REPORT_HOTEL', 'REPORT_VISA',
      'COUPON', 'COUPON_FLIGHT', 'COUPON_HOTEL', 'COUPON_VISA',
    ]),
    createdAt: '20 Jan 2025 / 9:15 AM',
  },
  {
    id: 'role-4',
    key: 'content_manager',
    name: 'Content Manager',
    description: 'Manages blogs, pages, sliders, offers and newsletters',
    type: 'SYSTEM',
    scope: 'PLATFORM',
    ownerType: 'PLATFORM',
    ownerId: null,
    status: 'ACTIVE',
    permissionIds: permsFor([
      'DASHBOARD', 'BLOG', 'BLOG_MANAGE', 'BLOG_CATEGORY',
      'PAGE', 'PAGE_MANAGE', 'PAGE_MENU',
      'SLIDER', 'OFFERS', 'NEWSLETTER', 'NOTIFICATION',
    ]),
    createdAt: '05 Feb 2025 / 2:00 PM',
  },
  {
    id: 'role-5',
    key: 'support_agent',
    name: 'Support Agent',
    description: 'Read-only access to bookings, customers and logs for support tasks',
    type: 'SYSTEM',
    scope: 'PLATFORM',
    ownerType: 'PLATFORM',
    ownerId: null,
    status: 'ACTIVE',
    permissionIds: permsFor(
      ['DASHBOARD', 'HOTEL', 'HOTEL_BOOKING', 'FLIGHT', 'FLIGHT_BOOKING', 'VISA', 'VISA_BOOKING',
        'CUSTOMER', 'CUSTOMER_MANAGE', 'LOGS', 'LOGS_ACTIVITY', 'LOGS_LOGIN', 'LOGS_EMAIL'],
      ['VIEW'],
    ),
    createdAt: '12 Feb 2025 / 4:45 PM',
  },
  {
    id: 'role-6',
    key: 'tenant_admin',
    name: 'Tenant Admin',
    description: 'Full access within a tenant scope including users and settings',
    type: 'SYSTEM',
    scope: 'TENANT',
    ownerType: 'PLATFORM',
    ownerId: null,
    status: 'ACTIVE',
    permissionIds: permsFor([
      'DASHBOARD', 'SETTING', 'SETTING_COMPANY', 'SETTING_USER', 'SETTING_ROLE',
      'SETTING_WALLET', 'SETTING_BANK_ACCOUNT', 'SETTING_PAYMENT_GATEWAY',
      'HOTEL', 'HOTEL_BOOKING', 'HOTEL_MARKUP', 'HOTEL_DISCOUNT',
      'FLIGHT', 'FLIGHT_BOOKING', 'FLIGHT_MARKUP', 'FLIGHT_DISCOUNT',
      'ACCOUNTS', 'ACCOUNTS_PAYMENT_HISTORY',
    ]),
    createdAt: '01 Mar 2025 / 10:00 AM',
  },
  {
    id: 'role-7',
    key: 'tenant_booking_executive',
    name: 'Booking Executive',
    description: 'Custom role for booking operations within a specific tenant',
    type: 'CUSTOM',
    scope: 'TENANT',
    ownerType: 'TENANT',
    ownerId: 'tenant-abc-123',
    status: 'ACTIVE',
    permissionIds: permsFor(
      ['DASHBOARD', 'HOTEL', 'HOTEL_BOOKING', 'HOTEL_AMENDMENT', 'HOTEL_REFUND',
        'FLIGHT', 'FLIGHT_BOOKING', 'FLIGHT_AMENDMENT', 'FLIGHT_REFUND'],
    ),
    createdAt: '18 Mar 2025 / 1:30 PM',
  },
  {
    id: 'role-8',
    key: 'read_only_auditor',
    name: 'Read-Only Auditor',
    description: 'View and export access to all modules for audit purposes',
    type: 'CUSTOM',
    scope: 'PLATFORM',
    ownerType: 'PLATFORM',
    ownerId: null,
    status: 'INACTIVE',
    permissionIds: permsFor(null, ['VIEW', 'EXPORT']),
    createdAt: '25 Apr 2025 / 3:00 PM',
  },
];

const STORAGE_KEY = 'easyflys_roles';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly rolesSignal = signal<Role[]>(this.loadFromSession());
  readonly roles = this.rolesSignal.asReadonly();

  private loadFromSession(): Role[] {
    if (typeof window === 'undefined') return INITIAL_ROLES;
    try {
      const data = sessionStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fall through
    }
    this.saveToSession(INITIAL_ROLES);
    return INITIAL_ROLES;
  }

  private saveToSession(items: Role[]): void {
    if (typeof window === 'undefined') return;
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* noop */ }
  }

  private formatNow(): string {
    const now = new Date();
    return `${now.getDate().toString().padStart(2, '0')} ${now.toLocaleString('en-US', { month: 'short' })} ${now.getFullYear()} / ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  }

  add(data: Omit<Role, 'id' | 'createdAt' | 'permissionIds'>): Role {
    const item: Role = { ...data, id: `role-${Date.now()}`, permissionIds: [], createdAt: this.formatNow() };
    const updated = [item, ...this.rolesSignal()];
    this.rolesSignal.set(updated);
    this.saveToSession(updated);
    return item;
  }

  update(id: string, data: Partial<Omit<Role, 'id' | 'createdAt' | 'permissionIds'>>): void {
    const list = this.rolesSignal();
    const idx = list.findIndex(r => r.id === id);
    if (idx === -1) return;
    const next = [...list];
    next[idx] = { ...next[idx], ...data };
    this.rolesSignal.set(next);
    this.saveToSession(next);
  }

  updatePermissions(id: string, permissionIds: string[]): void {
    const list = this.rolesSignal();
    const idx = list.findIndex(r => r.id === id);
    if (idx === -1) return;
    const next = [...list];
    next[idx] = { ...next[idx], permissionIds };
    this.rolesSignal.set(next);
    this.saveToSession(next);
  }

  delete(id: string): void {
    const filtered = this.rolesSignal().filter(r => r.id !== id);
    this.rolesSignal.set(filtered);
    this.saveToSession(filtered);
  }

  deleteMultiple(ids: string[]): void {
    const filtered = this.rolesSignal().filter(r => !ids.includes(r.id));
    this.rolesSignal.set(filtered);
    this.saveToSession(filtered);
  }
}
