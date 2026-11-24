import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiCrudService } from 'admin-core';

export type VendorServiceType = 'HOTEL' | 'FLIGHT' | 'HOLIDAY' | 'BUS';
export type VendorMode = 'LIVE' | 'TEST';
export type VendorAuthType = 'API_KEY' | 'BASIC_AUTH' | 'BEARER_TOKEN';
export type VendorHealth = 'Healthy' | 'Degraded' | 'Down';

export interface Vendor {
  id: string;
  name: string;
  code: string;
  services: VendorServiceType[];
  mode: VendorMode;
  apiUrl: string;
  authType: VendorAuthType;
  credentials: Record<string, any>;
  latencyMs: number;
  healthStatus: VendorHealth;
  isActive: boolean;
  lastSync: string;
}

const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'vnd-1',
    name: 'Hotelbeds B2B Wholesaler',
    code: 'HBD-GLOBAL',
    services: ['HOTEL'],
    mode: 'LIVE',
    apiUrl: 'https://api.hotelbeds.com/hotel-api/1.0',
    authType: 'API_KEY',
    credentials: { apiKey: 'hb_live_98124', secret: '••••••••' },
    latencyMs: 142,
    healthStatus: 'Healthy',
    isActive: true,
    lastSync: '2026-11-23 / 11:30 AM',
  },
  {
    id: 'vnd-2',
    name: 'TBO Holidays India',
    code: 'TBO-IN',
    services: ['HOTEL', 'FLIGHT', 'HOLIDAY'],
    mode: 'LIVE',
    apiUrl: 'https://api.tboholidays.com/v2',
    authType: 'BASIC_AUTH',
    credentials: { username: 'easyfly_tbo', password: '••••••••' },
    latencyMs: 185,
    healthStatus: 'Healthy',
    isActive: true,
    lastSync: '2026-11-23 / 11:00 AM',
  },
  {
    id: 'vnd-3',
    name: 'RateHawk Worldwide',
    code: 'RATEHAWK-EU',
    services: ['HOTEL'],
    mode: 'LIVE',
    apiUrl: 'https://api.worldota.net/api/b2b/v3',
    authType: 'BEARER_TOKEN',
    credentials: { token: 'wh_bearer_982410' },
    latencyMs: 220,
    healthStatus: 'Healthy',
    isActive: true,
    lastSync: '2026-11-23 / 10:45 AM',
  },
  {
    id: 'vnd-4',
    name: 'Agoda Direct Connect',
    code: 'AGODA-B2B',
    services: ['HOTEL'],
    mode: 'TEST',
    apiUrl: 'https://sandbox.agoda.com/api/v1',
    authType: 'API_KEY',
    credentials: { apiKey: 'agoda_test_demo' },
    latencyMs: 310,
    healthStatus: 'Degraded',
    isActive: false,
    lastSync: '2026-11-22 / 04:00 PM',
  },
];

@Injectable({ providedIn: 'root' })
export class VendorListService extends BaseApiCrudService<Vendor> {
  protected readonly endpoint = '/vendors';
  readonly vendors = this.items;

  constructor() {
    super();
    this.load();
  }

  addVendor(payload: Omit<Vendor, 'id' | 'latencyMs' | 'healthStatus' | 'lastSync'>): Observable<Vendor> {
    return this.add(payload);
  }

  updateVendor(id: string, updates: Partial<Vendor>): Observable<Vendor> {
    return this.update(id, updates);
  }

  toggleStatus(id: string, isActive: boolean): Observable<Vendor> {
    return this.update(id, { isActive });
  }

  pingVendor(id: string): Observable<Vendor> {
    return this.api.patch<Vendor>(`${this.endpoint}/${id}/ping`, {});
  }

  deleteVendor(id: string): Observable<void> {
    return this.delete(id);
  }
}
