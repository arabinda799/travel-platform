import { Injectable, signal } from '@angular/core';

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

const INITIAL_MARKUPS: HotelMarkup[] = [
  {
    id: 'mk-1',
    markupFor: 'B2B',
    regionTypes: ['Domestic'],
    hotelMarkupType: 'Per Night',
    displayMarkup: 'In Tax',
    value: 250,
    status: 'Active',
    createdDate: '2026-01-10T11:30:00.000Z',
    updatedDate: '2026-02-01T09:15:00.000Z',
  },
  {
    id: 'mk-2',
    markupFor: 'B2B',
    regionTypes: ['International', 'GCC & Middle East'],
    hotelMarkupType: 'Percentage',
    displayMarkup: 'In Room Rate',
    value: 8.5,
    status: 'Active',
    createdDate: '2026-01-18T14:45:00.000Z',
    updatedDate: '2026-02-05T12:00:00.000Z',
  },
  {
    id: 'mk-3',
    markupFor: 'B2C',
    regionTypes: ['Domestic'],
    hotelMarkupType: 'Percentage',
    displayMarkup: 'In Tax',
    value: 12,
    status: 'Active',
    createdDate: '2026-01-22T16:20:00.000Z',
    updatedDate: '2026-02-08T15:30:00.000Z',
  },
  {
    id: 'mk-4',
    markupFor: 'Corporate',
    regionTypes: ['Domestic', 'Asia-Pacific'],
    hotelMarkupType: 'Fixed',
    displayMarkup: 'Separate Line Item',
    value: 500,
    status: 'Active',
    createdDate: '2026-02-01T10:15:00.000Z',
    updatedDate: '2026-02-12T11:45:00.000Z',
  },
  {
    id: 'mk-5',
    markupFor: 'All',
    regionTypes: ['Europe', 'North America'],
    hotelMarkupType: 'Percentage',
    displayMarkup: 'In Room Rate',
    value: 10,
    status: 'Inactive',
    createdDate: '2026-02-05T13:00:00.000Z',
    updatedDate: '2026-02-14T17:10:00.000Z',
  },
];

const INITIAL_DISCOUNTS: HotelDiscount[] = [
  {
    id: 'dc-1',
    markupFor: 'B2B',
    regionTypes: ['Domestic'],
    value: 5,
    maxLimit: 1500,
    status: 'Active',
    createdDate: '2026-01-12T10:00:00.000Z',
    updatedDate: '2026-02-02T11:20:00.000Z',
  },
  {
    id: 'dc-2',
    markupFor: 'B2B',
    regionTypes: ['International', 'GCC & Middle East'],
    value: 7.5,
    maxLimit: 3000,
    status: 'Active',
    createdDate: '2026-01-19T15:30:00.000Z',
    updatedDate: '2026-02-06T14:10:00.000Z',
  },
  {
    id: 'dc-3',
    markupFor: 'B2C',
    regionTypes: ['Domestic'],
    value: 10,
    maxLimit: 2000,
    status: 'Active',
    createdDate: '2026-01-25T12:15:00.000Z',
    updatedDate: '2026-02-09T16:40:00.000Z',
  },
  {
    id: 'dc-4',
    markupFor: 'Corporate',
    regionTypes: ['Domestic', 'Asia-Pacific'],
    value: 350,
    maxLimit: null,
    status: 'Active',
    createdDate: '2026-02-03T09:45:00.000Z',
    updatedDate: '2026-02-13T10:30:00.000Z',
  },
  {
    id: 'dc-5',
    markupFor: 'All',
    regionTypes: ['Europe'],
    value: 6,
    maxLimit: 2500,
    status: 'Inactive',
    createdDate: '2026-02-07T14:00:00.000Z',
    updatedDate: '2026-02-15T12:00:00.000Z',
  },
];

@Injectable({
  providedIn: 'root',
})
export class HotelPricingService {
  private readonly STORAGE_MARKUP_KEY = 'platform_admin_hotel_markups';
  private readonly STORAGE_DISCOUNT_KEY = 'platform_admin_hotel_discounts';

  private readonly _markups = signal<HotelMarkup[]>(this.loadMarkups());
  private readonly _discounts = signal<HotelDiscount[]>(this.loadDiscounts());

  readonly markups = this._markups.asReadonly();
  readonly discounts = this._discounts.asReadonly();

  private loadMarkups(): HotelMarkup[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_MARKUP_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // Fallback
    }
    return INITIAL_MARKUPS;
  }

  private loadDiscounts(): HotelDiscount[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_DISCOUNT_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // Fallback
    }
    return INITIAL_DISCOUNTS;
  }

  private persistMarkups(list: HotelMarkup[]): void {
    try {
      localStorage.setItem(this.STORAGE_MARKUP_KEY, JSON.stringify(list));
    } catch {
      // Storage error handle
    }
  }

  private persistDiscounts(list: HotelDiscount[]): void {
    try {
      localStorage.setItem(this.STORAGE_DISCOUNT_KEY, JSON.stringify(list));
    } catch {
      // Storage error handle
    }
  }

  // Hotel Markup Operations
  addMarkup(data: Omit<HotelMarkup, 'id' | 'createdDate' | 'updatedDate'>): HotelMarkup {
    const newMarkup: HotelMarkup = {
      ...data,
      id: `mk-${Date.now()}`,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
    };
    const updated = [newMarkup, ...this._markups()];
    this._markups.set(updated);
    this.persistMarkups(updated);
    return newMarkup;
  }

  updateMarkup(id: string, updates: Partial<HotelMarkup>): HotelMarkup {
    const list = this._markups();
    const idx = list.findIndex((m) => m.id === id);
    if (idx === -1) throw new Error(`Markup with ID ${id} not found`);

    const updatedItem: HotelMarkup = {
      ...list[idx],
      ...updates,
      updatedDate: new Date().toISOString(),
    };
    const updated = [...list];
    updated[idx] = updatedItem;
    this._markups.set(updated);
    this.persistMarkups(updated);
    return updatedItem;
  }

  deleteMarkup(id: string): void {
    const updated = this._markups().filter((m) => m.id !== id);
    this._markups.set(updated);
    this.persistMarkups(updated);
  }

  updateMultipleMarkupStatus(ids: string[], status: 'Active' | 'Inactive'): void {
    const set = new Set(ids);
    const updated = this._markups().map((m) => (set.has(m.id) ? { ...m, status, updatedDate: new Date().toISOString() } : m));
    this._markups.set(updated);
    this.persistMarkups(updated);
  }

  // Hotel Discount Operations
  addDiscount(data: Omit<HotelDiscount, 'id' | 'createdDate' | 'updatedDate'>): HotelDiscount {
    const newDiscount: HotelDiscount = {
      ...data,
      id: `dc-${Date.now()}`,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
    };
    const updated = [newDiscount, ...this._discounts()];
    this._discounts.set(updated);
    this.persistDiscounts(updated);
    return newDiscount;
  }

  updateDiscount(id: string, updates: Partial<HotelDiscount>): HotelDiscount {
    const list = this._discounts();
    const idx = list.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error(`Discount with ID ${id} not found`);

    const updatedItem: HotelDiscount = {
      ...list[idx],
      ...updates,
      updatedDate: new Date().toISOString(),
    };
    const updated = [...list];
    updated[idx] = updatedItem;
    this._discounts.set(updated);
    this.persistDiscounts(updated);
    return updatedItem;
  }

  deleteDiscount(id: string): void {
    const updated = this._discounts().filter((d) => d.id !== id);
    this._discounts.set(updated);
    this.persistDiscounts(updated);
  }

  updateMultipleDiscountStatus(ids: string[], status: 'Active' | 'Inactive'): void {
    const set = new Set(ids);
    const updated = this._discounts().map((d) => (set.has(d.id) ? { ...d, status, updatedDate: new Date().toISOString() } : d));
    this._discounts.set(updated);
    this.persistDiscounts(updated);
  }
}
