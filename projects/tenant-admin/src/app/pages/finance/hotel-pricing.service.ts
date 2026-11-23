import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

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
    this._markups.set(this.loadMarkupsFromStorage());
  }

  addMarkup(data: Omit<HotelMarkup, 'id' | 'createdDate' | 'updatedDate'>): Observable<HotelMarkup> {
    const newItem: HotelMarkup = {
      ...data,
      id: `mk-${Date.now()}`,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
    };
    const updated = [newItem, ...this._markups()];
    this._markups.set(updated);
    this.persistMarkups(updated);
    return of(newItem);
  }

  updateMarkup(id: string, updates: Partial<HotelMarkup>): Observable<HotelMarkup> {
    const list = this._markups();
    const idx = list.findIndex(m => m.id === id);
    if (idx !== -1) {
      const updatedItem: HotelMarkup = { ...list[idx], ...updates, updatedDate: new Date().toISOString() };
      const updated = [...list];
      updated[idx] = updatedItem;
      this._markups.set(updated);
      this.persistMarkups(updated);
      return of(updatedItem);
    }
    return of(list[0]);
  }

  updateMultipleMarkupStatus(ids: string[], status: 'Active' | 'Inactive'): Observable<HotelMarkup[]> {
    const set = new Set(ids);
    const updated = this._markups().map(m => set.has(m.id) ? { ...m, status, updatedDate: new Date().toISOString() } : m);
    this._markups.set(updated);
    this.persistMarkups(updated);
    return of(updated.filter(m => set.has(m.id)));
  }

  deleteMarkup(id: string): Observable<void> {
    const updated = this._markups().filter(m => m.id !== id);
    this._markups.set(updated);
    this.persistMarkups(updated);
    return of(void 0);
  }

  bulkDeleteMarkups(ids: string[]): Observable<void> {
    const set = new Set(ids);
    const updated = this._markups().filter(m => !set.has(m.id));
    this._markups.set(updated);
    this.persistMarkups(updated);
    return of(void 0);
  }

  // ─── Discounts ────────────────────────────────────────────────────────────

  loadDiscounts(): void {
    this._discounts.set(this.loadDiscountsFromStorage());
  }

  addDiscount(data: Omit<HotelDiscount, 'id' | 'createdDate' | 'updatedDate'>): Observable<HotelDiscount> {
    const newItem: HotelDiscount = {
      ...data,
      id: `disc-${Date.now()}`,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
    };
    const updated = [newItem, ...this._discounts()];
    this._discounts.set(updated);
    this.persistDiscounts(updated);
    return of(newItem);
  }

  updateDiscount(id: string, updates: Partial<HotelDiscount>): Observable<HotelDiscount> {
    const list = this._discounts();
    const idx = list.findIndex(d => d.id === id);
    if (idx !== -1) {
      const updatedItem: HotelDiscount = { ...list[idx], ...updates, updatedDate: new Date().toISOString() };
      const updated = [...list];
      updated[idx] = updatedItem;
      this._discounts.set(updated);
      this.persistDiscounts(updated);
      return of(updatedItem);
    }
    return of(list[0]);
  }

  updateMultipleDiscountStatus(ids: string[], status: 'Active' | 'Inactive'): Observable<HotelDiscount[]> {
    const set = new Set(ids);
    const updated = this._discounts().map(d => set.has(d.id) ? { ...d, status, updatedDate: new Date().toISOString() } : d);
    this._discounts.set(updated);
    this.persistDiscounts(updated);
    return of(updated.filter(d => set.has(d.id)));
  }

  deleteDiscount(id: string): Observable<void> {
    const updated = this._discounts().filter(d => d.id !== id);
    this._discounts.set(updated);
    this.persistDiscounts(updated);
    return of(void 0);
  }

  bulkDeleteDiscounts(ids: string[]): Observable<void> {
    const set = new Set(ids);
    const updated = this._discounts().filter(d => !set.has(d.id));
    this._discounts.set(updated);
    this.persistDiscounts(updated);
    return of(void 0);
  }
}
