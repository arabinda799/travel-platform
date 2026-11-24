import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiCrudService } from 'admin-core';

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
export class HotelCouponService extends BaseApiCrudService<HotelCoupon> {
  protected readonly endpoint = '/hotel-coupons';
  readonly coupons = this.items;

  constructor() {
    super();
    this.load();
  }

  addCoupon(payload: Omit<HotelCoupon, 'id' | 'usedCount' | 'createdAt'>): Observable<HotelCoupon> {
    return this.add(payload);
  }

  updateCoupon(id: string, updates: Partial<HotelCoupon>): Observable<HotelCoupon> {
    return this.update(id, updates);
  }

  deleteCoupon(id: string): Observable<void> {
    return this.delete(id);
  }
}
