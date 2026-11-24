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

@Injectable({ providedIn: 'root' })
export class VendorListService extends BaseApiCrudService<Vendor> {
  protected readonly endpoint = '/vendor/admin';
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
