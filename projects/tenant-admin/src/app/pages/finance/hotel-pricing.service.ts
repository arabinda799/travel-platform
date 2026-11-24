import { Injectable, inject, signal } from '@angular/core';
import { Observable, take, tap } from 'rxjs';
import { ApiService } from 'admin-core';

export type PricingTarget = 'B2B' | 'B2C' | 'Corporate' | 'All';
export type HotelMarkupType = 'Per Night' | 'Per Stay' | 'Percentage' | 'Fixed';
export type DisplayMarkup = 'In Tax' | 'In Room Rate' | 'Separate Line Item';

export const ALL_REGION_TYPES = [
  'Domestic',
  'International',
  'GCC & Middle East',
  'Asia-Pacific',
  'Europe',
  'North America',
];

export interface HotelMarkup {
  id: string;
  markupFor: PricingTarget;
  regionTypes: string[];
  hotelMarkupType: HotelMarkupType;
  displayMarkup: DisplayMarkup;
  value: number;
  status: 'Active' | 'Inactive';
  createdDate: string;
  updatedDate: string;
}

export interface HotelDiscount {
  id: string;
  markupFor: PricingTarget;
  regionTypes: string[];
  value: number;
  maxLimit: number | null;
  status: 'Active' | 'Inactive';
  createdDate: string;
  updatedDate: string;
}

const STORAGE_KEY_MARKUPS = 'tenant_admin_hotel_markups';
const STORAGE_KEY_DISCOUNTS = 'tenant_admin_hotel_discounts';

const INITIAL_MARKUPS: HotelMarkup[] = [
  {
    id: 'mk-1',
    markupFor: 'B2B',
    regionTypes: ['Domestic'],
    hotelMarkupType: 'Percentage',
    displayMarkup: 'In Room Rate',
    value: 5,
    status: 'Active',
    createdDate: '2026-01-10T10:00:00.000Z',
    updatedDate: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'mk-2',
    markupFor: 'B2C',
    regionTypes: ['International', 'Europe'],
    hotelMarkupType: 'Fixed',
    displayMarkup: 'Separate Line Item',
    value: 500,
    status: 'Active',
    createdDate: '2026-01-15T11:30:00.000Z',
    updatedDate: '2026-01-15T11:30:00.000Z',
  },
  {
    id: 'mk-3',
    markupFor: 'Corporate',
    regionTypes: ['Domestic', 'GCC & Middle East'],
    hotelMarkupType: 'Percentage',
    displayMarkup: 'In Tax',
    value: 3.5,
    status: 'Active',
    createdDate: '2026-02-01T09:15:00.000Z',
    updatedDate: '2026-02-01T09:15:00.000Z',
  },
  {
    id: 'mk-4',
    markupFor: 'All',
    regionTypes: ['Asia-Pacific'],
    hotelMarkupType: 'Per Night',
    displayMarkup: 'In Room Rate',
    value: 250,
    status: 'Active',
    createdDate: '2026-02-20T14:45:00.000Z',
    updatedDate: '2026-02-20T14:45:00.000Z',
  },
  {
    id: 'mk-5',
    markupFor: 'B2B',
    regionTypes: ['North America'],
    hotelMarkupType: 'Per Stay',
    displayMarkup: 'Separate Line Item',
    value: 1200,
    status: 'Inactive',
    createdDate: '2026-03-05T16:20:00.000Z',
    updatedDate: '2026-03-05T16:20:00.000Z',
  },
];

const INITIAL_DISCOUNTS: HotelDiscount[] = [
  {
    id: 'disc-1',
    markupFor: 'B2C',
    regionTypes: ['Domestic'],
    value: 10,
    maxLimit: 2000,
    status: 'Active',
    createdDate: '2026-01-12T10:00:00.000Z',
    updatedDate: '2026-01-12T10:00:00.000Z',
  },
  {
    id: 'disc-2',
    markupFor: 'Corporate',
    regionTypes: ['Domestic', 'GCC & Middle East'],
    value: 8,
    maxLimit: 3500,
    status: 'Active',
    createdDate: '2026-01-25T14:15:00.000Z',
    updatedDate: '2026-01-25T14:15:00.000Z',
  },
  {
    id: 'disc-3',
    markupFor: 'B2B',
    regionTypes: ['International', 'Europe'],
    value: 5,
    maxLimit: 5000,
    status: 'Active',
    createdDate: '2026-02-10T12:00:00.000Z',
    updatedDate: '2026-02-10T12:00:00.000Z',
  },
  {
    id: 'disc-4',
    markupFor: 'All',
    regionTypes: ['Asia-Pacific'],
    value: 12,
    maxLimit: 2500,
    status: 'Inactive',
    createdDate: '2026-03-01T15:30:00.000Z',
    updatedDate: '2026-03-01T15:30:00.000Z',
  },
];

@Injectable({ providedIn: 'root' })
export class HotelPricingService {
  private readonly api = inject(ApiService);
  private readonly _markups = signal<HotelMarkup[]>(this.loadMarkupsFromStorage());
  private readonly _discounts = signal<HotelDiscount[]>(this.loadDiscountsFromStorage());
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly markups = this._markups.asReadonly();
  readonly discounts = this._discounts.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  private loadMarkupsFromStorage(): HotelMarkup[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY_MARKUPS);
      if (raw) return JSON.parse(raw) as HotelMarkup[];
    } catch { /* ignore */ }
    this.persistMarkups(INITIAL_MARKUPS);
    return INITIAL_MARKUPS;
  }

  private persistMarkups(items: HotelMarkup[]): void {
    try { sessionStorage.setItem(STORAGE_KEY_MARKUPS, JSON.stringify(items)); } catch { /* ignore */ }
  }

  private loadDiscountsFromStorage(): HotelDiscount[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY_DISCOUNTS);
      if (raw) return JSON.parse(raw) as HotelDiscount[];
    } catch { /* ignore */ }
    this.persistDiscounts(INITIAL_DISCOUNTS);
    return INITIAL_DISCOUNTS;
  }

  private persistDiscounts(items: HotelDiscount[]): void {
    try { sessionStorage.setItem(STORAGE_KEY_DISCOUNTS, JSON.stringify(items)); } catch { /* ignore */ }
  }

  // ─── Markups ──────────────────────────────────────────────────────────────

  loadMarkups(): void {
    this._loading.set(true);
    this.api.get<any>('/hotel-markups').pipe(take(1)).subscribe({
      next: res => {
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        this._markups.set(data.length > 0 ? data : this.loadMarkupsFromStorage());
        this._loading.set(false);
      },
      error: () => {
        this._markups.set(this.loadMarkupsFromStorage());
        this._loading.set(false);
      },
    });
  }

  addMarkup(data: Omit<HotelMarkup, 'id' | 'createdDate' | 'updatedDate'>): Observable<HotelMarkup> {
    return this.api.post<HotelMarkup>('/hotel-markups', data).pipe(
      take(1),
      tap(created => this._markups.update(list => [created, ...list])),
    );
  }

  updateMarkup(id: string, updates: Partial<HotelMarkup>): Observable<HotelMarkup> {
    return this.api.patch<HotelMarkup>(`/hotel-markups/${id}`, updates).pipe(
      take(1),
      tap(updated => this._markups.update(list => list.map(m => m.id === id ? updated : m))),
    );
  }

  updateMultipleMarkupStatus(ids: string[], status: 'Active' | 'Inactive'): Observable<HotelMarkup[]> {
    return this.api.patch<HotelMarkup[]>('/hotel-markups/bulk-status', { ids, status }).pipe(
      take(1),
      tap(updated => {
        const map = new Map(updated.map(m => [m.id, m]));
        this._markups.update(list => list.map(m => map.get(m.id) ?? m));
      }),
    );
  }

  deleteMarkup(id: string): Observable<void> {
    return this.api.delete<void>(`/hotel-markups/${id}`).pipe(
      take(1),
      tap(() => this._markups.update(list => list.filter(m => m.id !== id))),
    );
  }

  bulkDeleteMarkups(ids: string[]): Observable<void> {
    return this.api.post<void>('/hotel-markups/bulk-delete', { ids }).pipe(
      take(1),
      tap(() => {
        const set = new Set(ids);
        this._markups.update(list => list.filter(m => !set.has(m.id)));
      }),
    );
  }

  // ─── Discounts ────────────────────────────────────────────────────────────

  loadDiscounts(): void {
    this.api.get<any>('/hotel-discounts').pipe(take(1)).subscribe({
      next: res => {
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        this._discounts.set(data.length > 0 ? data : this.loadDiscountsFromStorage());
      },
      error: () => this._discounts.set(this.loadDiscountsFromStorage()),
    });
  }

  addDiscount(data: Omit<HotelDiscount, 'id' | 'createdDate' | 'updatedDate'>): Observable<HotelDiscount> {
    return this.api.post<HotelDiscount>('/hotel-discounts', data).pipe(
      take(1),
      tap(created => this._discounts.update(list => [created, ...list])),
    );
  }

  updateDiscount(id: string, updates: Partial<HotelDiscount>): Observable<HotelDiscount> {
    return this.api.patch<HotelDiscount>(`/hotel-discounts/${id}`, updates).pipe(
      take(1),
      tap(updated => this._discounts.update(list => list.map(d => d.id === id ? updated : d))),
    );
  }

  updateMultipleDiscountStatus(ids: string[], status: 'Active' | 'Inactive'): Observable<HotelDiscount[]> {
    return this.api.patch<HotelDiscount[]>('/hotel-discounts/bulk-status', { ids, status }).pipe(
      take(1),
      tap(updated => {
        const map = new Map(updated.map(d => [d.id, d]));
        this._discounts.update(list => list.map(d => map.get(d.id) ?? d));
      }),
    );
  }

  deleteDiscount(id: string): Observable<void> {
    return this.api.delete<void>(`/hotel-discounts/${id}`).pipe(
      take(1),
      tap(() => this._discounts.update(list => list.filter(d => d.id !== id))),
    );
  }

  bulkDeleteDiscounts(ids: string[]): Observable<void> {
    return this.api.post<void>('/hotel-discounts/bulk-delete', { ids }).pipe(
      take(1),
      tap(() => {
        const set = new Set(ids);
        this._discounts.update(list => list.filter(d => !set.has(d.id)));
      }),
    );
  }
}
