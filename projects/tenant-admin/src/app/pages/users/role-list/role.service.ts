import { Injectable } from '@angular/core';
import { Observable, take, tap } from 'rxjs';
import { BaseApiCrudService } from 'admin-core';

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
  SETTING_PAYMENT_GATEWAY: 'Payment Gateway', SETTING_SECURITY: 'Security',
  SETTING_SOCIAL_NETWORK: 'Social Network', SETTING_HEADER_FOOTER: 'Header / Footer',
  HOTEL: 'Hotels', HOTEL_BOOKING: 'Hotel Booking', HOTEL_OFFLINE: 'Offline Booking',
  HOTEL_AMENDMENT: 'Amendment', HOTEL_QUERY: 'Query', HOTEL_SEARCH_LOG: 'Search Log',
  HOTEL_MARKUP: 'Markup', HOTEL_DISCOUNT: 'Discount', HOTEL_COUPON: 'Coupon',
  HOTEL_POPULAR: 'Popular Hotel', HOTEL_TRENDING: 'Trending Destination',
  B2B: 'B2B', B2B_AGENT: 'Agents', B2B_WALLET: 'Agent Wallet', B2B_CLASS: 'Agency Class',
  B2B_SEARCH_LOG: 'Search Logs', B2B_SECURITY: 'Security Deposit',
  SUPPLIER: 'Supplier', SUPPLIER_MANAGE: 'Suppliers', SUPPLIER_OFFLINE: 'Offline Class',
  SUPPLIER_USER: 'Supplier Users', SUPPLIER_WALLET: 'Supplier Wallet', SUPPLIER_CLASS: 'Supplier Class',
  CUSTOMER: 'Customer', CUSTOMER_MANAGE: 'Customers', CUSTOMER_WALLET: 'Customer Wallet',
  CONTENT: 'Content', SLIDER: 'Sliders', OFFERS: 'Offers', NEWSLETTER: 'Newsletter',
  NOTIFICATION: 'Notification', BLOG_MANAGE: 'Blog Posts', BLOG_CATEGORY: 'Blog Categories',
  PAGE_MANAGE: 'Pages', PAGE_MENU: 'Menus',
  SYSTEM_LOGS: 'System Logs', LOGS_ACTIVITY: 'Activity Logs', LOGS_LOGIN: 'Login Logs',
  LOGS_EMAIL: 'Email Logs', LOGS_SMS: 'SMS Logs', LOGS_WHATSAPP: 'WhatsApp Logs', LOGS_COUPON: 'Coupon Logs',
  COUPON_HOTEL: 'Hotel Coupons',
};

export const PARENT_MAP: Record<string, string> = {
  TENANT_COMPANY: 'TENANT', TENANT_USER: 'TENANT', TENANT_WALLET: 'TENANT',
  SETTING_COMPANY: 'SETTING', SETTING_USER: 'SETTING', SETTING_ROLE: 'SETTING',
  SETTING_CONVENIENCE_FEE: 'SETTING', SETTING_BANK_ACCOUNT: 'SETTING',
  SETTING_WALLET: 'SETTING', SETTING_PAYMENT_GATEWAY: 'SETTING',
  SETTING_SECURITY: 'SETTING', SETTING_SOCIAL_NETWORK: 'SETTING',
  SETTING_HEADER_FOOTER: 'SETTING',
  HOTEL_BOOKING: 'HOTEL', HOTEL_OFFLINE: 'HOTEL', HOTEL_AMENDMENT: 'HOTEL',
  HOTEL_QUERY: 'HOTEL', HOTEL_SEARCH_LOG: 'HOTEL', HOTEL_MARKUP: 'HOTEL',
  HOTEL_DISCOUNT: 'HOTEL', HOTEL_COUPON: 'HOTEL', HOTEL_POPULAR: 'HOTEL',
  HOTEL_TRENDING: 'HOTEL',
  B2B_AGENT: 'B2B', B2B_WALLET: 'B2B', B2B_CLASS: 'B2B',
  B2B_SEARCH_LOG: 'B2B', B2B_SECURITY: 'B2B',
  SUPPLIER_MANAGE: 'SUPPLIER', SUPPLIER_OFFLINE: 'SUPPLIER',
  SUPPLIER_USER: 'SUPPLIER', SUPPLIER_WALLET: 'SUPPLIER', SUPPLIER_CLASS: 'SUPPLIER',
  CUSTOMER_MANAGE: 'CUSTOMER', CUSTOMER_WALLET: 'CUSTOMER',
  SLIDER: 'CONTENT', OFFERS: 'CONTENT', NEWSLETTER: 'CONTENT',
  NOTIFICATION: 'CONTENT', BLOG_MANAGE: 'CONTENT', BLOG_CATEGORY: 'CONTENT',
  PAGE_MANAGE: 'CONTENT', PAGE_MENU: 'CONTENT',
  LOGS_ACTIVITY: 'SYSTEM_LOGS', LOGS_LOGIN: 'SYSTEM_LOGS',
  LOGS_EMAIL: 'SYSTEM_LOGS', LOGS_SMS: 'SYSTEM_LOGS',
  LOGS_WHATSAPP: 'SYSTEM_LOGS', LOGS_COUPON: 'SYSTEM_LOGS',
};

const SEED_MAP: Record<string, string[]> = {
  DASHBOARD: ['VIEW'],
  TENANT: ['VIEW'],
  TENANT_COMPANY: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS', 'EXPORT'],
  TENANT_USER: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS', 'CHANGE_PASSWORD', 'IMPERSONATE', 'EXPORT'],
  TENANT_WALLET: ['VIEW', 'CREDIT', 'DEBIT', 'CREDIT_LIMIT', 'EXPORT'],
  SETTING: ['VIEW'],
  SETTING_COMPANY: ['VIEW', 'EDIT'],
  SETTING_USER: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS', 'CHANGE_PASSWORD', 'EXPORT'],
  SETTING_ROLE: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  SETTING_CONVENIENCE_FEE: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  SETTING_BANK_ACCOUNT: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  SETTING_WALLET: ['VIEW', 'CREDIT', 'DEBIT'],
  SETTING_PAYMENT_GATEWAY: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  SETTING_SECURITY: ['VIEW', 'EDIT'],
  SETTING_SOCIAL_NETWORK: ['VIEW', 'EDIT'],
  SETTING_HEADER_FOOTER: ['VIEW', 'EDIT'],
  HOTEL: ['VIEW'],
  HOTEL_BOOKING: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS', 'EXPORT'],
  HOTEL_OFFLINE: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS', 'EXPORT'],
  HOTEL_AMENDMENT: ['VIEW', 'ADD', 'EDIT', 'STATUS', 'EXPORT'],
  HOTEL_QUERY: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS', 'EXPORT'],
  HOTEL_SEARCH_LOG: ['VIEW', 'EXPORT'],
  HOTEL_MARKUP: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  HOTEL_DISCOUNT: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  HOTEL_COUPON: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  HOTEL_POPULAR: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  HOTEL_TRENDING: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  B2B: ['VIEW'],
  B2B_AGENT: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS', 'CHANGE_PASSWORD', 'IMPERSONATE', 'EXPORT'],
  B2B_WALLET: ['VIEW', 'CREDIT', 'DEBIT', 'CREDIT_LIMIT', 'EXPORT'],
  B2B_CLASS: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  B2B_SEARCH_LOG: ['VIEW', 'EXPORT'],
  B2B_SECURITY: ['VIEW', 'ADD', 'EDIT', 'STATUS'],
  SUPPLIER: ['VIEW'],
  SUPPLIER_MANAGE: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS', 'EXPORT'],
  SUPPLIER_OFFLINE: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS', 'EXPORT'],
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
  LOGS_ACTIVITY: ['VIEW', 'EXPORT'], LOGS_LOGIN: ['VIEW', 'EXPORT'],
  LOGS_EMAIL: ['VIEW', 'EXPORT', 'RESEND'], LOGS_SMS: ['VIEW', 'EXPORT', 'RESEND'],
  LOGS_WHATSAPP: ['VIEW', 'EXPORT', 'RESEND'], LOGS_COUPON: ['VIEW', 'EXPORT'],
  COUPON_HOTEL: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
};

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

@Injectable({ providedIn: 'root' })
export class RoleService extends BaseApiCrudService<Role> {
  protected readonly endpoint = '/tenant/roles';
  readonly roles = this.items;

  constructor() {
    super();
    this.load();
  }

  loadById(id: string): Observable<Role> {
    return this.api.get<Role>(`${this.endpoint}/${id}`).pipe(
      take(1),
      tap(role => {
        this._items.update(list => {
          const idx = list.findIndex(r => r.id === id);
          return idx >= 0 ? list.map((r, i) => i === idx ? role : r) : [role, ...list];
        });
      }),
    );
  }

  override add(payload: Partial<Role>): Observable<Role> {
    return super.add(payload);
  }

  override update(id: string, payload: Partial<Role>): Observable<Role> {
    return super.update(id, payload);
  }

  updatePermissions(id: string, permissionIds: string[]): Observable<Role> {
    return this.api.patch<Role>(`${this.endpoint}/${id}/permissions`, { permissionIds }).pipe(
      take(1),
      tap(updated => this._items.update(list => list.map(r => r.id === id ? updated : r))),
    );
  }

  override delete(id: string): Observable<void> {
    return super.delete(id);
  }

  override deleteMultiple(ids: string[]): Observable<void> {
    return super.deleteMultiple(ids);
  }
}
