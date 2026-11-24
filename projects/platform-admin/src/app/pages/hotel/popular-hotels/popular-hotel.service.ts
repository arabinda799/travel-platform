import { Injectable } from '@angular/core';
import { BaseApiCrudService } from 'admin-core';

export interface PopularHotel {
  id: string;
  tenantId: string;
  title: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class PopularHotelService extends BaseApiCrudService<PopularHotel> {
  protected readonly endpoint = '/hotel/popular/admin';
  readonly hotels = this.items;
}
