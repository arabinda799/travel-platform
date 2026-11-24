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

@Injectable({ providedIn: 'root' })
export class HotelPricingService {
  private readonly api = inject(ApiService);

  private readonly _markups = signal<HotelMarkup[]>([]);
  private readonly _discounts = signal<HotelDiscount[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly markups = this._markups.asReadonly();
  readonly discounts = this._discounts.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // ─── Markups ──────────────────────────────────────────────────────────────

  loadMarkups(): void {
    this._loading.set(true);
    this.api.get<any>('/hotel-markups').pipe(take(1)).subscribe({
      next: res => {
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        this._markups.set(data);
        this._loading.set(false);
      },
      error: (err: unknown) => {
        this._error.set((err as { error?: { message?: string } })?.error?.message ?? 'Failed to load markups');
        this._loading.set(false);
      },
    });
  }

  loadDiscounts(): void {
    this.api.get<any>('/hotel-discounts').pipe(take(1)).subscribe({
      next: res => {
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        this._discounts.set(data);
      },
      error: () => {},
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
