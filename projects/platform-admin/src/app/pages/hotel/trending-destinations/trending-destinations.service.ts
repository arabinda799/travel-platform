import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiCrudService } from 'admin-core';

export interface TrendingDestination {
  id: string;
  tenantId: string;
  name: string;
  subtitle: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class TrendingDestinationsService extends BaseApiCrudService<TrendingDestination> {
  protected readonly endpoint = '/trending-destinations';

  readonly destinations = this.items;

  override add(payload: Omit<TrendingDestination, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Observable<TrendingDestination> {
    return super.add(payload);
  }

  override update(id: string, changes: Partial<TrendingDestination>): Observable<TrendingDestination> {
    return super.update(id, changes);
  }

  override delete(id: string): Observable<void> {
    return super.delete(id);
  }

  bulkDelete(ids: string[]): Observable<void> {
    return this.deleteMultiple(ids);
  }

  updateStatus(id: string, isActive: boolean): Observable<TrendingDestination> {
    return this.update(id, { isActive });
  }
}
