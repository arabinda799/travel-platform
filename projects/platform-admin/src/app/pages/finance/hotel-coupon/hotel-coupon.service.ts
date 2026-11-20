import { Injectable, signal } from '@angular/core';

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

const STORAGE_KEY = 'easyflys_hotel_coupons';

const INITIAL_COUPONS: HotelCoupon[] = [
  {
    id: 'cpn-1',
    couponCode: 'SUMMER500',
    couponText: 'Flat ₹500 off on 4-star & 5-star domestic hotels',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
    regionType: 'Domestic',
    starRating: '4 Star, 5 Star',
    checkInDate: '2026-11-20',
    checkOutDate: '2027-01-31',
    couponType: 'Fixed',
    value: 500,
    couponUseLimit: 200,
    usedCount: 54,
    couponMaxLimit: 500,
    showOnList: 'Yes',
    status: 'Active',
    validFromDate: '2026-11-01',
    validToDate: '2026-12-31',
    createdAt: '15 Nov 2026 / 10:20 AM',
  },
  {
    id: 'cpn-2',
    couponCode: 'LUXURY15',
    couponText: 'Get 15% discount up to ₹2,500 on international luxury resorts',
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80',
    regionType: 'International',
    starRating: '5 Star',
    checkInDate: '2026-12-01',
    checkOutDate: '2027-03-31',
    couponType: 'Percentage',
    value: 15,
    couponUseLimit: 100,
    usedCount: 28,
    couponMaxLimit: 2500,
    showOnList: 'Yes',
    status: 'Active',
    validFromDate: '2026-11-10',
    validToDate: '2027-01-15',
    createdAt: '10 Nov 2026 / 03:45 PM',
  },
  {
    id: 'cpn-3',
    couponCode: 'CODE3a02d65f8',
    couponText: 'Exclusive ₹1,000 off on partner beach villas',
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80',
    regionType: 'Domestic',
    starRating: '3 Star, 4 Star',
    checkInDate: '2026-11-15',
    checkOutDate: '2026-12-25',
    couponType: 'Fixed',
    value: 1000,
    couponUseLimit: 50,
    usedCount: 19,
    couponMaxLimit: 1000,
    showOnList: 'No',
    status: 'Active',
    validFromDate: '2026-11-01',
    validToDate: '2026-11-30',
    createdAt: '05 Nov 2026 / 09:15 AM',
  },
  {
    id: 'cpn-4',
    couponCode: 'WEEKEND10',
    couponText: '10% off for weekend staycations (Max ₹1,000)',
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80',
    regionType: 'All',
    starRating: 'All',
    checkInDate: '2026-11-01',
    checkOutDate: '2026-12-31',
    couponType: 'Percentage',
    value: 10,
    couponUseLimit: 300,
    usedCount: 142,
    couponMaxLimit: 1000,
    showOnList: 'Yes',
    status: 'Active',
    validFromDate: '2026-10-15',
    validToDate: '2026-12-31',
    createdAt: '01 Nov 2026 / 11:00 AM',
  },
  {
    id: 'cpn-5',
    couponCode: 'DIWALI25',
    couponText: 'Festive season 25% off on select hotel bookings',
    imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80',
    regionType: 'Domestic',
    starRating: 'All',
    checkInDate: '2026-10-20',
    checkOutDate: '2026-11-05',
    couponType: 'Percentage',
    value: 25,
    couponUseLimit: 150,
    usedCount: 150,
    couponMaxLimit: 2000,
    showOnList: 'No',
    status: 'Inactive',
    validFromDate: '2026-10-15',
    validToDate: '2026-11-05',
    createdAt: '12 Oct 2026 / 04:30 PM',
  },
];

@Injectable({
  providedIn: 'root',
})
export class HotelCouponService {
  private readonly _coupons = signal<HotelCoupon[]>(this.loadCoupons());
  readonly coupons = this._coupons.asReadonly();

  private loadCoupons(): HotelCoupon[] {
    try {
      const data = sessionStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }
    this.saveToStorage(INITIAL_COUPONS);
    return INITIAL_COUPONS;
  }

  private saveToStorage(items: HotelCoupon[]): void {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Fallback
    }
  }

  addCoupon(payload: Omit<HotelCoupon, 'id' | 'usedCount' | 'createdAt'>): HotelCoupon {
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

    const newCoupon: HotelCoupon = {
      ...payload,
      id: `cpn-${Date.now()}`,
      usedCount: 0,
      createdAt: formattedDate,
    };

    const updated = [newCoupon, ...this._coupons()];
    this._coupons.set(updated);
    this.saveToStorage(updated);
    return newCoupon;
  }

  updateCoupon(id: string, updates: Partial<HotelCoupon>): HotelCoupon | null {
    let updatedItem: HotelCoupon | null = null;
    const updated = this._coupons().map(c => {
      if (c.id === id) {
        updatedItem = { ...c, ...updates };
        return updatedItem;
      }
      return c;
    });

    this._coupons.set(updated);
    this.saveToStorage(updated);
    return updatedItem;
  }

  deleteCoupon(id: string): void {
    const updated = this._coupons().filter(c => c.id !== id);
    this._coupons.set(updated);
    this.saveToStorage(updated);
  }

  bulkDelete(ids: string[]): void {
    const set = new Set(ids);
    const updated = this._coupons().filter(c => !set.has(c.id));
    this._coupons.set(updated);
    this.saveToStorage(updated);
  }

  updateStatus(id: string, status: CouponStatus): void {
    this.updateCoupon(id, { status });
  }
}
