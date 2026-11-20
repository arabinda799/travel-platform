import { Injectable, signal } from '@angular/core';

export interface CouponLog {
  id: string;
  couponCode: string;
  usedBy: string;
  email: string;
  bookingId: string;
  discountAmount: number;
  discountType: 'Flat' | 'Percentage';
  status: 'Applied' | 'Expired' | 'Invalid' | 'Limit Reached';
  usedAt: string;
}

const STORAGE_KEY = 'platform_coupon_logs';

const INITIAL_LOGS: CouponLog[] = [
  { id: 'cl-1', couponCode: 'SUMMER20', usedBy: 'Priya Sharma', email: 'priya.sharma@gmail.com', bookingId: 'BK-2026-90432', discountAmount: 20, discountType: 'Percentage', status: 'Applied', usedAt: '19 Nov 2026 / 10:30 AM' },
  { id: 'cl-2', couponCode: 'FLAT500', usedBy: 'Rahul Mehta', email: 'rahulmehta@outlook.com', bookingId: 'BK-2026-90118', discountAmount: 500, discountType: 'Flat', status: 'Applied', usedAt: '19 Nov 2026 / 09:15 AM' },
  { id: 'cl-3', couponCode: 'NEWUSER200', usedBy: 'Sneha Patel', email: 'sneha.patel@gmail.com', bookingId: 'BK-2026-89975', discountAmount: 200, discountType: 'Flat', status: 'Applied', usedAt: '18 Nov 2026 / 05:45 PM' },
  { id: 'cl-4', couponCode: 'DIWALI25', usedBy: 'Arun Kumar', email: 'arun.k@travelcorp.in', bookingId: 'BK-2026-89802', discountAmount: 25, discountType: 'Percentage', status: 'Expired', usedAt: '18 Nov 2026 / 03:20 PM' },
  { id: 'cl-5', couponCode: 'HOTELOFF15', usedBy: 'Meena Nair', email: 'meena.nair@gmail.com', bookingId: 'BK-2026-89650', discountAmount: 15, discountType: 'Percentage', status: 'Applied', usedAt: '17 Nov 2026 / 02:00 PM' },
  { id: 'cl-6', couponCode: 'FLAT1000', usedBy: 'Vikram Singh', email: 'vikram.singh@voyageur.co', bookingId: 'BK-2026-89401', discountAmount: 1000, discountType: 'Flat', status: 'Applied', usedAt: '17 Nov 2026 / 11:45 AM' },
  { id: 'cl-7', couponCode: 'CORP10', usedBy: 'Johnathan Miller', email: 'j.miller@voyagepartner.com', bookingId: 'BK-2026-89200', discountAmount: 10, discountType: 'Percentage', status: 'Invalid', usedAt: '16 Nov 2026 / 04:30 PM' },
  { id: 'cl-8', couponCode: 'SUMMER20', usedBy: 'Kavita Chawla', email: 'kavitac@voyageur.co', bookingId: 'BK-2026-88990', discountAmount: 20, discountType: 'Percentage', status: 'Limit Reached', usedAt: '16 Nov 2026 / 01:10 PM' },
  { id: 'cl-9', couponCode: 'FLAT500', usedBy: 'Rohit Wanderlust', email: 'rohit.wanderlust@gmail.com', bookingId: 'BK-2026-88750', discountAmount: 500, discountType: 'Flat', status: 'Applied', usedAt: '15 Nov 2026 / 10:55 AM' },
  { id: 'cl-10', couponCode: 'MONSOON30', usedBy: 'Deepa Iyer', email: 'deepa.iyer@gmail.com', bookingId: 'BK-2026-88500', discountAmount: 30, discountType: 'Percentage', status: 'Expired', usedAt: '14 Nov 2026 / 07:30 PM' },
  { id: 'cl-11', couponCode: 'NEWUSER200', usedBy: 'Arjun Reddy', email: 'arjun.reddy@gmail.com', bookingId: 'BK-2026-88301', discountAmount: 200, discountType: 'Flat', status: 'Applied', usedAt: '13 Nov 2026 / 03:15 PM' },
  { id: 'cl-12', couponCode: 'WEEKENDDEAL', usedBy: 'Pooja Desai', email: 'pooja.d@outlook.com', bookingId: 'BK-2026-88100', discountAmount: 750, discountType: 'Flat', status: 'Invalid', usedAt: '12 Nov 2026 / 11:00 AM' },
];

@Injectable({ providedIn: 'root' })
export class CouponLogsService {
  private readonly _logs = signal<CouponLog[]>(this.load());
  readonly logs = this._logs.asReadonly();

  private load(): CouponLog[] {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as CouponLog[];
    } catch { /* ignore */ }
    this.persist(INITIAL_LOGS);
    return INITIAL_LOGS;
  }

  private persist(items: CouponLog[]): void {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }

  delete(id: string): void {
    const updated = this._logs().filter(l => l.id !== id);
    this._logs.set(updated);
    this.persist(updated);
  }

  bulkDelete(ids: string[]): void {
    const set = new Set(ids);
    const updated = this._logs().filter(l => !set.has(l.id));
    this._logs.set(updated);
    this.persist(updated);
  }
}
