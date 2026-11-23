import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiCrudService } from 'admin-core';

export interface PopularHotel {
  id: string;
  tenantId: string;
  title: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class PopularHotelsService extends BaseApiCrudService<PopularHotel> {
  protected readonly endpoint = '/popular-hotels';

  readonly hotels = this.items;

  override add(payload: Omit<PopularHotel, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Observable<PopularHotel> {
    return super.add(payload);
  }

  override update(id: string, changes: Partial<PopularHotel>): Observable<PopularHotel> {
    return super.update(id, changes);
  }

  override delete(id: string): Observable<void> {
    return super.delete(id);
  }

  bulkDelete(ids: string[]): Observable<void> {
    return this.deleteMultiple(ids);
  }

  updateStatus(id: string, isActive: boolean): Observable<PopularHotel> {
    return this.update(id, { isActive });
  }
}
