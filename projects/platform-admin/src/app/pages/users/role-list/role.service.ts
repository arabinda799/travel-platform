import { Injectable, inject } from '@angular/core';
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

// ─── Permission constants (used by role-permissions page) ────────────────────

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
  REPORT_FLIGHT: ['VIEW', 'EXPORT'], REPORT_HOTEL: ['VIEW', 'EXPORT'], REPORT_VISA: ['VIEW', 'EXPORT'],
  FLIGHT_BOOKING: ['VIEW', 'EDIT', 'EXPORT'], FLIGHT_AMENDMENT: ['VIEW', 'ADD', 'EDIT', 'EXPORT'],
  FLIGHT_REFUND: ['VIEW', 'ADD', 'EDIT', 'EXPORT'],
  FLIGHT_MARKUP: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  FLIGHT_DISCOUNT: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  FLIGHT_EXTRANET_PRIVATE_FARE: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  FLIGHT_EXTRANET_FARE_RULE: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  FLIGHT_EXTRANET_RATE_PLANE: ['VIEW', 'ADD', 'EDIT', 'DELETE'],
  FLIGHT_EXTRANET_SEAT_ALLOCATION: ['VIEW', 'ADD', 'EDIT', 'DELETE'],
  FLIGHT_POPULAR_ROUTES: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  HOTEL_BOOKING: ['VIEW', 'EDIT', 'EXPORT'], HOTEL_AMENDMENT: ['VIEW', 'ADD', 'EDIT', 'EXPORT'],
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
  VISA_BOOKING: ['VIEW', 'EDIT', 'EXPORT'], VISA_AMENDMENT: ['VIEW', 'ADD', 'EDIT', 'EXPORT'],
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
  LOGS_ACTIVITY: ['VIEW', 'EXPORT'], LOGS_LOGIN: ['VIEW', 'EXPORT'],
  LOGS_EMAIL: ['VIEW', 'EXPORT', 'RESEND'], LOGS_SMS: ['VIEW', 'EXPORT', 'RESEND'],
  LOGS_WHATSAPP: ['VIEW', 'EXPORT', 'RESEND'], LOGS_COUPON: ['VIEW', 'EXPORT'],
  COUPON_FLIGHT: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  COUPON_HOTEL: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  COUPON_VISA: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
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

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class RoleService extends BaseApiCrudService<Role> {
  protected readonly endpoint = '/roles';

  readonly roles = this.items;

  updatePermissions(id: string, permissionIds: string[]): Observable<Role> {
    return this.update(id, { permissionIds });
  }
}
