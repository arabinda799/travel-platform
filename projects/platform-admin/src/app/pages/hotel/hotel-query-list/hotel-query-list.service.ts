import { Injectable } from '@angular/core';
import { BaseApiCrudService } from 'admin-core';

export interface HotelQuery {
  id: number;
  queryId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  queryType: 'Price Inquiry' | 'Availability Check' | 'Room Upgrade Request' | 'Special Request' | 'Complaint' | 'Feedback' | 'Cancellation Request';
  queryStatus: 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Pending';
  hotel: string;
  city: string;
  checkIn: string;
  checkOut: string;
  pax: string;
  message: string;
  response: string;
  assignedStaff: string;
  source: 'Website' | 'Email' | 'Phone' | 'WhatsApp' | 'App';
  createdDate: string;
  updatedDate: string;
}

@Injectable({ providedIn: 'root' })
export class HotelQueryListService extends BaseApiCrudService<HotelQuery> {
  protected readonly endpoint = '/hotel-queries';

  updateStatus(ids: (number | string)[], status: string) {
    return this.api.patch<HotelQuery[]>(`${this.endpoint}/bulk-status`, { ids, status });
  }
}
