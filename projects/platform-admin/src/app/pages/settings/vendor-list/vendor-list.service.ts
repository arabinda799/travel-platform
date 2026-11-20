import { Injectable, signal } from '@angular/core';

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

const STORAGE_KEY = 'easyflys_vendors_list';

const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'vnd-1',
    name: 'RateHawk',
    code: 'RATEHAWK',
    services: ['HOTEL'],
    mode: 'LIVE',
    apiUrl: 'https://api.ratehawk.com/api/b2b/v3',
    authType: 'BASIC_AUTH',
    credentials: {
      keyId: '16726',
      apiKey: '2072b4e6-0c5c-4062-aad4-53c860497dd9',
    },
    latencyMs: 310,
    healthStatus: 'Healthy',
    isActive: true,
    lastSync: '19 Nov 2026 / 05:40 PM',
  },
  {
    id: 'vnd-2',
    name: 'TripJack',
    code: 'TRIPJACK',
    services: ['HOTEL', 'FLIGHT'],
    mode: 'LIVE',
    apiUrl: 'https://api.tripjack.com/hms/v1',
    authType: 'API_KEY',
    credentials: {
      clientCode: 'TJ_CORP_9821',
      apiKey: 'tj_live_key_9948271a',
    },
    latencyMs: 275,
    healthStatus: 'Healthy',
    isActive: true,
    lastSync: '19 Nov 2026 / 05:35 PM',
  },
  {
    id: 'vnd-3',
    name: 'TBO Holidays',
    code: 'TBOHOLIDAYS',
    services: ['HOTEL', 'FLIGHT', 'HOLIDAY'],
    mode: 'TEST',
    apiUrl: 'https://api.tbotechnology.in/hotel/v2',
    authType: 'BASIC_AUTH',
    credentials: {
      username: 'TBO_SANDBOX_88',
      password: 'tbo_sec_884128',
    },
    latencyMs: 420,
    healthStatus: 'Healthy',
    isActive: true,
    lastSync: '18 Nov 2026 / 02:15 PM',
  },
  {
    id: 'vnd-4',
    name: 'Amadeus GDS',
    code: 'AMADEUS',
    services: ['FLIGHT'],
    mode: 'LIVE',
    apiUrl: 'https://api.amadeus.com/v1',
    authType: 'BEARER_TOKEN',
    credentials: {
      clientId: 'AMD_EASYFLYS_PROD',
      clientSecret: 'amd_oauth_secret_8819',
    },
    latencyMs: 195,
    healthStatus: 'Healthy',
    isActive: true,
    lastSync: '19 Nov 2026 / 05:42 PM',
  },
  {
    id: 'vnd-5',
    name: 'Hotelbeds',
    code: 'HOTELBEDS',
    services: ['HOTEL'],
    mode: 'TEST',
    apiUrl: 'https://api.test.hotelbeds.com/hotel-api/1.0',
    authType: 'API_KEY',
    credentials: {
      apiKey: 'hb_key_84920',
      secret: 'hb_sec_192837',
    },
    latencyMs: 490,
    healthStatus: 'Degraded',
    isActive: false,
    lastSync: '16 Nov 2026 / 11:10 AM',
  },
];

@Injectable({
  providedIn: 'root',
})
export class VendorListService {
  private readonly _vendors = signal<Vendor[]>(this.loadVendors());
  readonly vendors = this._vendors.asReadonly();

  private loadVendors(): Vendor[] {
    try {
      const data = sessionStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }
    this.saveToStorage(INITIAL_VENDORS);
    return INITIAL_VENDORS;
  }

  private saveToStorage(items: Vendor[]): void {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Fallback
    }
  }

  addVendor(payload: Omit<Vendor, 'id' | 'latencyMs' | 'healthStatus' | 'lastSync'>): Vendor {
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })} / ${now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })}`;

    const newVendor: Vendor = {
      ...payload,
      id: `vnd-${Date.now()}`,
      latencyMs: payload.mode === 'LIVE' ? Math.floor(Math.random() * 150) + 200 : Math.floor(Math.random() * 200) + 350,
      healthStatus: 'Healthy',
      lastSync: formattedDate,
    };

    const updated = [newVendor, ...this._vendors()];
    this._vendors.set(updated);
    this.saveToStorage(updated);
    return newVendor;
  }

  updateVendor(id: string, updates: Partial<Vendor>): Vendor | null {
    let updatedItem: Vendor | null = null;
    const updated = this._vendors().map(v => {
      if (v.id === id) {
        updatedItem = { ...v, ...updates };
        return updatedItem;
      }
      return v;
    });

    this._vendors.set(updated);
    this.saveToStorage(updated);
    return updatedItem;
  }

  toggleStatus(id: string, isActive: boolean): void {
    this.updateVendor(id, { isActive });
  }

  deleteVendor(id: string): void {
    const updated = this._vendors().filter(v => v.id !== id);
    this._vendors.set(updated);
    this.saveToStorage(updated);
  }

  bulkDelete(ids: string[]): void {
    const set = new Set(ids);
    const updated = this._vendors().filter(v => !set.has(v.id));
    this._vendors.set(updated);
    this.saveToStorage(updated);
  }

  pingVendor(vendor: Vendor): { success: boolean; latencyMs: number; message: string } {
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })} / ${now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })}`;

    const success = vendor.isActive;
    const latencyMs = Math.floor(Math.random() * 120) + 180;
    const healthStatus: VendorHealth = success ? (latencyMs < 400 ? 'Healthy' : 'Degraded') : 'Down';

    this.updateVendor(vendor.id, {
      latencyMs,
      healthStatus,
      lastSync: formattedDate,
    });

    return {
      success,
      latencyMs,
      message: success
        ? `Connection to ${vendor.name} (${vendor.mode}) verified successfully in ${latencyMs}ms.`
        : `${vendor.name} is currently inactive. Please enable it before running live inventory calls.`,
    };
  }
}
