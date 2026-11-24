import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiCrudService } from 'admin-core';

export interface TrendingDestination {
  id: string;
  tenantId?: string;
  name: string;
  subtitle: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class TrendingDestinationsService extends BaseApiCrudService<TrendingDestination> {
  protected readonly endpoint = '/hotel/trending/admin';
  readonly destinations = this.items;

  constructor() {
    super();
    this.load();
  }

  override add(payload: Partial<TrendingDestination>): Observable<TrendingDestination> {
    const req$ = super.add(payload);
    req$.subscribe();
    return req$;
  }

  override update(id: string | number, changes: Partial<TrendingDestination>): Observable<TrendingDestination> {
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

  updateStatus(id: string | number, isActive: boolean): Observable<TrendingDestination> {
    return this.update(id, { isActive } as Partial<TrendingDestination>);
  }
}
