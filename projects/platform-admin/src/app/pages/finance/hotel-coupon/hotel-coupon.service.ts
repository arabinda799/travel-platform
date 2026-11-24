import { Injectable } from '@angular/core';
import { Observable, take, tap } from 'rxjs';
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

@Injectable({ providedIn: 'root' })
export class HotelCouponService extends BaseApiCrudService<HotelCoupon> {
  protected readonly endpoint = '/hotel-coupons';

  readonly coupons = this.items;

  addCoupon(payload: Omit<HotelCoupon, 'id' | 'usedCount' | 'createdAt'>): Observable<HotelCoupon> {
    return this.add(payload);
  }

  updateCoupon(id: string, updates: Partial<HotelCoupon>): Observable<HotelCoupon> {
    return this.update(id, updates);
  }

  deleteCoupon(id: string): Observable<void> {
    return this.delete(id);
  }

  override bulkDelete(ids: string[]): Observable<void> {
    return this.deleteMultiple(ids);
  }

  updateStatus(id: string, status: CouponStatus): Observable<HotelCoupon> {
    return this.update(id, { status });
  }
}
