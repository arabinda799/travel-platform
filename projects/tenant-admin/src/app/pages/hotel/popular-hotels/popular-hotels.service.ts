import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiCrudService } from 'admin-core';

export interface PopularHotel {
  id: string;
  tenantId?: string;
  title: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class PopularHotelsService extends BaseApiCrudService<PopularHotel> {
  protected readonly endpoint = '/hotel/popular/admin';
  readonly hotels = this.items;

  constructor() {
    super();
    this.load();
  }

  override add(payload: Partial<PopularHotel>): Observable<PopularHotel> {
    const req$ = super.add(payload);
    req$.subscribe();
    return req$;
  }

  override update(id: string | number, changes: Partial<PopularHotel>): Observable<PopularHotel> {
    const req$ = super.update(id, changes);
    req$.subscribe();
    return req$;
  }

  override delete(id: string | number): Observable<void> {
    const req$ = super.delete(id);
    req$.subscribe();
    return req$;
  }

  override bulkDelete(ids: (string | number)[]): Observable<void> {
    const req$ = this.deleteMultiple(ids);
    req$.subscribe();
    return req$;
  }

  updateStatus(id: string | number, isActive: boolean): Observable<PopularHotel> {
    return this.update(id, { isActive } as Partial<PopularHotel>);
  }
}
