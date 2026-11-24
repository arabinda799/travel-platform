import { Injectable } from '@angular/core';
import { BaseApiCrudService } from 'admin-core';

export interface Booking {
  id: number;
  bookingRef: string;
  guestName: string;
  hotel: string;
  city: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  amount: number;
  paymentMethod: string;
  paymentStatus: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
  assignedUser: string;
  supplier: string;
  bookingDate: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Checked In' | 'Checked Out';
}

@Injectable({ providedIn: 'root' })
export class HotelBookingsService extends BaseApiCrudService<Booking> {
  protected readonly endpoint = '/hotel-bookings';

  updateStatus(ids: (number | string)[], status: string) {
    return this.api.patch<Booking[]>(`${this.endpoint}/bulk-status`, { ids, status });
  }
}
