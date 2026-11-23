import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface CouponLog {
  id: string;
  couponCode: string;
  usedBy: string;
  email: string;
  bookingId: string;
  discountAmount: number;
  discountType: 'Percentage' | 'Flat';
  status: 'Applied' | 'Failed' | 'Expired';
  createdAt: string;
}

const STORAGE_KEY = 'tenant_admin_coupon_logs';

const INITIAL_COUPON_LOGS: CouponLog[] = [
  {
    id: 'cl-1',
    couponCode: 'HOTEL10',
    usedBy: 'Priya Sharma',
    email: 'priya.sharma@gmail.com',
    bookingId: 'EF-HTL-98001',
    discountAmount: 1450,
    discountType: 'Percentage',
    status: 'Applied',
    createdAt: '2026-11-23 / 11:30 AM',
  },
  {
    id: 'cl-2',
    couponCode: 'FLAT500',
    usedBy: 'Rahul Verma',
    email: 'rahul.verma@outlook.com',
    bookingId: 'EF-HTL-98014',
    discountAmount: 500,
    discountType: 'Flat',
    status: 'Applied',
    createdAt: '2026-11-22 / 04:15 PM',
  },
  {
    id: 'cl-3',
    couponCode: 'SUMMER25',
    usedBy: 'Mohammed Al-Mansoor',
    email: 'm.almansoor@travelnet.ae',
    bookingId: 'EF-HTL-98030',
    discountAmount: 3200,
    discountType: 'Percentage',
    status: 'Applied',
    createdAt: '2026-11-21 / 02:40 PM',
  },
  {
    id: 'cl-4',
    couponCode: 'EXPIRED50',
    usedBy: 'Anita Kapoor',
    email: 'anita.kapoor@yahoo.com',
    bookingId: 'EF-HTL-98055',
    discountAmount: 0,
    discountType: 'Percentage',
    status: 'Expired',
    createdAt: '2026-11-20 / 01:10 PM',
  },
];

@Injectable({ providedIn: 'root' })
export class CouponLogsService {
  private readonly _logs = signal<CouponLog[]>(this.loadFromStorage());
  private readonly _loading = signal<boolean>(false);

  readonly logs = this._logs.asReadonly();
  readonly loading = this._loading.asReadonly();

  private loadFromStorage(): CouponLog[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as CouponLog[];
    } catch { /* ignore */ }
    this.persist(INITIAL_COUPON_LOGS);
    return INITIAL_COUPON_LOGS;
  }

  private persist(items: CouponLog[]): void {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }

  load(): void {
    this._logs.set(this.loadFromStorage());
  }

  delete(id: string): Observable<void> {
    const updated = this._logs().filter(l => l.id !== id);
    this._logs.set(updated);
    this.persist(updated);
    return of(void 0);
  }

  bulkDelete(ids: string[]): Observable<void> {
    const set = new Set(ids);
    const updated = this._logs().filter(l => !set.has(l.id));
    this._logs.set(updated);
    this.persist(updated);
    return of(void 0);
  }
}
