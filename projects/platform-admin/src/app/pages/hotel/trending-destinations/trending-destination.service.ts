import { Injectable } from '@angular/core';
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
}

@Injectable({ providedIn: 'root' })
export class TrendingDestinationService extends BaseApiCrudService<TrendingDestination> {
  protected readonly endpoint = '/hotel/trending/admin';
  readonly destinations = this.items;
}
