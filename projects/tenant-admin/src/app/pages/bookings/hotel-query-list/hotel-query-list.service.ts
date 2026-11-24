import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BaseApiCrudService } from 'admin-core';

export interface HotelQuery {
  id: number | string;
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
  readonly queries = this.items;

  constructor() {
    super();
    this.load();
  }

  override deleteMultiple(ids: (string | number)[]): Observable<void> {
    const req$ = super.deleteMultiple(ids);
    req$.subscribe();
    return req$;
  }

  updateMultipleStatus(ids: (number | string)[], status: HotelQuery['queryStatus']): Observable<HotelQuery[]> {
    const req$ = this.api.patch<HotelQuery[]>(`${this.endpoint}/bulk-status`, { ids, status }).pipe(
      tap(() => {
        const idSet = new Set(ids.map(String));
        this._items.update(list => list.map(q => (idSet.has(String(q.id)) ? { ...q, queryStatus: status } : q)));
      })
    );
    req$.subscribe();
    return req$;
  }
}
