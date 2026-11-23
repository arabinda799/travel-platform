import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

export type CouponType = 'Fixed' | 'Percentage';
export type CouponStatus = 'Active' | 'Inactive';
export type ShowOnList = 'Yes' | 'No';

export interface HotelCoupon {
  id: string;
  couponCode: string;
  couponText: string;
  imageUrl: string;
  regionType: string;
  starRating: string;
  checkInDate: string;
  checkOutDate: string;
  couponType: CouponType;
  value: number;
  couponUseLimit: number;
  usedCount: number;
  couponMaxLimit: number;
  showOnList: ShowOnList;
  status: CouponStatus;
  validFromDate: string;
  validToDate: string;
  createdAt: string;
}

const STORAGE_KEY = 'tenant_admin_hotel_coupons';

const INITIAL_COUPONS: HotelCoupon[] = [
  {
    id: 'cp-1',
    couponCode: 'HOTEL10',
    couponText: 'Get 10% instant savings on luxury domestic hotel bookings',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80',
    regionType: 'Domestic',
    starRating: '4 Star, 5 Star',
    checkInDate: '2026-01-01',
    checkOutDate: '2026-12-31',
    couponType: 'Percentage',
    value: 10,
    couponUseLimit: 150,
    usedCount: 42,
    couponMaxLimit: 2500,
    showOnList: 'Yes',
    status: 'Active',
    validFromDate: '2026-01-01',
    validToDate: '2026-12-31',
    createdAt: '2026-01-01 / 10:00 AM',
  },
  {
    id: 'cp-2',
    couponCode: 'FLAT500',
    couponText: 'Flat ₹500 discount on all confirmed hotel bookings',
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80',
    regionType: 'All',
    starRating: 'All',
    checkInDate: '2026-01-15',
    checkOutDate: '2026-08-31',
    couponType: 'Fixed',
    value: 500,
    couponUseLimit: 200,
    usedCount: 88,
    couponMaxLimit: 500,
    showOnList: 'Yes',
    status: 'Active',
    validFromDate: '2026-01-15',
    validToDate: '2026-08-31',
    createdAt: '2026-01-15 / 11:30 AM',
  },
  {
    id: 'cp-3',
    couponCode: 'SUMMER25',
    couponText: 'Summer holiday special: 25% off on resort stays in Goa & Bali',
    imageUrl: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&q=80',
    regionType: 'International',
    starRating: '5 Star',
    checkInDate: '2026-04-01',
    checkOutDate: '2026-07-31',
    couponType: 'Percentage',
    value: 25,
    couponUseLimit: 100,
    usedCount: 15,
    couponMaxLimit: 4000,
    showOnList: 'Yes',
    status: 'Active',
    validFromDate: '2026-04-01',
    validToDate: '2026-07-31',
    createdAt: '2026-02-10 / 02:20 PM',
  },
  {
    id: 'cp-4',
    couponCode: 'WINTERSAVE',
    couponText: 'Early bird winter discount for mountain getaways',
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80',
    regionType: 'Domestic',
    starRating: '3 Star, 4 Star',
    checkInDate: '2026-10-01',
    checkOutDate: '2026-12-31',
    couponType: 'Fixed',
    value: 1200,
    couponUseLimit: 50,
    usedCount: 0,
    couponMaxLimit: 1200,
    showOnList: 'No',
    status: 'Inactive',
    validFromDate: '2026-10-01',
    validToDate: '2026-12-31',
    createdAt: '2026-03-01 / 04:45 PM',
  },
];

@Injectable({ providedIn: 'root' })
export class HotelCouponService {
  private readonly _items = signal<HotelCoupon[]>(this.loadFromStorage());
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly items = this._items.asReadonly();
  readonly coupons = this.items;
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  private loadFromStorage(): HotelCoupon[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as HotelCoupon[];
    } catch { /* ignore */ }
    this.persist(INITIAL_COUPONS);
    return INITIAL_COUPONS;
  }

  private persist(items: HotelCoupon[]): void {
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

  add(payload: Omit<HotelCoupon, 'id' | 'usedCount' | 'createdAt'>): Observable<HotelCoupon> {
    const newItem: HotelCoupon = {
      ...payload,
      id: `cp-${Date.now()}`,
      usedCount: 0,
      createdAt: this.formatNow(),
    };
    const updated = [newItem, ...this._items()];
    this._items.set(updated);
    this.persist(updated);
    return of(newItem);
  }

  addCoupon(payload: Omit<HotelCoupon, 'id' | 'usedCount' | 'createdAt'>): Observable<HotelCoupon> {
    return this.add(payload);
  }

  update(id: string, updates: Partial<HotelCoupon>): Observable<HotelCoupon> {
    const list = this._items();
    const idx = list.findIndex(c => c.id === id);
    if (idx !== -1) {
      const updatedItem = { ...list[idx], ...updates };
      const updated = [...list];
      updated[idx] = updatedItem;
      this._items.set(updated);
      this.persist(updated);
      return of(updatedItem);
    }
    return of(list[0]);
  }

  updateCoupon(id: string, updates: Partial<HotelCoupon>): Observable<HotelCoupon> {
    return this.update(id, updates);
  }

  delete(id: string): Observable<void> {
    const updated = this._items().filter(c => c.id !== id);
    this._items.set(updated);
    this.persist(updated);
    return of(void 0);
  }

  deleteCoupon(id: string): Observable<void> {
    return this.delete(id);
  }

  deleteMultiple(ids: string[]): Observable<void> {
    const set = new Set(ids);
    const updated = this._items().filter(c => !set.has(c.id));
    this._items.set(updated);
    this.persist(updated);
    return of(void 0);
  }

  bulkDelete(ids: string[]): Observable<void> {
    return this.deleteMultiple(ids);
  }
}
