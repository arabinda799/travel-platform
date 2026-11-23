import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

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

const STORAGE_KEY = 'tenant_admin_vendors';

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
export class VendorListService {
  private readonly _items = signal<Vendor[]>(this.loadFromStorage());
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly vendors = this.items;
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  private loadFromStorage(): Vendor[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Vendor[];
    } catch { /* ignore */ }
    this.persist(INITIAL_VENDORS);
    return INITIAL_VENDORS;
  }

  private persist(items: Vendor[]): void {
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

  addVendor(payload: Omit<Vendor, 'id' | 'latencyMs' | 'healthStatus' | 'lastSync'>): Observable<Vendor> {
    const newItem: Vendor = {
      ...payload,
      id: `vnd-${Date.now()}`,
      latencyMs: Math.floor(100 + Math.random() * 150),
      healthStatus: 'Healthy',
      lastSync: this.formatNow(),
    };
    const updated = [newItem, ...this._items()];
    this._items.set(updated);
    this.persist(updated);
    return of(newItem);
  }

  updateVendor(id: string, updates: Partial<Vendor>): Observable<Vendor> {
    const list = this._items();
    const idx = list.findIndex(v => v.id === id);
    if (idx !== -1) {
      const updatedItem = { ...list[idx], ...updates, lastSync: this.formatNow() };
      const updated = [...list];
      updated[idx] = updatedItem;
      this._items.set(updated);
      this.persist(updated);
      return of(updatedItem);
    }
    return of(list[0]);
  }

  toggleStatus(id: string, isActive: boolean): Observable<Vendor> {
    return this.updateVendor(id, { isActive });
  }

  pingVendor(id: string): Observable<Vendor> {
    const latency = Math.floor(80 + Math.random() * 120);
    return this.updateVendor(id, { latencyMs: latency, healthStatus: 'Healthy' });
  }

  deleteVendor(id: string): Observable<void> {
    const updated = this._items().filter(v => v.id !== id);
    this._items.set(updated);
    this.persist(updated);
    return of(void 0);
  }

  bulkDelete(ids: string[]): Observable<void> {
    const set = new Set(ids);
    const updated = this._items().filter(v => !set.has(v.id));
    this._items.set(updated);
    this.persist(updated);
    return of(void 0);
  }
}
