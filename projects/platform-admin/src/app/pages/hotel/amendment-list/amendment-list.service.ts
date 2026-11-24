import { Injectable } from '@angular/core';
import { BaseApiCrudService } from 'admin-core';

export interface Amendment {
  id: number;
  amendmentId: string;
  bookingId: string;
  amendmentType: 'Date Change' | 'Room Upgrade' | 'Guest Name Change' | 'Meal Plan Change' | 'Occupancy Change';
  amendmentStatus: 'Approved' | 'Pending' | 'Rejected' | 'In Review';
  bookingStatus: 'Confirmed' | 'Pending' | 'Cancelled' | 'Checked In' | 'Checked Out';
  bookingAmount: number;
  hotel: string;
  guest: string;
  pax: string;
  checkIn: string;
  checkOut: string;
  city: string;
  assignedStaff: string;
  bookingDate: string;
  createdDate: string;
}

@Injectable({ providedIn: 'root' })
export class AmendmentListService extends BaseApiCrudService<Amendment> {
  protected readonly endpoint = '/hotel-amendments';

  updateStatus(ids: (number | string)[], status: string) {
    return this.api.patch<Amendment[]>(`${this.endpoint}/bulk-status`, { ids, status });
  }
}
