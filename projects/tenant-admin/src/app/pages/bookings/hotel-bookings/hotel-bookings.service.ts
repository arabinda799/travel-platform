import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BaseApiCrudService } from 'admin-core';

export interface TenantHotelBooking {
  id: number | string;
  bookingRef: string;
  guestName: string;
  hotel: string;
  city: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  amount: number;
  commission?: number;
  paymentMethod: string;
  paymentStatus: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
  assignedUser: string;
  supplier: string;
  bookingDate: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Checked In' | 'Checked Out';
}

@Injectable({ providedIn: 'root' })
export class HotelBookingsService extends BaseApiCrudService<TenantHotelBooking> {
  protected readonly endpoint = '/hotel-bookings';
  readonly bookings = this.items;

  constructor() {
    super();
    this.load();
  }

  override deleteMultiple(ids: (string | number)[]): Observable<void> {
    const req$ = super.deleteMultiple(ids);
    req$.subscribe();
    return req$;
  }

  updateStatus(id: number | string, status: TenantHotelBooking['status']): Observable<TenantHotelBooking> {
    return this.update(id, { status } as Partial<TenantHotelBooking>);
  }

  updateMultipleStatus(ids: (number | string)[], status: TenantHotelBooking['status']): Observable<TenantHotelBooking[]> {
    const req$ = this.api.patch<TenantHotelBooking[]>(`${this.endpoint}/bulk-status`, { ids, status }).pipe(
      tap(() => {
        const idSet = new Set(ids.map(String));
        this._items.update(list => list.map(b => (idSet.has(String(b.id)) ? { ...b, status } : b)));
      })
    );
    req$.subscribe();
    return req$;
  }
}
