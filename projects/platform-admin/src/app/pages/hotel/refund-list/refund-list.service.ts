import { Injectable } from '@angular/core';
import { BaseApiCrudService } from 'admin-core';

export interface RefundRecord {
  id: number;
  refundId: string;
  amendmentId: string;
  bookingId: string;
  amendmentType: 'Date Change' | 'Room Upgrade' | 'Guest Name Change' | 'Meal Plan Change' | 'Occupancy Change' | 'Full Cancellation';
  refundStatus: 'Processed' | 'Pending' | 'Initiated' | 'Failed';
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
export class RefundListService extends BaseApiCrudService<RefundRecord> {
  protected readonly endpoint = '/hotel-refunds';

  updateStatus(ids: (number | string)[], status: string) {
    return this.api.patch<RefundRecord[]>(`${this.endpoint}/bulk-status`, { ids, status });
  }
}
