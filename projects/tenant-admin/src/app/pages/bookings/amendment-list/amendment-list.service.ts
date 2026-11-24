import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BaseApiCrudService } from 'admin-core';

export interface Amendment {
  id: number | string;
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
  readonly amendments = this.items;

  constructor() {
    super();
    this.load();
  }

  updateMultipleStatus(ids: (number | string)[], status: Amendment['amendmentStatus']): Observable<Amendment[]> {
    return this.api.patch<Amendment[]>(`${this.endpoint}/bulk-status`, { ids, status }).pipe(
      tap(() => {
        const idSet = new Set(ids.map(String));
        this._items.update(list => list.map(a => (idSet.has(String(a.id)) ? { ...a, amendmentStatus: status } : a)));
      })
    );
  }
}
